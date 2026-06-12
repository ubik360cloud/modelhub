export default function PageWrapper({ children, className = '' }) {
  return (
    <div className={`p-4 sm:p-6 max-w-7xl mx-auto ${className}`}>
      {children}
    </div>
  )
}
