import React, { useState, useEffect, useRef } from 'react';

export default function Hero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2); // -1 to 1
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2); // -1 to 1
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Parallax offsets calculation based on mouse move
  const getTransform = (factor, initialRotation = 0) => {
    const tx = mousePos.x * factor;
    const ty = mousePos.y * factor;
    const rot = initialRotation + mousePos.x * (factor * 0.15);
    return `translate3d(${tx}px, ${ty}px, 0) rotate(${rot}deg)`;
  };

  return (
    <section
      id="hero"
      className="hero-frame"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Decorative subtle texture overlay */}
      <div className="paper-texture"></div>

      {/* Floating cups (arranged in all directions to match Spylt layout) */}

      {/* 1. Top-Left: Small, blurred background cup */}
      <div
        className="floating-asset cup-top-left"
        style={{
          transform: getTransform(-25, 15),
          transition: mousePos.x === 0 ? 'transform 0.8s ease-out' : 'none'
        }}
      >
        <img src="/images/kulhad_floating_2.png" alt="Clay cup top-left" />
      </div>

      {/* 2. Top-Right: Small, blurred top-down cup */}
      <div
        className="floating-asset cup-top-right"
        style={{
          transform: getTransform(-35, -20),
          transition: mousePos.x === 0 ? 'transform 0.8s ease-out' : 'none'
        }}
      >
        <img src="/images/kulhad_topdown.png" alt="Clay cup top-right" />
      </div>

      {/* 3. Middle-Left: Large, sharp, main floating cup */}
      <div
        className="floating-asset cup-mid-left"
        style={{
          transform: getTransform(18, 12),
          transition: mousePos.x === 0 ? 'transform 0.8s ease-out' : 'none'
        }}
      >
        <img src="/images/clay_goblet_hero.png" alt="Handcrafted Clay Goblets" />
        <div className="cup-shadow"></div>
      </div>

      {/* 4. Middle-Right: Large, sharp, secondary floating cup */}
      <div
        className="floating-asset cup-mid-right"
        style={{
          transform: getTransform(22, -15),
          transition: mousePos.x === 0 ? 'transform 0.8s ease-out' : 'none'
        }}
      >
        <img src="/images/clay_bottle_hero.png" alt="Earthy Clay Water Bottle" />
        <div className="cup-shadow"></div>
      </div>

      {/* 5. Bottom-Left: Medium, tilted cup in foreground blur */}
      <div
        className="floating-asset cup-bot-left"
        style={{
          transform: getTransform(40, -45),
          transition: mousePos.x === 0 ? 'transform 0.8s ease-out' : 'none'
        }}
      >
        <img src="/images/kulhad_tilted.png" alt="Tilted Clay cup" />
      </div>

      {/* 6. Bottom-Right: Medium, blurred background cup */}
      <div
        className="floating-asset cup-bot-right"
        style={{
          transform: getTransform(-15, 35),
          transition: mousePos.x === 0 ? 'transform 0.8s ease-out' : 'none'
        }}
      >
        <img src="/images/kulhad_floating_1.png" alt="Clay cup background" />
      </div>

      {/* Centered Headline Content */}
      <div className="hero-center-content animate-fade-in">

        <h1 className="spylt-title">
          <span className="title-row-1">Freshly Fired Pune</span>
          <span className="title-row-2">
            <span className="banner-sticker">Clay Kulhads</span>
          </span>
        </h1>

        <p className="spylt-description">
          Experience the authentic earthiness of Indian tea. Handcrafted in Pune, kiln-fired at 1000°C+, and delivered in robust wholesale cartons.
        </p>

        {/* Central button with custom clay drip accent */}
        <div className="button-drip-container">
          <a href="#products" className="btn-order-carton">
            Order a Carton
          </a>
          {/* Subtle clay drip illustration effect below button */}
          <div className="clay-drip-svg">
            <svg viewBox="0 0 160 20" width="160" height="20" fill="var(--color-brand)">
              <path d="M 0 0 
                       Q 20 0 30 5 Q 40 10 45 15 Q 50 10 60 0 
                       Q 80 0 90 8 Q 95 12 100 12 Q 105 12 110 5 Q 120 0 130 0 
                       Q 145 0 150 7 Q 155 14 160 0 Z" />
            </svg>
          </div>
        </div>

      </div>

      <style>{`
        .hero-frame {
          position: relative;
          min-height: 90vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--color-bg-light);
          padding: 8rem 2rem 5rem 2rem;
          overflow: hidden;
          z-index: 10;
        }

        @media (max-width: 768px) {
          .hero-frame {
            min-height: 80vh;
            padding-top: 6rem;
          }
        }

        .paper-texture {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.05;
          pointer-events: none;
          background-image: radial-gradient(var(--color-text-dark) 0.5px, transparent 0.5px), radial-gradient(var(--color-text-dark) 0.5px, var(--color-bg-light) 0.5px);
          background-size: 20px 20px;
          background-position: 0 0, 10px 10px;
          z-index: 1;
        }

        /* Center Typography Content */
        .hero-center-content {
          text-align: center;
          z-index: 70;
          max-width: 760px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .spylt-title {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }

        .title-row-1 {
          font-family: var(--font-heading);
          font-size: clamp(2.2rem, 6.5vw, 5.2rem);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -2px;
          color: var(--color-text-dark);
          line-height: 0.95;
        }

        .title-row-2 {
          display: block;
          margin-top: 0.25rem;
        }

        /* Highlighted Banner/Sticker style mimicking Spylt 'Protein + Caffeine' banner */
        .banner-sticker {
          display: inline-block;
          background-color: var(--color-brand);
          color: #ffffff;
          font-family: var(--font-heading);
          font-size: clamp(2.2rem, 6.5vw, 5.2rem);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -1.5px;
          padding: 0.2rem 2.5rem;
          transform: rotate(-1deg);
          box-shadow: 0 8px 20px rgba(217, 107, 67, 0.2);
          border-radius: 4px;
        }

        .spylt-description {
          font-size: clamp(0.95rem, 2.3vw, 1.05rem);
          color: var(--color-text-dark);
          max-width: 560px;
          margin-bottom: 2.5rem;
          line-height: 1.6;
          font-weight: 600;
          background: rgba(255, 255, 255, 0.55); /* Crisp, clean frosted white glass shade */
          border: 1px solid rgba(255, 255, 255, 0.55); /* Crisp glass edge highlighting */
          padding: 1.1rem 2rem;
          border-radius: 24px;
          box-shadow: 
            inset 0 1px 1px rgba(255, 255, 255, 0.4), 
            0 12px 36px rgba(42, 26, 21, 0.06);
          backdrop-filter: blur(16px); /* Stronger frosted glass blur */
          -webkit-backdrop-filter: blur(16px);
        }

        /* Button & Clay Drip */
        .button-drip-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .btn-order-carton {
          background-color: #e3a876; /* Accent yellow/orange sand tone from Spylt button */
          color: var(--color-text-dark);
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 1.1rem 2.8rem;
          border-radius: 100px;
          box-shadow: 0 6px 16px rgba(42, 26, 21, 0.08);
          transition: var(--transition-elastic);
          z-index: 52;
          border: 1px solid rgba(42, 26, 21, 0.15);
        }

        .btn-order-carton:hover {
          transform: translateY(-3px);
          background-color: var(--color-brand);
          color: #ffffff;
          box-shadow: 0 10px 24px rgba(217, 107, 67, 0.25);
        }

        .clay-drip-svg {
          position: absolute;
          bottom: -15px;
          pointer-events: none;
          z-index: 51;
          opacity: 0.95;
          transition: var(--transition-smooth);
        }

        .btn-order-carton:hover + .clay-drip-svg {
          transform: scaleY(1.25);
          opacity: 1;
        }

        /* Floating Assets Placement & Blurs */
        .floating-asset {
          position: absolute;
          pointer-events: none;
          z-index: 10;
          user-select: none;
          will-change: transform;
        }

        .floating-asset img {
          width: 100%;
          height: auto;
          mix-blend-mode: multiply; /* Blends white background into page */
        }

        /* 1. Top Left - small blurred background */
        .cup-top-left {
          width: 150px;
          top: 10%;
          left: 12%;
          filter: blur(4px) opacity(0.65);
          animation: floatSpylt1 8s ease-in-out infinite;
        }

        /* 2. Top Right - small topdown blurred background */
        .cup-top-right {
          width: 160px;
          top: 8%;
          right: 15%;
          filter: blur(4.5px) opacity(0.7);
          animation: floatSpylt2 9s ease-in-out infinite;
        }

        /* 3. Middle Left - LARGE main goblets sharp */
        .cup-mid-left {
          width: 650px;
          top: 8%;
          left: -3%;
          filter: drop-shadow(0 20px 40px rgba(42, 26, 21, 0.12));
          animation: floatSpylt3 11s ease-in-out infinite;
          z-index: 45; /* Sits behind text if overlapping, but visible */
        }

        /* 4. Middle Right - LARGE sharp bottle */
        .cup-mid-right {
          width: 700px;
          top: 5%;
          right: -1%;
          filter: drop-shadow(0 20px 40px rgba(42, 26, 21, 0.12));
          animation: floatSpylt4 10s ease-in-out infinite;
          z-index: 45; /* Sits behind text if overlapping, but visible */
        }

        /* 5. Bottom Left - LARGE foreground blurred */
        .cup-bot-left {
          width: 210px;
          bottom: 1%;
          left: 2%;
          filter: blur(4.5px) opacity(0.9);
          animation: floatSpylt2 7s ease-in-out infinite;
          z-index: 30; /* Behind main products */
        }

        /* 6. Bottom Right - blurred background */
        .cup-bot-right {
          width: 180px;
          bottom: 4%;
          right: 8%;
          filter: blur(5.5px) opacity(0.6);
          animation: floatSpylt1 9s ease-in-out infinite;
          z-index: 10;
        }

        /* Shadow filters underneath midground cups */
        .cup-shadow {
          background: radial-gradient(ellipse at center, rgba(42, 26, 21, 0.12) 0%, rgba(42, 26, 21, 0) 70%);
          position: absolute;
          bottom: -15px;
          left: 20%;
          right: 20%;
          height: 20px;
          filter: blur(8px);
          z-index: -1;
        }

        /* Responsive Layouts */
        @media (max-width: 1024px) {
          .cup-mid-left {
            width: 300px;
            left: -10%;
          }
          .cup-mid-right {
            width: 280px;
            right: -8%;
          }
          .cup-bot-left {
            width: 260px;
          }
          .cup-top-left { width: 160px; }
          .cup-top-right { width: 170px; }
        }

        @media (max-width: 768px) {
          /* Hide blurred background elements on mobile to clear up visual clutter */
          .cup-top-left, .cup-top-right, .cup-bot-right {
            display: none;
          }
          
          .cup-mid-left {
            width: 200px;
            left: -8%;
            top: 15%;
          }

          .cup-mid-right {
            width: 190px;
            right: -8%;
            top: 20%;
          }

          .cup-bot-left {
            width: 180px;
            left: 2%;
            bottom: 2%;
          }
        }
      `}</style>
    </section>
  );
}
