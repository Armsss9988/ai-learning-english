import React from "react";

export interface FloatButtonProps {
  className?: string;
  onClick?: () => void;
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  title?: string;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning";
  centered?: boolean;
}

const FloatButton = ({
  className = "",
  onClick,
  top,
  right,
  bottom,
  left,
  title,
  icon,
  variant = "primary",
  centered = false,
}: FloatButtonProps) => {
  // Auto generate style to pin to viewport (screen)
  const style: React.CSSProperties = {
    position: "fixed",
    top: top !== undefined ? top : undefined,
    right: right !== undefined ? right : undefined,
    bottom: bottom !== undefined ? bottom : undefined,
    left: centered ? "50%" : left !== undefined ? left : undefined,
    transform: centered ? "translateX(-50%)" : "none", // Center horizontally if needed
  };

  // Variant-based styling
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-gradient-to-r from-emerald-500/50 to-emerald-600/50 hover:from-emerald-600/50 hover:to-emerald-700/50 text-white shadow-lg shadow-emerald-500/30";
      case "secondary":
        return "bg-gradient-to-r from-amber-500/50 to-amber-600/50 hover:from-amber-600/50 hover:to-amber-700/50 text-white shadow-lg shadow-amber-500/30";
      case "success":
        return "bg-gradient-to-r from-green-500/50 to-green-600/50 hover:from-green-600/50 hover:to-green-700/50 text-white shadow-lg shadow-green-500/30";
      case "warning":
        return "bg-gradient-to-r from-orange-500/50 to-orange-600/50 hover:from-orange-600/50 hover:to-orange-700/50 text-white shadow-lg shadow-orange-500/30";
      default:
        return "bg-gradient-to-r from-emerald-500/50 to-emerald-600/50 hover:from-emerald-600/50 hover:to-emerald-700/50 text-white shadow-lg shadow-emerald-500/30";
    }
  };

  return (
    <button
      style={style}
      onClick={onClick}
      className={`
        ${getVariantClasses()}
        transition-all duration-300 
        hover:scale-105 hover:shadow-xl
        active:scale-95
        px-4 py-3 
        rounded-2xl 
        flex items-center gap-2 
        font-semibold      
        border border-white/50
        ${className}
      `.trim()}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {title && <span className="text-sm font-medium">{title}</span>}
    </button>
  );
};

export default FloatButton;
