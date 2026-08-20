import Link from "next/link";
import { Reveal } from "../ui/Reveal";

const tiles = [
  {
    label: "Ofertas",
    href: "/categoria/ofertas",
    icon: (
      <path d="M4 4h7l9 9-7 7-9-9V4Z M8 8h.01" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" />
    ),
  },
  {
    label: "Mais Vendidos",
    href: "/mais-vendidos",
    icon: (
      <path
        d="M12 2.5 14.6 9l6.9.6-5.2 4.6 1.6 6.8L12 17.6 5.9 21l1.6-6.8L2.4 9.6 9.3 9 12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    ),
  },
  {
    label: "Notebooks e tablets",
    href: "/categoria/notebooks",
    icon: (
      <path
        d="M4 5h16v9H4z M2 18h20l-2-2H4l-2 2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    ),
  },
  {
    label: "Acessórios",
    href: "/categoria/acessorios",
    icon: (
      <path
        d="M14 3 8 12h4l-2 9 8-11h-4l2-7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    ),
  },
];

export function QuickTiles() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 relative z-10">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {tiles.map((t, i) => (
          <Reveal key={t.label} delay={i * 60}>
            <Link
              href={t.href}
              className="group relative flex flex-col items-center justify-center gap-2 rounded-2xl bg-brand hover:bg-brand-dark text-brand-foreground py-5 sm:py-6 shadow-[0_8px_20px_rgba(224,163,0,0.35)] hover:shadow-[0_12px_28px_rgba(224,163,0,0.45)] hover:-translate-y-1 active:scale-95 active:translate-y-0 transition-all overflow-hidden"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="relative transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                {t.icon}
              </svg>
              <span className="relative text-xs sm:text-sm font-bold text-center px-2">{t.label}</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
