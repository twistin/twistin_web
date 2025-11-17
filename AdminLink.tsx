import React from 'react';

export default function AdminLink() {
  return (
    <div style={{textAlign: 'center', margin: '2rem'}}>
      <a href="/admin/" style={{
        padding: '1rem 2rem',
        background: '#222',
        color: '#fff',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '1.2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        Ir al panel de administración
      </a>
    </div>
  );
}
