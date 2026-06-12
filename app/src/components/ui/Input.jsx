export default function Input({
  label,
  id,
  error,
  helper,
  className = '',
  ...props
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={id}
          className="block text-[#F5F0E8] text-sm font-medium"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`input-base ${
          error ? 'border-red-500/60 focus:border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}
      {helper && !error && (
        <p className="text-[#6B7280] text-xs">{helper}</p>
      )}
    </div>
  )
}
