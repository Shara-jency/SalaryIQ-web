export function Footer({ className = "" }: { className?: string }) {
  return (
    <p className={`text-center text-xs text-text-light ${className}`}>
      © {new Date().getFullYear()} SalaryIQ. All rights reserved. · Developed by Shara Jency
    </p>
  );
}
