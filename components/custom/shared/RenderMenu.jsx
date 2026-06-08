"use client";

import { useState, useEffect } from "react";

import {
  Menu,
  X,
  Equal,
  AlignLeft,
  LayoutGrid,
  AlignRight,
  MoreHorizontal,
  MoreVertical,
} from "lucide-react";

const menuIcons = {
  menu: Menu,

  equal: Equal,

  AlignJustify: AlignLeft,

  AlignRight: AlignRight,

  LayoutGrid: LayoutGrid,

  MoreHorizontal: MoreHorizontal,

  MoreVertical: MoreVertical,
};

export default function RenderMenu({ element }) {
  function hexToRGBA(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);

    const g = parseInt(hex.slice(3, 5), 16);

    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);

  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (!element.hideOnScroll) return;

    const container = document.getElementById("builder-scroll-container");

    if (!container) return;

    let lastScrollTop = 0;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;

      // SCROLLING DOWN
      if (scrollTop > lastScrollTop && scrollTop > 80) {
        setVisible(false);
      }

      // SCROLLING UP
      else {
        setVisible(true);
      }

      lastScrollTop = scrollTop;
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [element.hideOnScroll]);
  const shadowMap = {
    none: "none",

    small: "0 4px 10px rgba(0,0,0,0.08)",

    medium: "0 8px 20px rgba(0,0,0,0.12)",

    large: "0 12px 30px rgba(0,0,0,0.18)",
  };

  return (
    <>
      {/* NAVBAR */}
      <div
        style={{
          background: hexToRGBA(
            element.overlayBg,
            element.overlayOpacity / 100,
          ),
          width:
            element.containerLayout === "full" ? "calc(100% + 32px)" : "100%",

          marginLeft:
            element.containerLayout === "full" ? -16 : element.marginLeft,

          marginRight:
            element.containerLayout === "full" ? -16 : element.marginRight,
          paddingTop: element.paddingTop,

          paddingRight: element.paddingRight,

          paddingBottom: element.paddingBottom,

          paddingLeft: element.paddingLeft,
          marginTop: element.marginTop,

          marginBottom: "10px",

          border: element.borderEnabled
            ? `${element.borderWidth}px ${element.borderStyle} ${element.borderColor}`
            : "none",

          borderRadius: element.containerLayout === "full" ? 0 : element.radius,

          boxShadow: shadowMap[element.shadow],

          display: "flex",

          alignItems: "center",

          justifyContent: "space-between",

          position: element.sticky ? "sticky" : "relative",

          top: 0,

          zIndex: 100,

          boxSizing: "border-box",
          position: element.sticky ? "sticky" : "relative",

          top: 0,

          zIndex: 10,

          transform: visible ? "translateY(0)" : "translateY(-120%)",

          transition: "transform 0.28s ease",
        }}
      >
        {/* LEFT */}
        <button
          onClick={() => setOpen(true)}
          style={{
            border: "none",

            background: "transparent",

            cursor: "pointer",

            color: element.textColor,
          }}
        >
          {(() => {
            const Icon = menuIcons[element.menuIcon] || Menu;

            return <Icon size={28} />;
          })()}
        </button>

        {/* CENTER */}
        {element.logoType === "text" ? (
          <div
            style={{
              fontWeight: 700,

              fontSize: 20,

              color: element.textColor,
            }}
          >
            {element.logoText}
          </div>
        ) : (
          <img
            src={element.logoImage}
            style={{
              height: 36,
            }}
          />
        )}

        {/* RIGHT */}
        <div style={{ width: 28 }} />
      </div>

      {/* OVERLAY */}
      {open &&
        (() => {
          // FULLSCREEN
          if (element.layout === "fullscreen") {
            return (
              <div
                style={{
                  position: "fixed",

                  inset: 0,

                  background: hexToRGBA(
                    element.overlayBg,
                    element.overlayOpacity / 100,
                  ),

                  zIndex: 9999,

                  padding: 30,

                  display: "flex",

                  flexDirection: "column",
                }}
              >
                {/* TOP */}
                <div
                  style={{
                    display: "flex",

                    justifyContent: "space-between",

                    alignItems: "center",

                    marginBottom: 40,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: element.overlayTextColor,
                      fontSize: 22,
                    }}
                  >
                    {element.logoText}
                  </div>

                  <button
                    onClick={() => setOpen(false)}
                    style={{
                      border: "none",
                      color: element.overlayTextColor,
                      background: "transparent",
                    }}
                  >
                    <X size={30} />
                  </button>
                </div>

                {/* ITEMS */}
                <div
                  style={{
                    display: "flex",

                    flexDirection: "column",

                    gap: element.itemSpacingVertical,
                  }}
                >
                  {element.items.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      style={{
                        fontSize: element.fontSize,

                        color: element.overlayTextColor,
                        fontWeight: 600,
                        paddingBottom: "25px",
                        textDecoration: "none",
                        letterSpacing: element.letterSpacing,
                      }}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            );
          }

          // DRAWER
          if (element.layout === "drawer") {
            return (
              <>
                {/* BACKDROP */}
                <div
                  onClick={() => setOpen(false)}
                  style={{
                    position: "fixed",

                    inset: 0,

                    background: "rgba(0,0,0,0.4)",

                    zIndex: 9998,
                  }}
                />

                {/* DRAWER */}
                <div
                  style={{
                    position: "fixed",

                    top: 0,

                    bottom: 0,

                    width: 320,

                    background: element.overlayBg,

                    zIndex: 9999,

                    padding: 24,

                    display: "flex",

                    flexDirection: "column",

                    gap: 24,

                    boxShadow: "0 0 40px rgba(0,0,0,0.15)",

                    left: element.menuPosition === "left" ? 0 : undefined,

                    right: element.menuPosition === "right" ? 0 : undefined,
                  }}
                >
                  {/* TOP */}
                  <div
                    style={{
                      display: "flex",

                      justifyContent: "space-between",

                      alignItems: "center",

                      marginBottom: 40,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,

                        fontSize: 22,
                      }}
                    >
                      {element.logoText}
                    </div>

                    <button
                      onClick={() => setOpen(false)}
                      style={{
                        border: "none",
                        color: element.overlayTextColor,
                        background: "transparent",
                      }}
                    >
                      <X size={30} />
                    </button>
                  </div>

                  {element.items.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      style={{
                        textDecoration: "none",

                        color: element.overlayTextColor,
                        fontWeight: 600,
                        paddingBottom: "10px",
                        fontSize: element.fontSize,
                        letterSpacing: element.letterSpacing,
                      }}
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </>
            );
          }

          // INLINE
          // if (element.layout === "inline") {
          //   return (
          //     <div
          //       style={{
          //         width: "100%",

          //         background: element.overlayBg,

          //         padding: 20,

          //         display: "flex",

          //         flexDirection: "column",

          //         gap: element.itemSpacingVertical,
          //       }}
          //     >
          //       {element.items.map((item) => (
          //         <a
          //           key={item.id}
          //           href={item.url}
          //           style={{
          //             textDecoration: "none",

          //             color: element.overlayTextColor,
          //           }}
          //         >
          //           {item.label}
          //         </a>
          //       ))}
          //     </div>
          //   );
          // }
        })()}
    </>
  );
}
