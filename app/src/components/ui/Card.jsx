export default function Card({ children, className = '', padding = true }) {
  return (
    <div className={`card-glass ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  )
}
