"use client";

import { useState } from "react";

export type ProductIconKey =
  | "phone"
  | "laptop"
  | "earbuds"
  | "speaker"
  | "watch"
  | "charger"
  | "accessory";

const icons: Record<ProductIconKey, (accent: string) => React.ReactNode> = {
  phone: (accent) => (
    <svg width="46%" height="46%" viewBox="0 0 64 96" fill="none">
      <rect x="2" y="2" width="60" height="92" rx="12" stroke="#22242a" strokeWidth="3" fill="#fff" />
      <rect x="10" y="10" width="44" height="70" rx="3" fill={accent} opacity="0.16" />
      <circle cx="32" cy="88" r="3" fill="#22242a" />
      <rect x="24" y="5" width="16" height="3" rx="1.5" fill="#22242a" />
    </svg>
  ),
  laptop: (accent) => (
    <svg width="60%" height="60%" viewBox="0 0 96 68" fill="none">
      <rect x="14" y="2" width="68" height="46" rx="4" stroke="#22242a" strokeWidth="3" fill="#fff" />
      <rect x="20" y="8" width="56" height="34" fill={accent} opacity="0.16" />
      <path d="M2 58h92l-8 8H10l-8-8Z" stroke="#22242a" strokeWidth="3" fill="#fff" strokeLinejoin="round" />
    </svg>
  ),
  earbuds: (accent) => (
    <svg width="46%" height="46%" viewBox="0 0 80 60" fill="none">
      <rect x="4" y="6" width="30" height="40" rx="10" stroke="#22242a" strokeWidth="3" fill="#fff" />
      <rect x="46" y="6" width="30" height="40" rx="10" stroke="#22242a" strokeWidth="3" fill="#fff" />
      <circle cx="19" cy="20" r="6" fill={accent} opacity="0.35" />
      <circle cx="61" cy="20" r="6" fill={accent} opacity="0.35" />
      <path d="M14 40c0 8 4 14 5 18M66 40c0 8-4 14-5 18" stroke="#22242a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
  speaker: (accent) => (
    <svg width="54%" height="54%" viewBox="0 0 70 90" fill="none">
      <rect x="4" y="2" width="62" height="86" rx="16" stroke="#22242a" strokeWidth="3" fill="#fff" />
      <circle cx="35" cy="30" r="14" fill={accent} opacity="0.18" stroke="#22242a" strokeWidth="2.5" />
      <circle cx="35" cy="63" r="10" fill={accent} opacity="0.18" stroke="#22242a" strokeWidth="2.5" />
    </svg>
  ),
  watch: (accent) => (
    <svg width="44%" height="44%" viewBox="0 0 60 84" fill="none">
      <path d="M18 4h24l3 18H15l3-18Z" stroke="#22242a" strokeWidth="3" fill="#fff" />
      <path d="M18 80h24l3-18H15l3 18Z" stroke="#22242a" strokeWidth="3" fill="#fff" />
      <rect x="10" y="20" width="40" height="44" rx="10" stroke="#22242a" strokeWidth="3" fill="#fff" />
      <rect x="18" y="28" width="24" height="28" rx="4" fill={accent} opacity="0.2" />
    </svg>
  ),
  charger: (accent) => (
    <svg width="42%" height="42%" viewBox="0 0 56 72" fill="none">
      <rect x="4" y="2" width="48" height="68" rx="10" stroke="#22242a" strokeWidth="3" fill="#fff" />
      <path d="M31 14 17 40h10l-3 18 17-26H31l3-18Z" fill={accent} opacity="0.55" />
    </svg>
  ),
  accessory: (accent) => (
    <svg width="48%" height="48%" viewBox="0 0 80 70" fill="none">
      <rect x="4" y="4" width="72" height="46" rx="8" stroke="#22242a" strokeWidth="3" fill="#fff" />
      <circle cx="24" cy="27" r="7" fill={accent} opacity="0.35" />
      <rect x="40" y="20" width="26" height="6" rx="3" fill={accent} opacity="0.35" />
      <rect x="40" y="30" width="18" height="6" rx="3" fill={accent} opacity="0.2" />
      <path d="M10 62h60" stroke="#22242a" strokeWidth="3" strokeLinecap="round" />
    </svg>
  ),
};

export function ProductImage({
  icon,
  photoSrc,
  accent = "var(--brand)",
  className = "",
}: {
  icon: ProductIconKey;
  /** Real product photo path, e.g. `/products/<variant-id>.jpg`. Falls back to the SVG icon if missing/404. */
  photoSrc?: string;
  accent?: string;
  className?: string;
}) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const render = icons[icon] ?? icons.accessory;
  const showPhoto = photoSrc && !photoFailed;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#fbfbfc] to-[#f0f1f3] ${className}`}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element -- photo dropped in at runtime by convention, dimensions unknown upfront
        <img
          src={photoSrc}
          alt=""
          onError={() => setPhotoFailed(true)}
          className="w-full h-full object-contain p-3 transition-transform duration-300 ease-out group-hover:scale-110"
        />
      ) : (
        <div className="transition-transform duration-300 ease-out group-hover:scale-110 flex items-center justify-center w-full h-full">
          {render(accent)}
        </div>
      )}
    </div>
  );
}
