import React from 'react';

export default function Navbar({ isLoggedIn, onNavigateAdmin }) {
  return (
    <header className="navbar-wrapper">
      <div className="navbar-inner">
        
        {/* Left: Brand logo */}
        <div className="navbar-logo">
          <span className="logo-text">Kulhad<span className="logo-highlight">Wala</span></span>
        </div>

        {/* Center: Minimalist menu separator line */}
        <div className="navbar-menu-indicator">
          <span className="indicator-line"></span>
          <span className="indicator-line"></span>
        </div>

        {/* Right: Actions */}
        <div className="navbar-actions">
          {isLoggedIn && (
            <button onClick={onNavigateAdmin} className="btn-admin-dash" style={{ marginRight: '0.5rem' }}>
              🔧 Admin Panel
            </button>
          )}
          <a href="#products" className="btn-find-stores">Order Carton Bulk</a>
          <a href="#bulk-calculator" className="cart-icon-btn" aria-label="Calculator">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="9"></line>
              <line x1="9" y1="13" x2="15" y2="13"></line>
              <line x1="9" y1="17" x2="15" y2="17"></line>
              <line x1="12" y1="9" x2="12" y2="17"></line>
            </svg>
          </a>
        </div>

      </div>

      <style>{`
        .navbar-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          padding: 2rem 3rem;
          z-index: 100;
          background: transparent;
        }

        @media (max-width: 768px) {
          .navbar-wrapper {
            padding: 1.5rem 1.5rem;
          }
        }

        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .navbar-logo {
          cursor: pointer;
        }

        .logo-text {
          font-family: var(--font-heading);
          font-weight: 900;
          font-size: 1.6rem;
          color: var(--color-text-dark);
          letter-spacing: -0.5px;
        }

        .logo-highlight {
          color: var(--color-brand);
        }

        /* Center Menu Indicator */
        .navbar-menu-indicator {
          display: flex;
          flex-direction: column;
          gap: 4px;
          cursor: pointer;
          padding: 10px;
        }

        .indicator-line {
          width: 20px;
          height: 2px;
          background-color: var(--color-text-dark);
          border-radius: 2px;
          transition: var(--transition-smooth);
        }

        .navbar-menu-indicator:hover .indicator-line {
          background-color: var(--color-brand);
          width: 24px;
        }

        /* Right Actions */
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .btn-find-stores {
          background: #ffffff;
          color: var(--color-text-dark);
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 0.65rem 1.4rem;
          border-radius: 100px;
          border: 1px solid var(--color-border);
          transition: var(--transition-elastic);
          box-shadow: var(--shadow-sm);
        }

        .btn-find-stores:hover {
          transform: translateY(-2px);
          border-color: var(--color-text-dark);
          box-shadow: var(--shadow-md);
        }

        .cart-icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #ffffff;
          border: 1px solid var(--color-border);
          color: var(--color-text-dark);
          transition: var(--transition-elastic);
          box-shadow: var(--shadow-sm);
        }

        .cart-icon-btn:hover {
          transform: translateY(-2px);
          border-color: var(--color-text-dark);
          box-shadow: var(--shadow-md);
          color: var(--color-brand);
        }

        .btn-admin-dash {
          background: var(--color-text-dark);
          color: #ffffff;
          font-size: 0.8rem;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 0.65rem 1.2rem;
          border-radius: 100px;
          border: none;
          cursor: pointer;
          transition: var(--transition-elastic);
          box-shadow: var(--shadow-sm);
        }

        .btn-admin-dash:hover {
          transform: translateY(-2px);
          background: var(--color-brand);
          box-shadow: var(--shadow-md);
        }
      `}</style>
    </header>
  );
}
