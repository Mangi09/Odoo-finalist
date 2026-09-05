import React from 'react';

export default function Logo() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: 'var(--blue-slate)',
      fontWeight: '800',
      fontSize: '20px',
      letterSpacing: '-0.5px'
    }}>
      <img 
        src="assets/logo.png" 
        alt="DealFlow360 Logo" 
        style={{
          width: '32px',
          height: '32px',
          objectFit: 'contain'
        }}
      />
      DealFlow360
    </div>
  );
}
