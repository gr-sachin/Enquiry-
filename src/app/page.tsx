'use client';
import { useEffect } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <>
      {/* Top Navigation */}
      <nav className="navbar">
          <div className="brand">
              <div className="brand-icon" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
                  <img src="/logo.png" alt="Knitway Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              KNITWAY INDIA PVT LTD
          </div>
          <div className="nav-status-links">
              <a href="project-confirmed.html" className="nav-status-btn">Confirmed</a>
              <a href="project-postponed.html" className="nav-status-btn">Postponed</a>
              <a href="project-drop.html" className="nav-status-btn">Dropped</a>
              <a href="order-lost.html" className="nav-status-btn">Order Lost</a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              {/* Home Button */}
              <a href="/" className="notification-icon" title="Home">
                  <i className="ri-home-4-line"></i>
              </a>
              {/* Notification Button */}
              <a href="pending-quotes.html" className="notification-icon" title="Pending Quotations">
                  <i className="ri-notification-3-line"></i>
                  <span className="notification-badge" id="nav-notification-badge" style={{ display: 'none' }}>0</span>
              </a>
              <div className="user-profile" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ textAlign: 'right' }}>
                          <strong style={{ display: 'block', fontSize: '0.9rem' }}>Owner Dashboard</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Administration</span>
                      </div>
                      <img src="https://ui-avatars.com/api/?name=Owner&background=3b82f6&color=fff&bold=true" alt="Owner" style={{ width: '40px', borderRadius: '50%', boxShadow: '0 0 10px rgba(59,130,246,0.3)' }} />
                  </div>
                  {/* Sign Out Button */}
                  <a href="#" onClick={handleLogout} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <i className="ri-logout-circle-r-line"></i> Sign Out
                  </a>
              </div>
          </div>
      </nav>

      {/* Main Content */}
      <main className="main-container">
          {/* Header Actions */}
          <div className="header-actions">
              <div>
                  <h1>Enquiry Management</h1>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Overview of total tracking quotes and machine requirements.</p>
              </div>
              <button className="btn-primary" id="btn-new">
                  <i className="ri-add-line"></i> New Enquiry
              </button>
          </div>

          {/* Reminders Container */}
          <div id="reminders-container" className="reminders-container"></div>

          {/* Dashboard Stats */}
          <div className="stat-cards">
              <a href="total-enquiries.html" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div className="stat-card" style={{ cursor: 'pointer' }}>
                      <div className="stat-icon"><i className="ri-file-list-3-line"></i></div>
                      <div className="stat-info">
                          <h3>Total Enquiries</h3>
                          <p id="stat-total">0</p>
                      </div>
                  </div>
              </a>
              <a href="quotes-issued.html" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div className="stat-card" style={{ cursor: 'pointer' }}>
                      <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><i className="ri-check-double-line"></i></div>
                      <div className="stat-info">
                          <h3>Quotes Issued</h3>
                          <p id="stat-issued">0</p>
                      </div>
                  </div>
              </a>
              <a href="pending-quotes.html" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div className="stat-card" style={{ cursor: 'pointer' }}>
                      <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}><i className="ri-time-line"></i></div>
                      <div className="stat-info">
                          <h3>Pending Quotes</h3>
                          <p id="stat-pending">0</p>
                      </div>
                  </div>
              </a>
              <a href="revised-quotes.html" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div className="stat-card" style={{ cursor: 'pointer' }}>
                      <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}><i className="ri-refresh-line"></i></div>
                      <div className="stat-info">
                          <h3>Revised Quotes</h3>
                          <p id="stat-revised">0</p>
                      </div>
                  </div>
              </a>
          </div>

          {/* Enquiry Data Table */}
          <div className="table-wrapper">
              <table>
                  <thead>
                      <tr>
                          <th style={{ width: '25%' }}>Customer Details</th>
                          <th style={{ width: '30%' }}>Types of Machines</th>
                          <th style={{ width: '20%' }}>Quotation Issue</th>
                          <th style={{ width: '15%' }}>Revised Quote</th>
                          <th style={{ width: '10%' }}>Actions</th>
                      </tr>
                  </thead>
                  <tbody id="enquiry-body">
                      {/* Dynamic content generated by script.js */}
                  </tbody>
              </table>
          </div>
      </main>

      {/* Modal Form overlay */}
      <div className="modal-overlay" id="modal">
          <div className="modal-content">
              <div className="modal-header">
                  <h2 style={{ fontSize: '1.4rem' }}>Add New Enquiry</h2>
                  <button className="close-btn" id="btn-close"><i className="ri-close-line"></i></button>
              </div>
              <form id="enquiry-form">
                  <div className="form-group">
                      <label>Client / Company Name</label>
                      <input type="text" id="clientName" className="form-control" placeholder="e.g. Aura Textiles" required />
                  </div>
                  <div className="form-group">
                      <label>Customer Name</label>
                      <input type="text" id="customerName" className="form-control" placeholder="e.g. Ramesh Kumar" required />
                  </div>
                  <div className="form-group">
                      <label>Contact Details (Phone/Email)</label>
                      <input type="text" id="contact" className="form-control" placeholder="+91 XXXX XXXXX" required />
                  </div>
                  <div className="form-group">
                      <label>Email Address</label>
                      <input type="email" id="email" className="form-control" placeholder="e.g. client@example.com" />
                  </div>
                  <div className="form-group">
                      <label>Types of Machines Requested</label>
                      <input type="text" id="machineTypes" className="form-control" placeholder="e.g. Circular Knitting, Flat Knitting" />
                  </div>
                  <div className="form-group" style={{ background: 'rgba(15, 23, 42, 0.3)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <label style={{ marginBottom: 0 }}>Machine Configurations</label>
                          <button type="button" id="add-spec-btn" className="btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                              <i className="ri-add-line"></i> Add Machine
                          </button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 0.8fr 32px', gap: '0.5rem', padding: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' } as any}>
                          <div>Model</div><div>Dia</div><div>Gauge</div><div>Feeders</div><div>Qty</div><div></div>
                      </div>
                      <div id="specs-container">
                          {/* Dynamic configuration boxes will be added here by script.js */}
                      </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                          <label>Project Status</label>
                          <select id="projectStatus" className="form-control form-select">
                              <option value="Active">Active</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Postponed">Postponed</option>
                              <option value="Dropped">Dropped</option>
                              <option value="Lost">Lost</option>
                          </select>
                      </div>
                      <div className="form-group">
                          <label>Quotation Status</label>
                          <select id="quoteStatus" className="form-control form-select">
                              <option value="Pending">Pending</option>
                              <option value="Issued">Issued</option>
                          </select>
                      </div>
                      <div className="form-group" id="quoteDateGroup">
                          <label>Expected / Follow-up Date</label>
                          <input type="date" id="quoteDate" className="form-control" />
                      </div>
                      <div className="form-group">
                          <label>Revised Quote</label>
                          <input type="text" id="revisedQuote" className="form-control" placeholder="e.g. ₹15,00,000 (Optional)" />
                      </div>
                  </div>
                  <div className="form-group" id="transferredToGroup" style={{ display: 'none', marginTop: '1rem' }}>
                      <label>Transferred To (If Lost)</label>
                      <input type="text" id="transferredTo" className="form-control" placeholder="e.g. Competitor Name" />
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                      Save Enquiry
                  </button>
              </form>
          </div>
      </div>

      {/* Notes Modal */}
      <div className="modal-overlay" id="notes-modal">
          <div className="modal-content">
              <div className="modal-header">
                  <h2 style={{ fontSize: '1.4rem' }}>Enquiry Notes</h2>
                  <button className="close-btn" id="notes-btn-close"><i className="ri-close-line"></i></button>
              </div>
              <div className="form-group">
                  <label>Notes</label>
                  <textarea id="notes-textarea" className="form-control" rows={10} placeholder="Write your notes here..." style={{ resize: 'vertical', minHeight: '200px', background: 'rgba(15, 23, 42, 0.5)', color: 'white', border: '1px solid var(--border-color)', width: '100%', borderRadius: '8px', padding: '1rem', fontFamily: 'inherit' }}></textarea>
              </div>
              <button type="button" className="btn-primary" id="btn-save-notes" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                  Save Notes
              </button>
          </div>
      </div>

      {/* Application Logic loaded after DOM */}
      <Script 
        src="/script.js" 
        strategy="afterInteractive" 
        onReady={() => {
          if (typeof window !== 'undefined' && typeof (window as any).initDashboard === 'function') {
            (window as any).initDashboard();
          }
        }} 
      />
    </>
  );
}
