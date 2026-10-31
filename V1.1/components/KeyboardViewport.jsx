import { useEffect } from "react";

// One viewport observer for all V1.1 sheets, including nested dialogs.
export default function KeyboardViewport() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const root = document.documentElement;
    let frame = 0, revealFrame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Do not fight deliberate pinch zoom.
        if (Math.abs(viewport.scale - 1) > 0.05) return;
        root.style.setProperty("--sheet-visible-height", `${viewport.height}px`);
        root.style.setProperty("--sheet-visible-top", `${viewport.offsetTop}px`);
        cancelAnimationFrame(revealFrame);
        revealFrame = requestAnimationFrame(() => {
          const input = document.activeElement;
          if (!input?.matches('input,textarea,select,[contenteditable="true"]') || !input.closest('[data-keyboard-sheet]')) return;
          // Scroll only the sheet's inner scroll area, never the background page.
          let scroller = input.parentElement;
          while (scroller && !scroller.hasAttribute('data-keyboard-sheet')) {
            if (/(auto|scroll)/.test(getComputedStyle(scroller).overflowY) && scroller.scrollHeight > scroller.clientHeight) {
              const box = input.getBoundingClientRect(), bounds = scroller.getBoundingClientRect();
              const top = Math.max(bounds.top, viewport.offsetTop) + 16;
              const bottom = Math.min(bounds.bottom, viewport.offsetTop + viewport.height) - 16;
              if (box.bottom > bottom) scroller.scrollTop += box.bottom - bottom;
              else if (box.top < top) scroller.scrollTop -= top - box.top;
              break;
            }
            scroller = scroller.parentElement;
          }
        });
      });
    };
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    document.addEventListener('focusin', update);
    window.addEventListener('resize', update);
    update();
    return () => {
      cancelAnimationFrame(frame); cancelAnimationFrame(revealFrame);
      viewport.removeEventListener('resize', update); viewport.removeEventListener('scroll', update);
      document.removeEventListener('focusin', update); window.removeEventListener('resize', update);
      root.style.removeProperty('--sheet-visible-height'); root.style.removeProperty('--sheet-visible-top');
    };
  }, []);
  return null;
}
