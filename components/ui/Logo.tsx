"use client";

import { useState } from "react";
import Link from "next/link";

const LOGO_SRC = "/brand/logo.png";

export function Logo({ className = "" }: { className?: string }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <Link href="/" className={`flex items-center gap-2.5 shrink-0 ${className}`} aria-label="Brasil Multi Tech, ir para a home">
      {!imgFailed ? (
        // eslint-disable-next-line @next/next/no-img-element -- logo file dropped in at runtime, dimensions unknown upfront
        <img
          src={LOGO_SRC}
          alt="Brasil Multi Tech"
          className="h-11 sm:h-12 w-auto object-contain"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <>
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <rect width="34" height="34" rx="9" fill="var(--brand)" />
            <path
              d="M10 8.5h7.4c2.6 0 4.6 1.5 4.6 3.9 0 1.6-.9 2.8-2.1 3.4 1.6.5 2.7 1.8 2.7 3.7 0 2.7-2.1 4.3-4.9 4.3H10V8.5Zm3.4 6.1h3.5c1.2 0 2-.6 2-1.7s-.8-1.7-2-1.7h-3.5v3.4Zm0 6.5h3.9c1.3 0 2.2-.7 2.2-1.9 0-1.1-.9-1.8-2.2-1.8h-3.9v3.7Z"
              fill="var(--brand-foreground)"
            />
          </svg>
          <span className="flex flex-col leading-none">
            <span className="text-[17px] font-extrabold tracking-tight text-foreground">
              BRASIL <span className="text-brand-dark">MULTI TECH</span>
            </span>
            <span className="text-[10px] font-medium tracking-wide text-muted uppercase">
              Celulares &amp; acessórios
            </span>
          </span>
        </>
      )}
    </Link>
  );
}
