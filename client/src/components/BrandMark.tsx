import { ChefHat } from "lucide-react";

type BrandMarkProps = { size?: "sm" | "lg" };

export function BrandMark({ size = "lg" }: BrandMarkProps) {
  const dimensions = size === "sm" ? "h-16 w-16" : "h-24 w-24";
  return <div aria-label="Cantina do Chalé Restaurante" className={`${dimensions} flex shrink-0 items-center justify-center rounded-full border-[3px] border-[#e8a33d] bg-[#8b1e23] text-[#fff8ef] shadow-[0_8px_24px_rgba(139,30,35,.18)]`}><div className="flex h-[78%] w-[78%] items-center justify-center rounded-full border border-[#d6336c] text-[#e8a33d]"><ChefHat size={size === "sm" ? 22 : 34} strokeWidth={1.7} /></div></div>;
}
