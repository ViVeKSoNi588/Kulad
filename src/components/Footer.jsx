import React from 'react';

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="container footer-content">

        <div className="footer-brand-section">
          <div className="footer-logo">
            <span className="logo-text">Kulhad<span className="logo-highlight">Wala</span></span>
            <span className="logo-badge">Pune Manufacturer</span>
          </div>
          <p className="footer-tagline">
            Pune's leading high-capacity clay kulhad manufacturers. Preserving traditional Indian taste while providing biodegradable supply solutions at wholesale carton pricing.
          </p>
        </div>

        <div className="footer-links-grid">
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#hero">Back to Top</a></li>
              <li><a href="#products">Shop Products</a></li>
              <li><a href="#bulk-calculator">Bulk Price Calculator</a></li>
              <li><a href="#why-clay">Eco Benefits</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Factory Location</h4>
            <p className="address-text">
              KULHADWALA MANUFACTURER <br />
              PUNE SR 21 MUMBAI <br />
              PUNE ROAD DAPODI PUNE <br />
              411012
            </p>
          </div>

          <div className="footer-col">
            <h4>Order Desk</h4>
            <p className="address-text">
              Call/WhatsApp: <a href="https://wa.me/919975111418" target="_blank" rel="noopener noreferrer" className="footer-contact-link">+91 99751 11418</a><br />
              Email: <a href="mailto:kulhadwalamanufaturerpune@gmail.com" className="footer-contact-link">kulhadwalamanufaturerpune@gmail.com</a><br />
              Mon - Sat: 9:00 AM - 7:00 PM
            </p>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="container bottom-content">
          <p>&copy; {new Date().getFullYear()} KulhadWala Pune. All rights reserved.</p>
          <div className="bottom-links">
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms & Conditions</a>
          </div>
        </div>
      </div>

      <style>{`
        .footer-container {
          background-color: #241612; /* Deep warm clay brown */
          color: #FCFBFA;
          padding: 6rem 0 0 0;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          margin-left: -1.5rem;
          margin-right: -1.5rem;
          margin-bottom: -1.5rem;
          width: calc(100% + 3rem);
        }

        @media (max-width: 768px) {
          .footer-container {
            margin-left: -0.5rem;
            margin-right: -0.5rem;
            margin-bottom: -0.5rem;
            width: calc(100% + 1rem);
          }
        }

        .footer-content {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 4rem;
          margin-bottom: 4rem;
        }

        @media (max-width: 900px) {
          .footer-content {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
        }

        .footer-brand-section {
          max-width: 400px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .footer-logo .logo-text {
          color: #ffffff;
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 1.5rem;
        }

        .footer-logo .logo-highlight {
          color: var(--color-brand);
        }

        .footer-logo .logo-badge {
          background: rgba(255, 255, 255, 0.1);
          color: var(--color-brand-light);
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 0.25rem 0.6rem;
          border-radius: 100px;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .footer-tagline {
          color: #D2C5BD; /* Warm cream/terracotta slate */
          font-size: 0.95rem;
          line-height: 1.6;
        }

        /* Links Grid */
        .footer-links-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 2rem;
        }

        @media (max-width: 576px) {
          .footer-links-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }

        .footer-col h4 {
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .footer-col ul {
          list-style: none;
        }

        .footer-col ul li {
          margin-bottom: 0.75rem;
        }

        .footer-col ul li a {
          color: #D2C5BD;
          font-size: 0.9rem;
          transition: var(--transition-smooth);
        }

        .footer-col ul li a:hover {
          color: var(--color-brand-light);
          padding-left: 4px;
        }

        .address-text {
          color: #D2C5BD;
          font-size: 0.9rem;
          line-height: 1.6;
        }

        .footer-contact-link {
          color: #D2C5BD;
          text-decoration: none;
          transition: var(--transition-smooth);
        }

        .footer-contact-link:hover {
          color: var(--color-brand-light);
        }

        /* Bottom copyright bar */
        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding: 2rem 0;
          background: #170E0C; /* Darker warm brown */
        }

        .bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.8rem;
          color: #9C8C83; /* Warm gray/beige */
        }

        @media (max-width: 576px) {
          .bottom-content {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }

        .bottom-links {
          display: flex;
          gap: 1.5rem;
        }

        .bottom-links a {
          color: #9C8C83;
          transition: var(--transition-smooth);
        }

        .bottom-links a:hover {
          color: #ffffff;
        }
      `}</style>
    </footer>
  );
}
