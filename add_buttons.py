import os
import glob
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Skip files that don't have the standard nav or are auth pages
    if 'login.html' in filepath or 'signup.html' in filepath:
        return

    # Add Home Button if not already there
    home_btn_html = '''<!-- Home Button -->
            <a href="home.html" class="notification-icon" title="Home">
                <i class="ri-home-4-line"></i>
            </a>
            <!-- Notification Button -->'''
            
    if '<!-- Home Button -->' not in content and '<!-- Notification Button -->' in content:
        content = content.replace('<!-- Notification Button -->', home_btn_html)

    # Add Sign Out button.
    # Find the user-profile div block.
    # We will look for <div class="user-profile"...>...</div>
    # A robust regex to find the user-profile div and append the sign out button before its closing </div>
    # Note: user-profile could have children.
    # First, let's normalize the user profile string if possible, or just look for the user-profile opening tag and the img tag end.
    
    # Check if Sign Out already exists
    if 'Sign Out' not in content and 'ri-logout-circle-r-line' not in content:
        # Regex to find the user profile block up to the Owner image
        pattern = r'(<div class="user-profile"[^>]*>[\s\S]*?<img[^>]*"Owner"[^>]*>[\s\S]*?)</div>'
        
        sign_out_html = r'''\1
                <!-- Sign Out Button -->
                <a href="login.html"
                    style="text-decoration:none; display:inline-flex; align-items:center; gap:0.4rem; padding:0.4rem 0.8rem; border-radius:6px; background:rgba(239,68,68,0.1); color:#ef4444; font-size:0.85rem; font-weight:500; transition:all 0.2s; border:1px solid rgba(239,68,68,0.2);">
                    <i class="ri-logout-circle-r-line"></i> Sign Out
                </a>
            </div>'''
            
        content, count = re.subn(pattern, sign_out_html, content)
        if count > 0:
            # Also modify the class="user-profile" to include the flex styling if it doesn't have it
            if '<div class="user-profile">' in content:
                content = content.replace('<div class="user-profile">', '<div class="user-profile" style="display:flex; align-items:center; gap: 1rem;">')

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

print(f"Processed {count} HTML files in root and public.")
