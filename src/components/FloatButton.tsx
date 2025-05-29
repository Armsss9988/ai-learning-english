export interface FloatButtonProps {
  className?: string;
  onClick?: () => void;
  top?: number;
  right?: number;
  left?: number;
  bottom?: number;
  title?: string;
  icon?: React.ReactNode;
}
const FloatButton = ({
  className,
  onClick,
  top,
  right,
  left,
  bottom,
  title,
  icon,
}: FloatButtonProps) => {
  return (
    <button
      className={`hover:scale-105 hover:bg-neutral-400 fixed py-2 px-4 text-white text-md font-bold space-x-2 rounded-lg shadow-lg flex items-center justify-center ${className} ${
        top ? `top-${top}` : ""
      } ${right ? `right-${right}` : ""} ${left ? `left-${left}` : ""} ${
        bottom ? `bottom-${bottom}` : ""
      }`}
      onClick={onClick}
    >
      {icon}
      <span>{title}</span>
    </button>
  );
};
export default FloatButton;
