import os
import glob
import re

CORRECT_NAV = '''<nav class="navbar">
        <div class="brand">
            <div class="brand-icon"
                style="overflow: hidden; display: flex; align-items: center; justify-content: center; background: transparent;">
                <img src="/logo.png" alt="Knitway Logo" style="width: 100%; height: 100%; object-fit: contain;">
            </div>
            KNITWAY INDIA PVT LTD
        </div>
        <div class="nav-status-links">
            <a href="project-confirmed.html" class="nav-status-btn">Confirmed</a>
            <a href="project-postponed.html" class="nav-status-btn">Postponed</a>
            <a href="project-drop.html" class="nav-status-btn">Dropped</a>
            <a href="order-lost.html" class="nav-status-btn">Order Lost</a>
        </div>
        <div style="display: flex; align-items: center; gap: 1.5rem;">
            <!-- Home Button -->
            <a href="home.html" class="notification-icon" title="Home">
                <i class="ri-home-4-line"></i>
            </a>
            <!-- Notification Button -->
            <a href="pending-quotes.html" class="notification-icon" title="Pending Quotations">
                <i class="ri-notification-3-line"></i>
                <span class="notification-badge" id="nav-notification-badge" style="display: none;">0</span>
            </a>
            <div class="user-profile" style="display:flex; align-items:center; gap: 1rem;">
                <div style="display:flex; align-items:center; gap:0.75rem;">
                    <div style="text-align:right;">
                        <strong style="display:block; font-size:0.9rem;">Owner Dashboard</strong>
                        <span style="font-size:0.8rem; color:var(--text-secondary);">Administration</span>
                    </div>
                    <img src="https://ui-avatars.com/api/?name=Owner&background=3b82f6&color=fff&bold=true" alt="Owner"
                        style="width:40px; border-radius:50%; box-shadow: 0 0 10px rgba(59,130,246,0.3);">
                </div>
                <!-- Sign Out Button -->
                <a href="login.html"
                    style="text-decoration:none; display:inline-flex; align-items:center; gap:0.4rem; padding:0.4rem 0.8rem; border-radius:6px; background:rgba(239,68,68,0.1); color:#ef4444; font-size:0.85rem; font-weight:500; transition:all 0.2s; border:1px solid rgba(239,68,68,0.2);">
                    <i class="ri-logout-circle-r-line"></i> Sign Out
                </a>
            </div>
        </div>
    </nav>'''

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip files that don't have the standard nav or are auth pages
    if 'login.html' in filepath or 'signup.html' in filepath:
        return

    # Replace the existing nav with the correct nav
    pattern = r'<nav class="navbar">[\s\S]*?</nav>'
    
    if re.search(pattern, content):
        content = re.sub(pattern, CORRECT_NAV, content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

base_dir = r"d:\Enquiry website"
public_dir = r"d:\Enquiry website\public"

count = 0
for html_file in glob.glob(os.path.join(base_dir, "*.html")):
    process_file(html_file)
    count += 1
    
for html_file in glob.glob(os.path.join(public_dir, "*.html")):
    process_file(html_file)
    count += 1

print(f"Standardized navbar in {count} HTML files.")
