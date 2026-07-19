"use client";

import { useEffect, useState } from "react";
import { whatsappLink } from "@/lib/config";

export function WhatsAppFloat() {
  const [mounted, setMounted] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setMounted(true), 400);
    const bubbleTimer = setTimeout(() => setBubbleOpen(true), 2600);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(bubbleTimer);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed z-50 bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col items-end gap-2 pb-[env(safe-area-inset-bottom)]">
      {bubbleOpen && !dismissed && (
        <div className="animate-pop-in relative max-w-[220px] rounded-2xl rounded-br-sm bg-surface border border-border shadow-[var(--shadow-card-hover)] px-4 py-3">
          <button
            onClick={() => setDismissed(true)}
            aria-label="Fechar"
            className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-[#e6e8ec] text-foreground text-[10px] hover:bg-border transition-colors"
          >
            ✕
          </button>
          <p className="text-xs font-medium text-foreground leading-snug">
            Precisa de ajuda? Fale com a gente no WhatsApp! 👋
          </p>
        </div>
      )}

      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Fale conosco no WhatsApp"
        className="animate-pop-in group relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-[0_8px_20px_rgba(37,211,102,0.45)] transition-transform hover:scale-110 active:scale-95"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse-ring" />
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="relative">
          <path d="M12 2C6.5 2 2 6.5 2 12c0 1.9.5 3.6 1.5 5.2L2 22l4.9-1.5A9.9 9.9 0 0 0 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2Zm5.6 14.1c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-5-4.3-5.1-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.2-.3.5-.4.7-.4h.5c.2 0 .4 0 .6.5.2.5.7 1.8.8 1.9.1.2.1.4 0 .6-.1.2-.2.3-.3.5-.2.2-.3.3-.5.5-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.5 1.5.3.1.5.1.7-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.2.1 1.5.7 1.8.8.3.1.4.2.5.3.1.2.1.9-.1 1.4Z" />
        </svg>
      </a>
    </div>
  );
}
