import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-white py-4 mt-auto shadow-sm" style={{
      borderTop: '1px solid #e9ecef'
    }}>
      <div className="container-fluid px-4">
        <div className="d-flex align-items-center justify-content-between small">
          <div className="text-muted">
            <i className="fas fa-bus me-2" style={{ color: '#1e3c72' }}></i>
            Copyright &copy; DriveLine {new Date().getFullYear()}
          </div>
          <div className="d-flex gap-3">
            <a 
              href="#" 
              className="text-muted text-decoration-none"
              style={{ 
                transition: 'color 0.2s ease',
                color: '#6c757d'
              }}
              onMouseOver={(e) => e.target.style.color = '#1e3c72'}
              onMouseOut={(e) => e.target.style.color = '#6c757d'}
            >
              Privacy Policy
            </a>
            <span className="text-muted">&middot;</span>
            <a 
              href="#" 
              className="text-muted text-decoration-none"
              style={{ 
                transition: 'color 0.2s ease',
                color: '#6c757d'
              }}
              onMouseOver={(e) => e.target.style.color = '#1e3c72'}
              onMouseOut={(e) => e.target.style.color = '#6c757d'}
            >
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
