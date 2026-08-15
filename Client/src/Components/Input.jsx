function Input({
  type = "text",
  placeholder,
  name,
  value,
  onChange,
  icon: Icon,
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
        />
      )}

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 py-3 pl-12 pr-4 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
      />
    </div>
  );
}

export default Input;