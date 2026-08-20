export function StarRating({
  rating,
  reviewCount,
  size = "sm",
}: {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md";
}) {
  const starSize = size === "sm" ? 14 : 18;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = Math.max(0, Math.min(1, rating - i));
          return (
            <span key={i} className="relative inline-block" style={{ width: starSize, height: starSize }}>
              <svg width={starSize} height={starSize} viewBox="0 0 20 20" className="absolute inset-0 text-[#e2e4e9]" fill="currentColor">
                <path d="M10 1.5l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L1.4 7.8l6-.7L10 1.5Z" />
              </svg>
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <svg width={starSize} height={starSize} viewBox="0 0 20 20" className="text-brand" fill="currentColor">
                  <path d="M10 1.5l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L1.4 7.8l6-.7L10 1.5Z" />
                </svg>
              </span>
            </span>
          );
        })}
      </div>
      <span className="text-sm font-medium text-foreground tabular-nums">{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className="text-sm text-muted">({reviewCount.toLocaleString("pt-BR")})</span>
      )}
    </div>
  );
}
