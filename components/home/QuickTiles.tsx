import Link from "next/link";
import { Reveal } from "../ui/Reveal";

const tiles = [
  {
    label: "Vender Celular",
    href: "/vender",
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
    <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12 py-8 sm:py-10 relative z-10">
      {/* Bloquinhos quadrados e espaçados (referência do cliente): a célula do
          grid dá o respiro entre eles e o tile fica quadrado com largura
          máxima, centralizado — em vez de esticar na largura toda da coluna. */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 justify-items-center">
        {tiles.map((t, i) => (
          <Reveal key={t.label} delay={i * 60} className="w-full flex justify-center">
            <Link
              href={t.href}
              className="group relative flex flex-col items-center justify-center gap-3 w-full max-w-[150px] aspect-square rounded-xl bg-brand hover:bg-brand-dark text-brand-foreground shadow-[0_8px_20px_rgba(224,163,0,0.35)] hover:shadow-[0_12px_28px_rgba(224,163,0,0.45)] hover:-translate-y-1 active:scale-95 active:translate-y-0 transition-all overflow-hidden"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="relative transition-transform duration-300 group-hover:scale-110">
                {t.icon}
              </svg>
              <span className="relative text-sm font-bold text-center px-3 leading-snug">{t.label}</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
