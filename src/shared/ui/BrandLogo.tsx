interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<BrandLogoProps["size"]>, { icon: string; text: string }> = {
  sm: { icon: "h-7 w-7", text: "text-lg" },
  md: { icon: "h-8 w-8", text: "text-xl" },
  lg: { icon: "h-12 w-12", text: "text-2xl" },
};

/** The app icon (assets/Images/salaryiq-icon.png in the RN app) + wordmark, used consistently across the shell, welcome, and auth pages. */
export function BrandLogo({ size = "md", className = "" }: BrandLogoProps) {
  const { icon, text } = SIZE_CLASSES[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img src="/favicon.png" alt="" className={`${icon} rounded-lg`} />
      <p className={`${text} font-extrabold`}>
        Salary<span className="text-primary">IQ</span>
      </p>
    </div>
  );
}
