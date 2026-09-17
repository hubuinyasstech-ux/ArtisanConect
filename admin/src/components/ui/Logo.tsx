import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  variant?: "default" | "light";
  className?: string;
  href?: string;
}

export function Logo({
  size = "md",
  showText = true,
  variant = "default",
  className,
  href = "/",
}: LogoProps) {
  const dimensions = {
    sm: { width: 32, height: 32, textClass: "text-base" },
    md: { width: 40, height: 40, textClass: "text-lg" },
    lg: { width: 56, height: 56, textClass: "text-xl" },
    xl: { width: 80, height: 80, textClass: "text-2xl" },
  };

  const config = dimensions[size];

  const content = (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <div className="relative overflow-hidden rounded-xl shadow-xs shrink-0 bg-white p-0.5 border border-neutral-100">
        <Image
          src="/logo.jpeg"
          alt="ArtisanConnect Logo"
          width={config.width}
          height={config.height}
          className="object-contain rounded-lg"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              "font-extrabold tracking-tight leading-tight",
              config.textClass,
              variant === "light" ? "text-white" : "text-[#0f2b48]"
            )}
          >
            Artisan<span className="text-[#f2721e]">Connect</span>
          </span>
          <span
            className={cn(
              "text-[10px] uppercase font-bold tracking-wider hidden sm:inline",
              variant === "light" ? "text-neutral-400" : "text-neutral-500"
            )}
          >
            Find Trusted Artisans Near You
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="transition-opacity hover:opacity-95">
        {content}
      </Link>
    );
  }

  return content;
}
