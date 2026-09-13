import Link from "next/link";
import { Reveal } from "../ui/Reveal";

const tiles = [
  {
    label: "Vender Celular",
    href: "/vender",
    tone: "brand" as const,
    icon: (
      <path
        d="M12 2 3 7v10l9 5 9-5V7l-9-5Z M3 7l9 5 9-5 M12 12v10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    ),
  },
  {
    label: "Mais Vendidos",
    href: "/mais-vendidos",
    tone: "slate" as const,
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
    label: "Notebooks",
    href: "/categoria/notebooks",
    tone: "slate" as const,
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
    tone: "slate" as const,
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
    <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-8 sm:py-10 relative z-10">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
        {tiles.map((t, i) => (
          <Reveal key={t.label} delay={i * 60} className="w-full flex justify-center">
            <Link
              href={t.href}
              className={`group relative flex flex-col items-center justify-center gap-2 w-full max-w-31 aspect-square rounded-[10px] text-white shadow-[0_8px_20px_rgba(0,0,0,0.18)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.24)] hover:-translate-y-1 active:scale-95 active:translate-y-0 transition-all overflow-hidden ${
                t.tone === "brand" ? "bg-brand-dark hover:bg-brand" : "bg-[#4d649b] hover:bg-[#3d5280]"
              }`}
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="relative transition-transform duration-300 group-hover:scale-110">
                {t.icon}
              </svg>
              <span className="relative text-sm font-semibold text-center px-3 leading-snug">{t.label}</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
