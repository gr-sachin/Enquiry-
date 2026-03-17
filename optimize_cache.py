import os

def optimize_script(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace the fetchData block completely
    old_fetch_block = '''// Fetch data from MongoDB via Next.js API
async function fetchData() {
    try {
        const response = await fetch('/api/enquiries');
        const result = await response.json();
        
        if (result.success) {
            mockData = result.data;
            // Map MongoDB _id string to id standard property for frontend parsing if needed
            mockData.forEach((item, index) => {
                item.id = item._id;
                // assign a pseudo referral number based on index if not stored in DB
                item.referralNumber = mockData.length - index; 
                
                // Format dates safely for frontend view
                if (item.createdAt) item.enquiryDate = new Date(item.createdAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
                if (!item.quoteDate) item.quoteDate = item.quoteStatus === 'Issued' ? new Date(item.updatedAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : '-';
                if (!item.revisedQuote) item.revisedQuote = 'N/A';
            });
            renderTable();
            if (typeof checkReminders === 'function') checkReminders();
            if (typeof updateNotificationBadge === 'function') updateNotificationBadge();
        } else {
            console.error('Failed to load enquiries:', result.error);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}'''

    new_fetch_block = '''// Process and render data
function processAndRender(data) {
    mockData = JSON.parse(JSON.stringify(data)); // deep clone
    // Map MongoDB _id string to id standard property for frontend parsing if needed
    mockData.forEach((item, index) => {
        item.id = item._id;
        // assign a pseudo referral number based on index if not stored in DB
        item.referralNumber = mockData.length - index; 
        
        // Format dates safely for frontend view
        if (item.createdAt) item.enquiryDate = new Date(item.createdAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
        if (!item.quoteDate) item.quoteDate = item.quoteStatus === 'Issued' ? new Date(item.updatedAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : '-';
        if (!item.revisedQuote) item.revisedQuote = 'N/A';
    });
    renderTable();
    if (typeof checkReminders === 'function') checkReminders();
    if (typeof updateNotificationBadge === 'function') updateNotificationBadge();
}

// Fetch data from MongoDB via Next.js API
async function fetchData(forceFetch = false) {
    try {
        // Instant load from cache if available to prevent layout shifting
        const cached = sessionStorage.getItem('enquiries_data');
        if (cached && !forceFetch) {
            processAndRender(JSON.parse(cached));
        }

        // Always fetch fresh data in background (or foreground if forceFetch)
        const response = await fetch('/api/enquiries');
        const result = await response.json();
        
        if (result.success) {
            sessionStorage.setItem('enquiries_data', JSON.stringify(result.data));
            processAndRender(result.data);
        } else {
            console.error('Failed to load enquiries:', result.error);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}'''

    content = content.replace(old_fetch_block, new_fetch_block)

    # 2. Update all mutation points with fetchData(true) to force cache invalidation
    content = content.replace('fetchData(); // Reload all data', 'fetchData(true); // Reload all data')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

base_script = r"d:\\Enquiry website\\script.js"
public_script = r"d:\\Enquiry website\\public\\script.js"

optimize_script(base_script)
optimize_script(public_script)

print("Caching optimization complete.")
