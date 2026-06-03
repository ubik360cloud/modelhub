import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource/playfair-display/400.css'
import '@fontsource/playfair-display/700.css'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'

function ComingSoon() {
  return (
    <div
      style={{
        backgroundColor: '#0D0D0D',
        color: '#F5F0E8',
        fontFamily: '"DM Sans", sans-serif',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        margin: 0,
      }}
    >
      <h1
        style={{
          fontFamily: '"Playfair Display", serif',
          color: '#C9A96E',
          fontSize: '2.5rem',
          fontWeight: 400,
          margin: 0,
        }}
      >
        ModelHub
      </h1>
      <p style={{ color: '#6B7280', fontSize: '1rem', margin: 0 }}>
        Próximamente
      </p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ComingSoon />
  </React.StrictMode>
)
