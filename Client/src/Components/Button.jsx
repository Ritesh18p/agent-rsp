function Button({
  children,
  type = "button",
  onClick,
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition-all duration-300 hover:bg-orange-600 hover:scale-[1.02] active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;