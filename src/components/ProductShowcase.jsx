import React, { useState, useEffect } from 'react';
import { productsData } from '../data/productsData';

export default function ProductShowcase({ isAdmin, onManageCatalog }) {
  // Database catalog state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(12);

  // Map of product ID -> quantity purchased (default 1)
  const [quantities, setQuantities] = useState({});

  const categories = ['All', 'Cups & Kulhads', 'Tableware', 'Bottles & Jugs', 'Cookware'];

  const getQty = (id) => quantities[id] || 1;

  const handleIncrement = (id) => {
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] || 1) + 1 }));
  };

  const handleDecrement = (id) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) - 1) }));
  };

  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error("API server responded with error status");
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.warn("Could not load products database, falling back to local dataset.", err);
        setProducts(productsData);
        setLoading(false);
      });
  }, []);

  // Filter products by category and search term
  const filteredProducts = products.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  const handleWhatsAppRedirect = (product, qty) => {
    const whatsappNumber = "99751 11418";
    const totalPrice = product.price * qty;
    const baseMessage = `Hello KulhadWala Pune! I am interested in inquiring about the following product:

• Product: *${product.name}* (${product.unit})
• Quantity: *${qty}*
• Estimated Price: *₹${totalPrice.toLocaleString()}*
• Specifications: ${product.capacity} | ${product.category}

Please share details regarding shipping, delivery timeline, and bulk availability if any.`;
    
    const encodedMessage = encodeURIComponent(baseMessage);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  // Helper to render high quality dynamic SVG based on product type
  const renderProductIllustration = (product) => {
    const { category, name, tone, id } = product;
    const rimTone = `${tone}dd`;

    // Linear Gradients for SVG
    const gradientId = `grad-${id}`;
    const rimGradientId = `grad-rim-${id}`;

    const renderGradient = () => (
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={tone} />
          <stop offset="100%" stopColor="#4A1E12" />
        </linearGradient>
        <linearGradient id={rimGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={rimTone} />
          <stop offset="50%" stopColor={tone} />
          <stop offset="100%" stopColor="#6E2F1E" />
        </linearGradient>
      </defs>
    );

    if (category === 'Cups & Kulhads') {
      const isMug = name.toLowerCase().includes('mug');
      return (
        <svg viewBox="0 0 100 100" width="100" height="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round">
          {renderGradient()}
          {isMug && (
            <path d="M68,38 C80,38 85,58 66,62" fill="none" stroke={tone} strokeWidth="4.5" />
          )}
          <path d="M28,28 L36,78 C37,81 41,83 50,83 C59,83 63,81 64,78 L72,28 Z" fill={`url(#${gradientId})`} stroke="none" />
          <path d="M28,28 L36,78 C37,81 41,83 50,83 C59,83 63,81 64,78 L72,28" />
          <ellipse cx="50" cy="28" rx="22" ry="5.5" fill={`url(#${rimGradientId})`} />
        </svg>
      );
    }

    if (category === 'Tableware') {
      const isPlate = name.toLowerCase().includes('plate') || name.toLowerCase().includes('platter');
      if (isPlate) {
        return (
          <svg viewBox="0 0 100 100" width="100" height="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round">
            {renderGradient()}
            <ellipse cx="50" cy="52" rx="44" ry="14" fill={`url(#${gradientId})`} stroke="none" />
            <ellipse cx="50" cy="52" rx="44" ry="14" />
            <ellipse cx="50" cy="52" rx="30" ry="9" />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 100 100" width="100" height="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round">
          {renderGradient()}
          <path d="M18,44 C18,66 32,83 50,83 C68,83 82,66 82,44 Z" fill={`url(#${gradientId})`} stroke="none" />
          <path d="M18,44 C18,66 32,83 50,83 C68,83 82,66 82,44" />
          <ellipse cx="50" cy="44" rx="32" ry="7" fill={`url(#${rimGradientId})`} />
        </svg>
      );
    }

    if (category === 'Bottles & Jugs') {
      const isJug = name.toLowerCase().includes('jug') || name.toLowerCase().includes('pitcher') || name.toLowerCase().includes('kettle') || name.toLowerCase().includes('matka');
      return (
        <svg viewBox="0 0 100 100" width="100" height="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round">
          {renderGradient()}
          {isJug && (
            <path d="M36,44 C22,44 18,68 35,72" fill="none" stroke={tone} strokeWidth="4" />
          )}
          <path d="M42,18 L58,18 L58,28 L66,38 L66,80 C66,84 61,86 50,86 C39,86 34,84 34,80 L34,38 L42,28 Z" fill={`url(#${gradientId})`} stroke="none" />
          <path d="M42,18 L58,18 L58,28 L66,38 L66,80 C66,84 61,86 50,86 C39,86 34,84 34,80 L34,38 L42,28 Z" />
          <rect x="45" y="11" width="10" height="7" rx="1" fill="#8B5A2B" stroke="none" />
        </svg>
      );
    }

    if (category === 'Cookware') {
      const isTawa = name.toLowerCase().includes('tawa') || name.toLowerCase().includes('pan') || name.toLowerCase().includes('dish');
      if (isTawa) {
        return (
          <svg viewBox="0 0 100 100" width="100" height="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round">
            {renderGradient()}
            <ellipse cx="50" cy="56" rx="44" ry="11" fill={`url(#${gradientId})`} stroke="none" />
            <ellipse cx="50" cy="56" rx="44" ry="11" />
            <path d="M94,56 L76,56" stroke="#4A1E12" strokeWidth="4.5" />
          </svg>
        );
      }
      return (
        <svg viewBox="0 0 100 100" width="100" height="100" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round">
          {renderGradient()}
          <path d="M26,48 C26,74 35,84 50,84 C65,84 74,74 74,48 L70,38 L30,38 Z" fill={`url(#${gradientId})`} stroke="none" />
          <path d="M26,48 C26,74 35,84 50,84 C65,84 74,74 74,48 L70,38 L30,38 Z" />
          <ellipse cx="50" cy="38" rx="20" ry="4.5" fill={`url(#${rimGradientId})`} />
          <path d="M28,50 C18,50 18,62 26,62" />
          <path d="M72,50 C82,50 82,62 74,62" />
          <circle cx="50" cy="30" r="3.5" fill="#5B2414" stroke="none" />
        </svg>
      );
    }

    return null;
  };

  return (
    <section id="products" className="showcase-section">
      <div className="container">
        
        {/* Section Heading */}
        <div className="section-header">
          <span className="section-subtitle">Premium Terracotta</span>
          <h2 className="section-title">Handcrafted Clay Gallery</h2>
          <p className="section-description">
            Browse our extensive collection of over 50 individual, organically-sourced Pune clay products. Directly message our artisans on WhatsApp to inquire or place your order.
          </p>
        </div>

        {/* Search and Category Filtering Section */}
        <div className="filter-panel animate-fade-in">
          <div className="search-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search handcrafted items (e.g. Chai, Matka, Pot)..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setVisibleCount(12); // reset page
              }}
              className="search-input"
            />
          </div>

          <div className="categories-pill-box">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setVisibleCount(12); // reset page
                }}
                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Stats */}
        {!loading && (
          <div className="catalog-status">
            Showing <strong>{Math.min(visibleProducts.length, filteredProducts.length)}</strong> of <strong>{filteredProducts.length}</strong> clay items
          </div>
        )}

        {/* Product Card Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem', color: 'var(--color-text-muted)', fontWeight: 700 }}>
            🏺 Stoking the kiln and loading clay catalog...
          </div>
        ) : visibleProducts.length > 0 ? (
          <div className="product-grid">
            {visibleProducts.map((product) => {
              const qty = getQty(product.id);
              const cardPrice = product.price * qty;

              return (
                <div key={product.id} className="product-card">
                  <div className="card-tag" style={{ color: product.tone, borderColor: `${product.tone}33`, background: `${product.tone}0d` }}>
                    {product.category}
                  </div>

                  {/* Admin shortcut edit button */}
                  {isAdmin && (
                    <div className="card-admin-actions">
                      <button onClick={() => onManageCatalog()} className="btn-card-edit-shortcut" title="Manage in Artisan Dashboard">
                        ✏️ Edit Catalog
                      </button>
                    </div>
                  )}

                  <div className="card-image-wrap" style={{ background: `linear-gradient(135deg, ${product.tone}10 0%, ${product.tone}25 100%)` }}>
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="product-uploaded-img" />
                    ) : (
                      <div className="illustration-holder">
                        {renderProductIllustration(product)}
                      </div>
                    )}
                  </div>
                  <div className="card-info">
                    <div>
                      <h3 className="card-title">{product.name}</h3>
                      <p className="card-description">{product.description}</p>
                    </div>
                    
                    <div className="card-footer-wrap">
                      <div className="card-specs">
                        <div className="spec-row">
                          <span>Unit Details</span>
                          <strong>{product.unit}</strong>
                        </div>
                        <div className="spec-row">
                          <span>Capacity</span>
                          <strong>{product.capacity}</strong>
                        </div>
                      </div>

                      <div className="qty-price-container">
                        <div className="qty-selector">
                          <button onClick={() => handleDecrement(product.id)} className="btn-qty" aria-label="Decrease">-</button>
                          <span className="qty-value">{qty}</span>
                          <button onClick={() => handleIncrement(product.id)} className="btn-qty" aria-label="Increase">+</button>
                        </div>
                        <div className="price-display">
                          <span className="price-label">Price ({product.unit})</span>
                          <span className="price-value">₹{cardPrice}</span>
                          {qty > 1 && (
                            <span className="price-sub">₹{product.price} each</span>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={() => handleWhatsAppRedirect(product, qty)}
                        className="btn-card-order"
                        style={{ background: product.tone }}
                      >
                        Inquire on WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-products-found">
            <span className="no-products-icon">🏺</span>
            <h3>No clay products found</h3>
            <p>Try adjusting your search terms or selecting another category.</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="btn-reset-filters"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Load More Button */}
        {filteredProducts.length > visibleCount && (
          <div className="load-more-container animate-fade-in">
            <button onClick={handleLoadMore} className="btn-load-more">
              Load More Products
            </button>
          </div>
        )}

      </div>

      <style>{`
        .showcase-section {
          padding: 8rem 0;
          background-color: var(--color-bg-light);
          border-top: 1px solid var(--color-border);
        }

        .section-header {
          text-align: center;
          max-width: 650px;
          margin: 0 auto 4rem auto;
        }

        .section-subtitle {
          color: var(--color-brand);
          text-transform: uppercase;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 1.5px;
          display: block;
          margin-bottom: 0.75rem;
        }

        .section-title {
          font-size: clamp(2rem, 4vw, 2.75rem);
          margin-bottom: 1.25rem;
          letter-spacing: -0.5px;
        }

        .section-description {
          color: var(--color-text-muted);
          font-size: 1.1rem;
          line-height: 1.6;
        }

        /* Filter Panel & Search */
        .filter-panel {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-bottom: 2.5rem;
          align-items: center;
          width: 100%;
        }

        .search-wrapper {
          position: relative;
          width: 100%;
          max-width: 600px;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 1.25rem;
          color: var(--color-text-muted);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 1.1rem 1.25rem 1.1rem 3.25rem;
          border-radius: 100px;
          border: 1px solid var(--color-border);
          background: #ffffff;
          font-family: inherit;
          font-size: 1rem;
          outline: none;
          transition: var(--transition-smooth);
          box-shadow: var(--shadow-sm);
          color: var(--color-text-dark);
        }

        .search-input:focus {
          border-color: var(--color-brand);
          box-shadow: 0 0 0 4px rgba(217, 107, 67, 0.12), var(--shadow-md);
        }

        .categories-pill-box {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
          justify-content: center;
        }

        .category-pill {
          padding: 0.6rem 1.3rem;
          border-radius: 100px;
          border: 1px solid var(--color-border);
          background: #ffffff;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-elastic);
          color: var(--color-text-muted);
          box-shadow: var(--shadow-sm);
        }

        .category-pill:hover {
          color: var(--color-text-dark);
          transform: translateY(-2px);
          border-color: var(--color-text-dark);
        }

        .category-pill.active {
          background: var(--color-text-dark);
          color: #ffffff;
          border-color: var(--color-text-dark);
        }

        .catalog-status {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          margin-bottom: 2rem;
          text-align: center;
        }

        /* Product Grid (3 columns desktop, 2 tablet, 1 mobile) */
        .product-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-bottom: 4rem;
        }

        @media (max-width: 992px) {
          .product-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .product-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        .product-card {
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid var(--color-border);
          padding: 2rem;
          position: relative;
          display: flex;
          flex-direction: column;
          transition: var(--transition-elastic);
          box-shadow: var(--shadow-sm);
        }

        @media (max-width: 600px) {
          .product-card {
            padding: 1.25rem;
          }
        }

        .card-footer-wrap {
          display: flex;
          flex-direction: column;
          margin-top: auto;
        }

        .product-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-lg);
          border-color: var(--color-border);
        }

        .card-tag {
          position: absolute;
          top: 1.25rem;
          left: 1.25rem;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.3rem 0.75rem;
          border-radius: 100px;
          border: 1px solid;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          z-index: 5;
        }

        .card-image-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          height: 180px;
          margin-bottom: 1.5rem;
          position: relative;
          overflow: hidden;
          transition: var(--transition-smooth);
        }

        .illustration-holder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          transition: var(--transition-elastic);
        }

        .product-card:hover .illustration-holder {
          transform: scale(1.12) rotate(3deg);
        }

        .card-info {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          justify-content: space-between;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          color: var(--color-text-dark);
          line-height: 1.3;
        }

        .card-description {
          font-size: 0.85rem;
          color: var(--color-text-muted);
          margin-bottom: 1.5rem;
          line-height: 1.5;
          min-height: 2.6rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-specs {
          border-top: 1px dashed var(--color-border);
          border-bottom: 1px dashed var(--color-border);
          padding: 0.75rem 0;
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .spec-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
        }

        .spec-row span {
          color: var(--color-text-muted);
        }

        .spec-row strong {
          color: var(--color-text-dark);
          font-weight: 700;
        }

        .qty-price-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          gap: 0.75rem;
        }

        .qty-selector {
          display: flex;
          align-items: center;
          border: 1px solid var(--color-border);
          border-radius: 10px;
          overflow: hidden;
          background: var(--color-bg-light);
        }

        .btn-qty {
          border: none;
          background: none;
          width: 32px;
          height: 32px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          color: var(--color-text-dark);
          transition: var(--transition-smooth);
        }

        .btn-qty:hover {
          background: var(--color-border);
        }

        .qty-value {
          width: 24px;
          text-align: center;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .price-display {
          text-align: right;
          display: flex;
          flex-direction: column;
        }

        .price-label {
          font-size: 0.7rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }

        .price-value {
          font-family: var(--font-heading);
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--color-text-dark);
        }

        .price-sub {
          font-size: 0.7rem;
          color: var(--color-text-muted);
        }

        .btn-card-order {
          color: #ffffff;
          text-align: center;
          padding: 0.95rem;
          border-radius: 14px;
          font-size: 0.9rem;
          font-weight: 700;
          transition: var(--transition-elastic);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          cursor: pointer;
        }

        .btn-card-order:hover {
          transform: translateY(-2px);
          filter: brightness(0.9);
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
        }

        /* Load More Button styling */
        .load-more-container {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
        }

        .btn-load-more {
          background: #ffffff;
          color: var(--color-text-dark);
          border: 1px solid var(--color-border);
          padding: 1.1rem 3rem;
          border-radius: 100px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-elastic);
          box-shadow: var(--shadow-sm);
        }

        .btn-load-more:hover {
          transform: translateY(-3px);
          border-color: var(--color-text-dark);
          box-shadow: var(--shadow-md);
        }

        /* No Products Found */
        .no-products-found {
          text-align: center;
          padding: 5rem 2rem;
          background: #ffffff;
          border-radius: 24px;
          border: 1px dashed var(--color-border);
          max-width: 500px;
          margin: 0 auto;
        }

        .no-products-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
          display: block;
        }

        .no-products-found h3 {
          font-size: 1.35rem;
          margin-bottom: 0.5rem;
        }

        .no-products-found p {
          color: var(--color-text-muted);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .btn-reset-filters {
          background: var(--color-brand);
          color: #ffffff;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 100px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .btn-reset-filters:hover {
          background: var(--color-brand-dark);
        }

        .product-uploaded-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: var(--transition-elastic);
        }

        .product-card:hover .product-uploaded-img {
          transform: scale(1.1) rotate(1.5deg);
        }

        .card-admin-actions {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          z-index: 10;
        }

        .btn-card-edit-shortcut {
          background: rgba(42, 26, 21, 0.85);
          color: #ffffff;
          border: none;
          padding: 0.35rem 0.75rem;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-smooth);
          backdrop-filter: blur(4px);
        }

        .btn-card-edit-shortcut:hover {
          background: var(--color-brand);
          transform: scale(1.05);
        }
      `}</style>
    </section>
  );
}
