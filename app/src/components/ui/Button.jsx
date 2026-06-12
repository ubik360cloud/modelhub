export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'bg-[#C9A96E] text-[#0D0D0D] border border-[#C9A96E] hover:opacity-88',
    secondary:
      'bg-transparent text-[#C9A96E] border border-[#C9A96E] hover:bg-[#C9A96E] hover:text-[#0D0D0D]',
    ghost:
      'bg-transparent text-[#6B7280] border-0 hover:text-[#F5F0E8]',
    danger:
      'bg-transparent text-red-400 border border-red-500/40 hover:bg-red-500/10',
  }

  const sizes = {
    sm: 'h-8  px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-6 text-base',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant] ?? variants.primary} ${sizes[size] ?? sizes.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
