import { useEffect, useRef } from "react";

interface Props {
  title: string;
  description: string;
  onClose: () => void;
}

const MOBILE_BREAKPOINT = 640;

export function DescriptionModal({ title, description, onClose }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    let scrollTimer: ReturnType<typeof setTimeout> | undefined;
    if (window.innerWidth < MOBILE_BREAKPOINT) {
      scrollTimer = setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        window.scrollBy({ top: 40, behavior: "smooth" });
      }, 60);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      if (scrollTimer) clearTimeout(scrollTimer);
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={panelRef}
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-panel__header">
          <h2>{title}</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Chiudi">
            ✕
          </button>
        </header>
        <div className="modal-panel__body">
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}
