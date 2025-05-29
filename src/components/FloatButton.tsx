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
}: FloatButtonProps) => {
  // Auto generate style to pin to viewport
  const style: React.CSSProperties = {
    position: "fixed",
    top: top !== undefined ? top : undefined,
    right: right !== undefined ? right : undefined,
    bottom: bottom !== undefined ? bottom : undefined,
    left: left !== undefined ? left : undefined,
  };

  return (
    <button
      style={style}
      onClick={onClick}
      className={`bg-blue-600 hover:bg-blue-700 transition-transform duration-200 hover:scale-105 text-white px-4 py-2 rounded-full shadow-md flex items-center gap-2 ${className}`}
    >
      {icon}
      {title && <span>{title}</span>}
    </button>
  );
};

export default FloatButton;
