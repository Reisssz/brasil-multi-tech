export function Badge({
  children,
  tone = "brand",
}: {
  children: React.ReactNode;
  tone?: "brand" | "success" | "neutral";
}) {
  const tones = {
    brand: "bg-brand text-brand-foreground",
    success: "bg-success-light text-success",
    neutral: "bg-[#eef0f3] text-foreground",
  };
  return (
    <span className={`inline-flex items-center rounded-full text-[11px] font-semibold px-2 py-1 leading-none ${tones[tone]}`}>
      {children}
    </span>
  );
}
