"use client";

import { useRef, useState } from "react";
import { ProductImage, ProductIconKey } from "../ui/ProductImage";

export function ProductGallery({
  images,
  photos,
  accent,
}: {
  images: ProductIconKey[];
  /** Real photo filenames relative to /products/. When present, takes priority over the icon fallback for that slot. */
  photos?: string[];
  accent: string;
}) {
  const [active, setActive] = useState(0);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const slotCount = Math.max(images.length, photos?.length ?? 0);
  const slots = Array.from({ length: slotCount }, (_, i) => ({
    icon: images[i] ?? images[0] ?? "accessory",
    photoSrc: photos?.[i] ? `/products/${photos[i]}` : undefined,
  }));

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({ transform: "scale(1.6)", transformOrigin: `${x}% ${y}%` });
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setZoomStyle({})}
        className="relative rounded-2xl border border-border overflow-hidden cursor-zoom-in"
      >
        <div className="transition-transform duration-200 ease-out" style={zoomStyle}>
          <ProductImage
            icon={slots[active].icon as ProductIconKey}
            photoSrc={slots[active].photoSrc}
            accent={accent}
            className="aspect-square w-full"
          />
        </div>
      </div>
      {slots.length > 1 && (
        <div className="flex gap-2">
          {slots.map((slot, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`rounded-xl border overflow-hidden w-16 h-16 shrink-0 transition-colors ${
                i === active ? "border-brand" : "border-border hover:border-muted"
              }`}
              aria-label={`Ver imagem ${i + 1}`}
            >
              <ProductImage icon={slot.icon as ProductIconKey} photoSrc={slot.photoSrc} accent={accent} className="w-full h-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
