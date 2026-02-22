interface FixityLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "text-[16px]",
  md: "text-[20px]",
  lg: "text-[28px]",
};

export function FixityLogo({ size = "md", className = "" }: FixityLogoProps) {
  return (
    <span
      className={`font-bold text-black tracking-tight inline-flex items-center select-none ${sizeMap[size]} ${className}`}
    >
      fixit<span className="text-[var(--color-brand-accent)] ml-[1px]">y</span>
    </span>
  );
}
