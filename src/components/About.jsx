import React from 'react';

export default function About() {
  const benefits = [
    {
      title: "Mitti ki Khushboo",
      description: "Drinking from a natural clay cup adds an incomparable earthy aroma and enhances the tea's authentic flavor profile.",
      icon: ""
    },
    {
      title: "100% Natural & Biodegradable",
      description: "Zero plastic, zero chemicals. Made from pure clay and returned back to the earth without leaving any ecological footprint.",
      icon: ""
    },
    {
      title: "Kiln-Fired at 1000°C+",
      description: "Our high-temperature manufacturing process in Pune ensures sterile, highly sanitary, and durable cups.",
      icon: ""
    },
    {
      title: "Empowering Rural Artisans",
      description: "Every purchase directly supports traditional potter communities and preserves age-old Indian craftsmanship.",
      icon: ""
    }
  ];

  return (
    <section id="why-clay" className="about-section">
      <div className="container">
        <div className="about-grid">

          <div className="about-text-panel">
            <span className="about-subtitle">The Eco-Friendly Choice</span>
            <h2 className="about-title">Why Traditional Clay Cups are Future-Ready</h2>
            <p className="about-desc-p">
              At KulhadWala Pune, we fuse heritage craftsmanship with modern manufacturing technology. Our daily production capacity and stringent quality checks make us the ideal partner for cafes, hotels, corporate offices, and event organizers.
            </p>
            <div className="about-stat-row">
              <div className="stat-card">
                <span className="stat-number">50k+</span>
                <span className="stat-label">Daily Capacity</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">0%</span>
                <span className="stat-label">Plastic Content</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">100%</span>
                <span className="stat-label">Pune Manufactured</span>
              </div>
            </div>
          </div>

          <div className="about-cards-panel">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <span className="benefit-icon">{benefit.icon}</span>
                <h3 className="benefit-title">{benefit.title}</h3>
                <p className="benefit-desc">{benefit.description}</p>
              </div>
            ))}
          </div>

        </div>
      </div>

      <style>{`
        .about-section {
          padding: 8rem 0;
          background-color: var(--color-bg-warm);
          border-top: 1px solid var(--color-border);
          position: relative;
        }

        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1.1fr;
          gap: 5rem;
          align-items: center;
        }

        @media (max-width: 992px) {
          .about-grid {
            grid-template-columns: 1fr;
            gap: 3.5rem;
          }
        }

        .about-subtitle {
          color: var(--color-brand);
          text-transform: uppercase;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          display: block;
          margin-bottom: 0.75rem;
        }

        .about-title {
          font-size: clamp(2rem, 3.5vw, 2.5rem);
          margin-bottom: 1.5rem;
          letter-spacing: -0.5px;
        }

        .about-desc-p {
          color: var(--color-text-muted);
          font-size: 1.1rem;
          margin-bottom: 3rem;
          max-width: 500px;
        }

        .about-stat-row {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .stat-card {
          flex: 1;
          min-width: 120px;
          background: #ffffff;
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid var(--color-border);
          text-align: center;
        }

        .stat-number {
          font-family: var(--font-heading);
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--color-brand);
          display: block;
        }

        .stat-label {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          font-weight: 700;
        }

        /* Right panel cards */
        .about-cards-panel {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 576px) {
          .about-cards-panel {
            grid-template-columns: 1fr;
          }
        }

        .benefit-card {
          background: #ffffff;
          border: 1px solid var(--color-border);
          border-radius: 20px;
          padding: 2rem;
          transition: var(--transition-smooth);
        }

        .benefit-card:hover {
          transform: translateY(-4px);
          border-color: var(--color-brand-light);
          box-shadow: var(--shadow-sm);
        }

        .benefit-icon {
          font-size: 2rem;
          margin-bottom: 1.25rem;
          display: inline-block;
        }

        .benefit-title {
          font-size: 1.15rem;
          margin-bottom: 0.75rem;
          font-weight: 700;
        }

        .benefit-desc {
          color: var(--color-text-muted);
          font-size: 0.85rem;
          line-height: 1.5;
        }
      `}</style>
    </section>
  );
}
