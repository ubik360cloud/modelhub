const variants = {
  // Status
  active:           'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  inactive:         'bg-white/4 text-[#6B7280] border-white/10',
  pending:          'bg-amber-500/15 text-amber-400 border-amber-500/30',
  // Plans
  premium:          'bg-[#C9A96E]/15 text-[#C9A96E] border-[#C9A96E]/30',
  basic:            'bg-white/6 text-[#F5F0E8] border-white/12',
  free:             'bg-white/4 text-[#6B7280] border-white/8',
  // Shifts
  scheduled:        'bg-blue-500/15 text-blue-400 border-blue-500/30',
  confirmed:        'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  cancelled:        'bg-red-500/15 text-red-400 border-red-500/30',
  completed:        'bg-white/6 text-[#6B7280] border-white/10',
  change_requested: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
}

export default function Badge({ children, variant = 'inactive', className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
        variants[variant] ?? variants.inactive
      } ${className}`}
    >
      {children}
    </span>
  )
}
