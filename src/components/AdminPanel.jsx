import React, { useState, useEffect } from 'react';

export default function AdminPanel({ onBack }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Navigation tabs: 'list' or 'bulk'
  const [activeTab, setActiveTab] = useState('list');
  
  // Products states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form states (for Add/Edit)
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Cups & Kulhads',
    description: '',
    price: '',
    unit: 'Pack of 6',
    capacity: '120ml',
    tone: '#D96B43',
    image_url: ''
  });

  // Bulk upload states
  const [bulkFiles, setBulkFiles] = useState([]);
  const [autoCreateDrafts, setAutoCreateDrafts] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');


  // Check sessionStorage on load to maintain login session
  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
      fetchProducts();
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        sessionStorage.setItem('admin_token', data.token);
        setIsAuthenticated(true);
        fetchProducts();
      } else {
        setLoginError(data.message || 'Incorrect password.');
      }
    } catch (err) {
      console.error("Login verification error:", err);
      setLoginError('Failed to contact server. Please verify backend is running.');
    }
  };

  const handleLogout = async () => {
    const token = sessionStorage.getItem('admin_token');
    if (token) {
      try {
        await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (err) {
        console.error("Logout request failed:", err);
      }
    }
    sessionStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    onBack();
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch('/api/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setError('Could not fetch products from server.');
      }
    } catch (err) {
      console.error("Fetch products error:", err);
      setError('Could not connect to backend server. Operating in local offline mode.');
    } finally {
      setLoading(false);
    }
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Cups & Kulhads',
      description: '',
      price: '',
      unit: 'Pack of 6',
      capacity: '120ml',
      tone: '#D96B43',
      image_url: ''
    });
    setShowForm(true);
  };

  const handleOpenEditForm = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      description: product.description || '',
      price: product.price,
      unit: product.unit || 'Pack of 6',
      capacity: product.capacity || '120ml',
      tone: product.tone || '#D96B43',
      image_url: product.image_url || ''
    });
    setShowForm(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
    const method = editingProduct ? 'PUT' : 'POST';
    const token = sessionStorage.getItem('admin_token');
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (response.ok) {
        setShowForm(false);
        fetchProducts();
        alert(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
      } else {
        alert(result.error || 'Failed to save product.');
      }
    } catch (err) {
      console.error("Form submit database error:", err);
      alert('Error connecting to backend database.');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the database?`)) return;
    const token = sessionStorage.getItem('admin_token');
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchProducts();
        alert('Product deleted successfully!');
      } else {
        const result = await response.json();
        alert(result.error || 'Failed to delete product.');
      }
    } catch (err) {
      console.error("Delete product error:", err);
    }
  };

  // Bulk Image Uploader handlers
  const handleFileChange = (e) => {
    setBulkFiles(Array.from(e.target.files));
    setUploadStatus('');
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (bulkFiles.length === 0) {
      alert('Please select files first.');
      return;
    }

    setUploading(true);
    setUploadStatus('Uploading files...');
    
    const uploadFormData = new FormData();
    bulkFiles.forEach(file => {
      uploadFormData.append('images', file);
    });

    const token = sessionStorage.getItem('admin_token');
    try {
      const response = await fetch(`/api/upload-bulk?autoCreate=${autoCreateDrafts}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadFormData
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setUploadStatus(`Uploaded ${result.files.length} images successfully!`);
        if (autoCreateDrafts) {
          setUploadStatus(prev => `${prev} Created ${result.createdProducts.length} draft products in catalog.`);
          fetchProducts();
        }
        setBulkFiles([]);
      } else {
        setUploadStatus('Upload failed: ' + (result.error || 'Server error.'));
      }
    } catch (err) {
      console.error("Bulk upload connection error:", err);
      setUploadStatus('Upload failed. Connection error.');
    } finally {
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="login-container animate-fade-in">
        <div className="login-card">
          <div className="login-logo">
            <span>Kulhad<span className="logo-highlight">Wala</span></span>
            <div className="login-subtitle">Artisan Security Gate</div>
          </div>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="admin-pass">Enter Administrative Password</label>
              <input 
                id="admin-pass"
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="admin-input"
                autoFocus
              />
            </div>
            {loginError && <div className="login-error-msg">⚠️ {loginError}</div>}
            <button type="submit" className="btn-admin-submit">Verify Credentials</button>
            <button type="button" onClick={onBack} className="btn-admin-cancel">Back to Home</button>
          </form>
        </div>

        <style>{`
          .login-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: calc(100vh - 3rem);
            background-color: var(--color-bg-light);
            padding: 2rem;
          }
          .login-card {
            background: #ffffff;
            border-radius: 28px;
            border: 1px solid var(--color-border);
            padding: 3rem;
            width: 100%;
            max-width: 440px;
            box-shadow: var(--shadow-lg);
          }
          .login-logo {
            text-align: center;
            font-family: var(--font-heading);
            font-weight: 900;
            font-size: 2rem;
            color: var(--color-text-dark);
            margin-bottom: 2rem;
          }
          .logo-highlight {
            color: var(--color-brand);
          }
          .login-subtitle {
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: var(--color-text-muted);
            margin-top: 0.25rem;
          }
          .login-form {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
          }
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .form-group label {
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--color-text-dark);
          }
          .admin-input {
            width: 100%;
            padding: 0.9rem 1.25rem;
            border-radius: 12px;
            border: 1px solid var(--color-border);
            background: var(--color-bg-light);
            outline: none;
            font-size: 1rem;
            transition: var(--transition-smooth);
          }
          .admin-input:focus {
            border-color: var(--color-brand);
            background: #ffffff;
          }
          .login-error-msg {
            color: #d93838;
            font-size: 0.85rem;
            font-weight: 600;
          }
          .btn-admin-submit {
            background: var(--color-brand);
            color: #ffffff;
            border: none;
            padding: 1rem;
            border-radius: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: var(--transition-elastic);
            box-shadow: 0 4px 12px rgba(217, 107, 67, 0.2);
          }
          .btn-admin-submit:hover {
            transform: translateY(-2px);
            background: var(--color-brand-dark);
          }
          .btn-admin-cancel {
            background: transparent;
            color: var(--color-text-muted);
            border: 1px solid var(--color-border);
            padding: 0.9rem;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition-smooth);
          }
          .btn-admin-cancel:hover {
            border-color: var(--color-text-dark);
            color: var(--color-text-dark);
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div className="admin-dashboard container animate-fade-in">
      {/* Admin Header */}
      <header className="admin-header">
        <div className="admin-title-wrap">
          <span className="admin-badge">Secure Access Granted</span>
          <h2>Artisan Catalog Command</h2>
        </div>
        <div className="admin-actions-wrap">
          <button onClick={onBack} className="btn-nav-home">View Website</button>
          <button onClick={handleLogout} className="btn-logout">Logout System</button>
        </div>
      </header>

      {/* Admin Tabs */}
      <div className="admin-tabs">
        <button 
          onClick={() => setActiveTab('list')} 
          className={`admin-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
        >
          🏺 Product Catalog ({products.length})
        </button>
        <button 
          onClick={() => setActiveTab('bulk')} 
          className={`admin-tab-btn ${activeTab === 'bulk' ? 'active' : ''}`}
        >
          ⚡ Bulk Image Uploader
        </button>
      </div>

      {/* TAB 1: Product List Editor */}
      {activeTab === 'list' && (
        <div className="tab-content">
          <div className="tab-toolbar">
            <h3>Current Live Products</h3>
            <button onClick={handleOpenAddForm} className="btn-add-product">+ Add Single Product</button>
          </div>

          {error && <div className="admin-warn-banner">{error}</div>}

          {loading ? (
            <div className="admin-loading">Loading catalog database...</div>
          ) : (
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product Details</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Details</th>
                    <th>Tone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="table-prod-info">
                          <div className="table-img-wrap" style={{ background: p.tone + '15' }}>
                            {p.image_url ? (
                              <img src={p.image_url} alt="" className="table-thumb" />
                            ) : (
                              <span className="table-avatar-fallback">🏺</span>
                            )}
                          </div>
                          <div>
                            <strong className="prod-name">{p.name}</strong>
                            <div className="prod-desc-sub">{p.description}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="cat-badge">{p.category}</span></td>
                      <td><strong>₹{p.price}</strong><span className="unit-sub"> / {p.unit}</span></td>
                      <td>{p.capacity}</td>
                      <td>
                        <span className="tone-swatch" style={{ backgroundColor: p.tone }} title={p.tone}></span>
                        <code className="tone-code">{p.tone}</code>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button onClick={() => handleOpenEditForm(p)} className="btn-action-edit">Edit</button>
                          <button onClick={() => handleDeleteProduct(p.id, p.name)} className="btn-action-delete">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Bulk Image Uploader */}
      {activeTab === 'bulk' && (
        <div className="tab-content">
          <div className="bulk-uploader-card">
            <h3>Bulk Add Image Gallery</h3>
            <p className="bulk-desc">
              Select multiple photos of your clay products. We'll upload them to the server. 
              If enabled, we'll automatically create a product in the SQL database for each file, pre-filling the title from the file name.
            </p>

            <form onSubmit={handleBulkUpload} className="bulk-form">
              <div className="upload-dropzone">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={handleFileChange}
                  id="bulk-file-input"
                  className="hidden-file-input"
                />
                <label htmlFor="bulk-file-input" className="dropzone-label">
                  <span className="upload-icon">📸</span>
                  <strong>Choose or drag images here</strong>
                  <span className="upload-subtext">JPG, PNG, WebP up to 10MB each</span>
                </label>
              </div>

              {bulkFiles.length > 0 && (
                <div className="selected-files-list">
                  <h4>Selected Files ({bulkFiles.length})</h4>
                  <ul>
                    {bulkFiles.map((file, idx) => (
                      <li key={idx}>📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bulk-options">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={autoCreateDrafts}
                    onChange={(e) => setAutoCreateDrafts(e.target.checked)}
                  />
                  <span>Automatically create product drafts in SQL catalog based on filenames</span>
                </label>
              </div>

              {uploadStatus && (
                <div className={`upload-status-banner ${uploadStatus.includes('successfully') ? 'success' : ''}`}>
                  {uploadStatus}
                </div>
              )}

              <button 
                type="submit" 
                disabled={uploading || bulkFiles.length === 0} 
                className="btn-upload-submit"
              >
                {uploading ? 'Uploading & Seeding Catalog...' : `Upload ${bulkFiles.length} Images`}
              </button>
            </form>
          </div>
        </div>
      )}

      </div>

      {/* Single Add/Edit Product Modal Form */}
      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-content animate-fade-in">
            <div className="modal-header">
              <h3>{editingProduct ? 'Edit Terracotta Product' : 'Add New Terracotta Product'}</h3>
              <button onClick={() => setShowForm(false)} className="btn-close-modal">×</button>
            </div>
            <form onSubmit={handleSubmitForm} className="modal-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="e.g. Classic Mitti Chai Kulhad"
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="Cups & Kulhads">Cups & Kulhads</option>
                    <option value="Tableware">Tableware</option>
                    <option value="Bottles & Jugs">Bottles & Jugs</option>
                    <option value="Cookware">Cookware</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  placeholder="Tell clients about the clay composition, natural properties, or care instructions..."
                  rows="3"
                />
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input 
                    type="number" 
                    name="price" 
                    value={formData.price} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="120"
                  />
                </div>
                <div className="form-group">
                  <label>Unit Details</label>
                  <input 
                    type="text" 
                    name="unit" 
                    value={formData.unit} 
                    onChange={handleInputChange} 
                    placeholder="e.g. Pack of 6, Single Piece"
                  />
                </div>
                <div className="form-group">
                  <label>Capacity / Size</label>
                  <input 
                    type="text" 
                    name="capacity" 
                    value={formData.capacity} 
                    onChange={handleInputChange} 
                    placeholder="e.g. 150ml, 10 inches"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Terracotta Color Tone (HEX) *</label>
                  <div className="color-input-combo">
                    <input 
                      type="color" 
                      name="tone" 
                      value={formData.tone} 
                      onChange={handleInputChange}
                      className="color-picker-input"
                    />
                    <input 
                      type="text" 
                      name="tone" 
                      value={formData.tone} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="#D96B43"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Custom Image URL</label>
                  <input 
                    type="text" 
                    name="image_url" 
                    value={formData.image_url} 
                    onChange={handleInputChange} 
                    placeholder="/uploads/my-image_172023.jpg"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowForm(false)} className="btn-cancel-modal">Cancel</button>
                <button type="submit" className="btn-save-product">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-dashboard {
          padding-top: 8rem;
          padding-bottom: 5rem;
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .admin-badge {
          background: var(--color-accent-green-bg);
          color: var(--color-accent-green);
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.25rem 0.75rem;
          border-radius: 100px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: inline-block;
          margin-bottom: 0.5rem;
        }
        .admin-actions-wrap {
          display: flex;
          gap: 1rem;
        }
        .btn-nav-home {
          background: #ffffff;
          border: 1px solid var(--color-border);
          color: var(--color-text-dark);
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .btn-nav-home:hover {
          border-color: var(--color-text-dark);
        }
        .btn-logout {
          background: var(--color-text-dark);
          color: #ffffff;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .btn-logout:hover {
          opacity: 0.9;
        }
        .admin-tabs {
          display: flex;
          gap: 1rem;
          border-bottom: 2px solid var(--color-border);
          padding-bottom: 1rem;
          margin-bottom: 2.5rem;
        }
        .admin-tab-btn {
          background: none;
          border: none;
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 0.5rem 1rem;
          position: relative;
          transition: var(--transition-smooth);
        }
        .admin-tab-btn:hover {
          color: var(--color-text-dark);
        }
        .admin-tab-btn.active {
          color: var(--color-brand);
        }
        .admin-tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1.2rem;
          left: 0;
          width: 100%;
          height: 3px;
          background: var(--color-brand);
          border-radius: 2px;
        }
        
        .tab-content {
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid var(--color-border);
          padding: 2.5rem;
          box-shadow: var(--shadow-sm);
        }
        .tab-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .btn-add-product {
          background: var(--color-brand);
          color: #ffffff;
          border: none;
          padding: 0.8rem 1.5rem;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-elastic);
        }
        .btn-add-product:hover {
          transform: translateY(-2px);
          background: var(--color-brand-dark);
        }
        
        .admin-warn-banner {
          background: #fbf0ee;
          border-left: 4px solid var(--color-brand);
          padding: 1rem;
          border-radius: 8px;
          color: var(--color-brand-dark);
          font-weight: 600;
          margin-bottom: 2rem;
          font-size: 0.9rem;
        }
        .admin-loading {
          text-align: center;
          padding: 3rem;
          color: var(--color-text-muted);
          font-weight: 600;
        }

        /* Products Table */
        .table-responsive {
          overflow-x: auto;
          width: 100%;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .admin-table th {
          padding: 1rem;
          border-bottom: 1px solid var(--color-border);
          color: var(--color-text-muted);
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
        }
        .admin-table td {
          padding: 1.25rem 1rem;
          border-bottom: 1px solid var(--color-border);
          vertical-align: middle;
        }
        .table-prod-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          max-width: 320px;
        }
        .table-img-wrap {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
        .table-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .table-avatar-fallback {
          font-size: 1.5rem;
        }
        .prod-name {
          display: block;
          color: var(--color-text-dark);
          font-size: 1rem;
        }
        .prod-desc-sub {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 240px;
        }
        .cat-badge {
          background: var(--color-bg-light);
          border: 1px solid var(--color-border);
          padding: 0.3rem 0.75rem;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .unit-sub {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          font-weight: 400;
        }
        .tone-swatch {
          display: inline-block;
          width: 16px;
          height: 16px;
          border-radius: 4px;
          margin-right: 0.5rem;
          vertical-align: middle;
          border: 1px solid rgba(0,0,0,0.1);
        }
        .tone-code {
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }
        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }
        .btn-action-edit {
          background: #fbf7f0;
          border: 1px solid var(--color-border);
          color: var(--color-brand);
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .btn-action-edit:hover {
          border-color: var(--color-brand);
          background: var(--color-brand);
          color: #ffffff;
        }
        .btn-action-delete {
          background: #fff5f5;
          border: 1px solid rgba(217,56,56,0.1);
          color: #d93838;
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.8rem;
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .btn-action-delete:hover {
          background: #d93838;
          color: #ffffff;
          border-color: #d93838;
        }

        /* Bulk Uploader styling */
        .bulk-uploader-card {
          max-width: 600px;
          margin: 0 auto;
        }
        .bulk-desc {
          color: var(--color-text-muted);
          font-size: 0.9rem;
          margin-bottom: 2rem;
          line-height: 1.5;
        }
        .bulk-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .upload-dropzone {
          border: 2px dashed var(--color-border);
          background: var(--color-bg-light);
          padding: 3rem 2rem;
          border-radius: 16px;
          text-align: center;
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .upload-dropzone:hover {
          border-color: var(--color-brand);
        }
        .hidden-file-input {
          display: none;
        }
        .dropzone-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        .upload-icon {
          font-size: 2.5rem;
        }
        .upload-subtext {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }
        .selected-files-list {
          background: var(--color-bg-light);
          padding: 1.25rem;
          border-radius: 12px;
          max-height: 150px;
          overflow-y: auto;
        }
        .selected-files-list h4 {
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
        }
        .selected-files-list ul {
          list-style: none;
          font-size: 0.8rem;
          color: var(--color-text-muted);
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .bulk-options {
          display: flex;
          align-items: center;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-text-dark);
          cursor: pointer;
        }
        .checkbox-label input {
          width: 18px;
          height: 18px;
          accent-color: var(--color-brand);
        }
        .upload-status-banner {
          background: #fbf7f0;
          border-left: 4px solid var(--color-brand);
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .upload-status-banner.success {
          background: #edf6ef;
          border-left-color: var(--color-accent-green);
          color: var(--color-accent-green);
        }
        .btn-upload-submit {
          background: var(--color-brand);
          color: #ffffff;
          border: none;
          padding: 1rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .btn-upload-submit:hover:not(:disabled) {
          background: var(--color-brand-dark);
        }
        .btn-upload-submit:disabled {
          background: var(--color-border);
          color: var(--color-text-muted);
          cursor: not-allowed;
        }

        /* Modal Dialog */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(42, 26, 21, 0.4);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: 1rem;
        }
        .modal-content {
          background: #ffffff;
          width: 100%;
          max-width: 650px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 28px;
          box-shadow: var(--shadow-lg);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 2.5rem;
          border-bottom: 1px solid var(--color-border);
        }
        .btn-close-modal {
          background: none;
          border: none;
          font-size: 2rem;
          line-height: 1;
          color: var(--color-text-muted);
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .btn-close-modal:hover {
          color: var(--color-text-dark);
        }
        .modal-form {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }
        .form-row-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1rem;
        }
        @media (max-width: 600px) {
          .form-row-2, .form-row-3 {
            grid-template-columns: 1fr;
          }
        }
        .modal-form label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-text-dark);
          margin-bottom: 0.4rem;
          display: block;
        }
        .modal-form input, .modal-form select, .modal-form textarea {
          width: 100%;
          padding: 0.8rem 1rem;
          border-radius: 10px;
          border: 1px solid var(--color-border);
          background: var(--color-bg-light);
          outline: none;
          font-size: 0.95rem;
          transition: var(--transition-smooth);
        }
        .modal-form input:focus, .modal-form select:focus, .modal-form textarea:focus {
          border-color: var(--color-brand);
          background: #ffffff;
        }
        .color-input-combo {
          display: flex;
          gap: 0.5rem;
        }
        .color-picker-input {
          width: 45px !important;
          height: 42px;
          padding: 0 !important;
          cursor: pointer;
          border-radius: 8px !important;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          border-top: 1px solid var(--color-border);
          padding-top: 1.5rem;
          margin-top: 1rem;
        }
        .btn-cancel-modal {
          background: transparent;
          border: 1px solid var(--color-border);
          color: var(--color-text-muted);
          padding: 0.8rem 1.5rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .btn-cancel-modal:hover {
          border-color: var(--color-text-dark);
          color: var(--color-text-dark);
        }
        .btn-save-product {
          background: var(--color-brand);
          color: #ffffff;
          border: none;
          padding: 0.8rem 1.8rem;
          border-radius: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: var(--transition-smooth);
        }
        .btn-save-product:hover {
          background: var(--color-brand-dark);
        }
      `}</style>
    </>
  );
}
