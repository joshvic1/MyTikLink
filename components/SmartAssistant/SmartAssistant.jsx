"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import ReactMarkdown from "react-markdown";
import {
  ArrowUpRight,
  Lightbulb,
  Link2,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import {
  getSmartAssistantActions,
  getSmartAssistantRoute,
} from "@/config/smartAssistantConfig";
import styles from "./SmartAssistant.module.css";

const STORAGE_KEY = "mytiklink_smart_assistant_messages";
const DISMISSED_KEY = "mytiklink_smart_assistant_dismissed";

export default function SmartAssistant() {
  const router = useRouter();
  const pathname = router.asPath?.split("?")[0] || router.pathname || "";
  const routeContext = useMemo(
    () => getSmartAssistantRoute(pathname),
    [pathname],
  );
  const quickActions = useMemo(
    () => getSmartAssistantActions(pathname),
    [pathname],
  );

  const [open, setOpen] = useState(false);
  const [nudgeOpen, setNudgeOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const latestAssistantRef = useRef(null);
  const lastRouteRef = useRef("");

  const latestAssistantActions = useMemo(() => {
    const latest = [...messages]
      .reverse()
      .find(
        (message) =>
          message.role !== "user" &&
          Array.isArray(message.actions) &&
          message.actions.length > 0,
      );

    return latest?.actions || [];
  }, [messages]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([
          {
            role: "assistant",
            content:
              "Hi, I can help you use MyTikLink while you work. Ask me anything, or tap a quick action below.",
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to load smart assistant messages:", err);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    }
  }, [messages]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/plan`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) return;

        const data = await res.json();
        setUserProfile(data);
      } catch (err) {
        console.error("Failed to load assistant user profile:", err);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const openAssistant = () => {
      setOpen(true);
      setNudgeOpen(false);
    };

    window.addEventListener("open-smart-assistant", openAssistant);

    return () => {
      window.removeEventListener("open-smart-assistant", openAssistant);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 120);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const lastMessage = messages[messages.length - 1];

    window.setTimeout(() => {
      if (lastMessage?.role === "assistant") {
        latestAssistantRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        return;
      }

      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  }, [messages, loading, open]);

  useEffect(() => {
    if (!pathname) return;

    lastRouteRef.current = pathname;
    setNudgeOpen(false);

    let activityTimer;

    const dismissals = JSON.parse(localStorage.getItem(DISMISSED_KEY) || "{}");
    const dismissedRecently =
      dismissals[routeContext.match] &&
      Date.now() - dismissals[routeContext.match] < 6 * 60 * 60 * 1000;

    const resetTimers = () => {
      window.clearTimeout(activityTimer);
      setNudgeOpen(false);

      activityTimer = window.setTimeout(() => {
        if (!open && !dismissedRecently && lastRouteRef.current === pathname) {
          setNudgeOpen(true);
        }
      }, (routeContext.idleSeconds || 40) * 1000);
    };

    const events = ["click", "keydown", "input", "scroll", "touchstart"];
    events.forEach((event) =>
      window.addEventListener(event, resetTimers, { passive: true }),
    );

    resetTimers();

    return () => {
      window.clearTimeout(activityTimer);
      events.forEach((event) => window.removeEventListener(event, resetTimers));
    };
  }, [open, pathname, routeContext]);

  const dismissNudge = () => {
    const dismissals = JSON.parse(localStorage.getItem(DISMISSED_KEY) || "{}");
    dismissals[routeContext.match] = Date.now();
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissals));
    setNudgeOpen(false);
  };

  const openWithRouteHelp = () => {
    setOpen(true);
    setNudgeOpen(false);

    const alreadyAdded = messages.some(
      (message) =>
        message.type === "route-help" && message.route === routeContext.match,
    );

    if (!alreadyAdded) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          type: "route-help",
          route: routeContext.match,
          content: routeContext.nudge,
        },
      ]);
    }
  };

  const navigateTo = (href) => {
    if (!href) return;

    if (href.startsWith("/")) {
      router.push(href);
    } else {
      window.open(href, "_blank", "noopener,noreferrer");
    }

    setOpen(false);
  };

  const sendMessage = async (text = input) => {
    const cleanText = text.trim();
    if (!cleanText || loading) return;

    const userMessage = { role: "user", content: cleanText };
    const nextMessages = [...messages, userMessage].slice(-20);

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "smart-assistant",
          smartContext: {
            route: pathname,
            pageTitle: routeContext.title,
            recommendedHelp: routeContext.prompt,
            quickActions,
            user: userProfile
              ? {
                  name: userProfile.name,
                  email: userProfile.email,
                  plan: userProfile.plan,
                  planExpiry: userProfile.planExpiry,
                }
              : null,
          },
          messages: nextMessages.map((message) => ({
            role: message.role === "user" ? "user" : "assistant",
            content: message.content,
          })),
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply ||
            "I could not get a response right now. Please try again.",
          actions: data.actions || [],
          redirectTo: data.redirectTo || null,
          autoRedirect: Boolean(data.autoRedirect),
        },
      ]);

      if (data.autoRedirect && data.redirectTo?.startsWith("/")) {
        window.setTimeout(() => {
          navigateTo(data.redirectTo);
        }, 1300);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I could not connect right now. Please check your network and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {nudgeOpen && !open && (
        <div className={styles.nudge}>
          <button
            type="button"
            className={styles.nudgeClose}
            onClick={dismissNudge}
            aria-label="Dismiss assistant"
          >
            <X size={14} />
          </button>

          <div className={styles.nudgeIcon}>
            <Lightbulb size={16} />
          </div>

          <div className={styles.nudgeText}>
            <strong>{routeContext.title}</strong>
            <p>{routeContext.nudge}</p>
          </div>

          <button
            type="button"
            className={styles.nudgeAction}
            onClick={openWithRouteHelp}
          >
            Help me
          </button>
        </div>
      )}

      <button
        type="button"
        className={styles.floatingButton}
        onClick={() => {
          setOpen(true);
        }}
        aria-label="Open MyTikLink assistant"
      >
        <Sparkles size={18} />
      </button>

      {open && (
        <div className={styles.panelShell}>
          <section className={styles.panel}>
            <header className={styles.header}>
              <div className={styles.headerLeft}>
                <div className={styles.assistantMark}>
                  <Sparkles size={22} />
                  <i />
                </div>

                <div>
                  <p>MyTikLink Assistant</p>
                  <span>ASK ME ANYTHING</span>
                </div>
              </div>

              <div className={styles.headerActions}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close assistant"
                >
                  <X size={17} />
                </button>
              </div>
            </header>

            <>
              <div className={styles.topTools}>
                <span className={styles.pagePill}>
                  <i />
                  On {routeContext.title}
                </span>

                <button
                  type="button"
                  className={styles.guideButton}
                  onClick={() => sendMessage(routeContext.prompt)}
                >
                  <Sparkles size={15} />
                  Guide me
                </button>
              </div>

              {quickActions.length > 0 && (
                <div className={styles.quickActions}>
                  {quickActions.slice(0, 4).map((action) => (
                    <button
                      key={action.href}
                      type="button"
                      onClick={() => navigateTo(action.href)}
                    >
                      <Link2 size={14} />
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              <div className={styles.messages}>
                {messages.map((message, index) => (
                    <div
                      key={`${message.role}-${index}`}
                      ref={
                        message.role !== "user" &&
                        index === messages.length - 1
                          ? latestAssistantRef
                          : null
                      }
                      className={
                        message.role === "user"
                          ? styles.userRow
                          : styles.assistantRow
                      }
                    >
                      {message.role !== "user" && (
                        <div className={styles.messageAvatar}>
                          <Sparkles size={15} />
                        </div>
                      )}

                      <div
                        className={
                          message.role === "user"
                            ? styles.userBubble
                            : styles.assistantBubble
                        }
                      >
                        <ReactMarkdown
                          components={{
                            a: ({ href = "", children }) => (
                              <a
                                href={href}
                                onClick={(event) => {
                                  if (href.startsWith("/")) {
                                    event.preventDefault();
                                    navigateTo(href);
                                  }
                                }}
                                target={href.startsWith("/") ? "_self" : "_blank"}
                                rel="noopener noreferrer"
                              >
                                {children}
                                <ArrowUpRight size={13} />
                              </a>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>

                        {message.autoRedirect && message.redirectTo && (
                          <div className={styles.redirectNotice}>
                            Taking you there now...
                          </div>
                        )}

                      </div>
                    </div>
                ))}

                {loading && (
                  <div className={styles.typing}>
                    <span />
                    <span />
                    <span />
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {latestAssistantActions.length > 0 && (
                <div className={styles.actionTray}>
                  {latestAssistantActions.map((action, actionIndex) => (
                    <button
                      key={`${action.href}-${actionIndex}`}
                      type="button"
                      className={`${styles.actionButton} ${
                        styles[action.variant || "secondary"]
                      }`}
                      onClick={() => navigateTo(action.href)}
                    >
                      {action.label}
                      <ArrowUpRight size={13} />
                    </button>
                  ))}
                </div>
              )}

              <form
                className={styles.inputArea}
                onSubmit={(event) => {
                  event.preventDefault();
                  sendMessage();
                }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask what you want to do..."
                />

                <button type="submit" disabled={loading || !input.trim()}>
                  <Send size={17} />
                </button>
              </form>
            </>
          </section>
        </div>
      )}
    </>
  );
}

