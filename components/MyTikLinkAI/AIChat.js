"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./AIchat.module.css";
import {
  X,
  Minimize2,
  Maximize2,
  Send,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AIChat({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ai_chat");

      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        const welcome = [
          {
            role: "ai",
            text: "Hi 👋 I'm MyTikLink AI. If you need help, ask me anything!",
          },
        ];

        setMessages(welcome);
        localStorage.setItem("ai_chat", JSON.stringify(welcome));
      }
    } catch (err) {
      console.error("Failed to load chat:", err);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ai_chat", JSON.stringify(messages));
  }, [messages]);
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };

    const newMessages = [...messages, userMessage];
    const lastMessages = newMessages.slice(-50); // keep last 50 messages for context
    setMessages((prev) => {
      const updated = [...prev, userMessage];
      localStorage.setItem("ai_chat", JSON.stringify(updated));
      return updated;
    });
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: lastMessages.map((m) => ({
            role: m.role === "user" ? "user" : "assistant",
            content: m.text,
          })),
        }),
      });

      const data = await res.json();

      // 👇 fake delay for typing feel
      setTimeout(() => {
        setMessages((prev) => {
          const updated = [...prev, { role: "ai", text: data.reply }];
          localStorage.setItem("ai_chat", JSON.stringify(updated));
          return updated;
        });
        setLoading(false);
      }, 1200);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleFeedback = (index, type) => {
    const updated = [...messages];

    if (type === "yes") {
      updated[index].feedback = "yes";
    }

    if (type === "no") {
      updated[index].feedback = "no";

      // 👇 ADD WHATSAPP RESPONSE MESSAGE
      updated.push({
        role: "ai",
        text: "If you need more help from our team, join our WhatsApp group below 👇 [Join WhatsApp Group](https://mytiklink.com/r/mytiklink)",
      });
    }

    setMessages(updated);
  };

  const formatMessage = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    return text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" style="color:#6366f1; text-decoration:underline;">${url}</a>`;
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={`${styles.chatBox} ${minimized ? styles.minimized : ""}`}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.aiInfo}>
            <div className={styles.avatar}>🤖</div>
            <span className={styles.title}>MyTikLink AI</span>
          </div>
          <div className={styles.actions}>
            <button
              className={styles.iconBtn}
              onClick={() => setMinimized(!minimized)}
            >
              {minimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>

            <button className={styles.iconBtn} onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* MESSAGES */}
        <div className={styles.messages}>
          {messages.filter((m) => m.role === "user").length === 0 && (
            <div className={styles.emptyStateWrap}>
              <div className={styles.emptyGlow}></div>

              <div className={styles.emptyContent}>
                <div className={styles.emptyIcon}>
                  <Sparkles size={22} />
                </div>

                <h2>
                  Hey there <span>👋</span>
                </h2>

                <p>
                  I'm MyTikLink AI, ask me anything about MyTikLink, Ads,
                  Landing Pages, Tiktok, Meta, Setup, Pixel, Event Optimization
                  & More!
                </p>
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={
                msg.role === "user"
                  ? styles.messageRowUser
                  : styles.messageRowAI
              }
            >
              <div className={styles.messageStack}>
                <div className={msg.role === "user" ? styles.user : styles.ai}>
                  <ReactMarkdown
                    components={{
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.link}
                        >
                          {children}
                          <ArrowUpRight size={14} className={styles.linkIcon} />
                        </a>
                      ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>

                {/* 👇 FEEDBACK UNDER AI MESSAGE */}
                {msg.role === "ai" && !msg.feedback && (
                  <div className={styles.feedbackRow}>
                    <span>Did this answer your question?</span>
                    <button onClick={() => handleFeedback(i, "yes")}>
                      Yes
                    </button>
                    <button onClick={() => handleFeedback(i, "no")}>No</button>
                  </div>
                )}

                {msg.feedback === "yes" && (
                  <div className={styles.thankYou}>
                    ✅ Thank you for your feedback
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className={styles.typing}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}

          {/* ✅ MUST BE LAST */}
          <div ref={bottomRef} />
        </div>
        {messages.filter((m) => m.role === "user").length === 0 && (
          <div className={styles.suggestions}>
            {[
              "How do I run ads with MyTikLink?",
              "How do i connect Tiktok Ads Manager?",
              "My Event Optimization is not showing active?",
              "How do I set up a landing page?",
            ].map((q, i) => (
              <button
                key={i}
                className={styles.suggestionItem}
                onClick={() => setInput(q)}
              >
                {q}
              </button>
            ))}
          </div>
        )}
        {/* INPUT */}
        <div className={styles.inputRow}>
          <div className={styles.inputWrap}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Ask anything..."
            />

            <button className={styles.sendBtn} onClick={handleSend}>
              <Send size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
