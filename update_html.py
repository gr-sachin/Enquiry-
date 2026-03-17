import os
import glob

def process_file(filepath):
    print(f"Processing {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'login.html' in filepath or 'signup.html' in filepath:
        return

    # User Profile IDs
    content = content.replace('<strong>Owner Dashboard</strong>', '<strong id="user-display-name">Owner Dashboard</strong>')
    content = content.replace('<span>Administration</span>', '<span id="user-display-role">Administration</span>')
    if 'alt="Owner"' in content and 'id="user-display-avatar"' not in content:
        content = content.replace('alt="Owner"', 'id="user-display-avatar" alt="Owner"')
    
    # Machine Section Header
    header_html = """                    <div id="specs-header" style="display: grid; grid-template-columns: 2.5fr 1fr 1fr 1fr 0.8fr 32px; gap: 0.5rem; margin-bottom: 0.5rem; padding: 0 0.75rem; color: var(--text-secondary); font-size: 0.65rem; font-weight: 700; text-transform: uppercase;">
                        <div>Model</div>
                        <div>Dia</div>
                        <div>Gauge</div>
                        <div>Feeders</div>
                        <div>Qty</div>
                        <div></div>
                    </div>
                    <div id="specs-container">"""
    
    if '<div id="specs-header"' not in content and '<div id="specs-container">' in content:
        content = content.replace('<div id="specs-container">', header_html)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

base_dir = r"d:\Enquiry website"
for html_file in glob.glob(os.path.join(base_dir, "*.html")):
    process_file(html_file)

public_dir = os.path.join(base_dir, "public")
if os.path.exists(public_dir):
    for html_file in glob.glob(os.path.join(public_dir, "*.html")):
        process_file(html_file)

print("HTML modifications complete.")
