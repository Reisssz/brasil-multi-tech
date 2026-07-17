import Link from "next/link";
import { SITE } from "@/lib/config";

const banners = [
  {
    title: "Até 30% OFF",
    subtitle: "em seminovos selecionados",
    href: "/categoria/ofertas",
    photo: "/products/iphone13-midnight-1.webp",
  },
  {
    title: "12 meses",
    subtitle: "de garantia em todos os produtos",
    href: "/garantia",
    photo: "/products/iphone12-black-1.png",
  },
  {
    title: `${SITE.yearsInBusiness} anos`,
    subtitle: "cuidando da sua tecnologia",
    href: "/sobre",
    photo: "/products/dell-i3-seminovo-1.webp",
  },
  {
    title: "Negativado?",
    subtitle: "aprovação facilitada, sem burocracia",
    href: "/contato",
    photo: "/products/iphone11-white-1.webp",
  },
];

export function PromoBannerStrip() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-14">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {banners.map((b) => (
          <Link
            key={b.title}
            href={b.href}
            className="group relative aspect-[4/5] sm:aspect-square rounded-2xl overflow-hidden bg-[#1c1408]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- decorative background photo, not a content image */}
            <img
              src={b.photo}
              alt=""
              className="absolute inset-0 w-full h-full object-contain p-6 opacity-90 transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col">
              <span className="text-lg sm:text-xl font-extrabold text-white leading-tight">{b.title}</span>
              <span className="text-xs sm:text-sm text-white/80">{b.subtitle}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
