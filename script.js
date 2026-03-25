let mockData = [];

// Process and render data
function processAndRender(data) {
    mockData = JSON.parse(JSON.stringify(data)); // deep clone
    // Map MongoDB _id string to id standard property for frontend parsing if needed
    mockData.forEach((item, index) => {
        item.id = item._id;
        // assign a pseudo referral number based on index if not stored in DB
        item.referralNumber = mockData.length - index; 
        
        // Format dates safely for frontend view
        if (item.createdAt) item.enquiryDate = new Date(item.createdAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
        
        // Handle quoteDate logic: Use manual quoteDate for pending, createdAt for issued if quoteDate is missing
        if (item.quoteStatus === 'Pending') {
            item.displayQuoteDate = item.quoteDate || '-';
        } else {
            // For issued quotes, if no manual date was ever set, fall back to updatedAt/createdAt
            item.displayQuoteDate = item.quoteDate || new Date(item.updatedAt || item.createdAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
        }
        
        if (!item.revisedQuote) item.revisedQuote = 'N/A';
    });
    renderTable();
    fetchUserProfile(); // Hydrate user name and profile
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
}


// DOM Elements
const tableBody = document.getElementById('enquiry-body');
const modalOverlay = document.getElementById('modal');
const btnNewEnquiry = document.getElementById('btn-new');
const btnClose = document.getElementById('btn-close');
const form = document.getElementById('enquiry-form');
let editIndex = -1;

// Update Stats
function updateStats() {
    const elTotal = document.getElementById('stat-total');
    if (elTotal) elTotal.innerText = mockData.length;
    
    const elIssued = document.getElementById('stat-issued');
    if (elIssued) elIssued.innerText = mockData.filter(d => d.quoteStatus === 'Issued').length;
    
    const elPending = document.getElementById('stat-pending');
    if (elPending) elPending.innerText = mockData.filter(d => d.quoteStatus === 'Pending').length;
    
    const elRevised = document.getElementById('stat-revised');
    // A quote is considered revised if the text contains 'Revised' or if it doesn't contain 'N/A'/'Pending Review' depending on logic
    // We already prepend "Revised - " to all real revisions in the form submit
    if (elRevised) elRevised.innerText = mockData.filter(d => d.revisedQuote.toLowerCase().includes('revised')).length;
}

// Check Reminders
function checkReminders() {
    const remindersContainer = document.getElementById('reminders-container');
    if (!remindersContainer) return;

    remindersContainer.innerHTML = '';
    const today = new Date();
    
    // Only check reminders on the main dashboard (where container exists)
    const pendingEnquiries = mockData.filter(d => d.quoteStatus === 'Pending');
    let reminderCount = 0;
    
    pendingEnquiries.forEach(item => {
        const enqDate = new Date(item.enquiryDate);
        if (isNaN(enqDate.getTime())) return; // skip if invalid date
        
        const diffTime = Math.abs(today - enqDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 7) {
            reminderCount++;
            const alertDiv = document.createElement('div');
            alertDiv.className = 'reminder-alert';
            alertDiv.innerHTML = `
                <div class="reminder-icon"><i class="ri-alert-line"></i></div>
                <div class="reminder-content">
                    <h4>Quotation Reminder: REF #${item.referralNumber.toString().padStart(4, '0')}</h4>
                    <p>Enquiry from <strong>${item.clientName}</strong> has been pending for over a week. Please talk back to the customer <strong>${item.customerName}</strong> about the quotation.</p>
                </div>
            `;
            remindersContainer.appendChild(alertDiv);
        }
    });
}

// Update Notification Badge
function updateNotificationBadge() {
    const badge = document.getElementById('nav-notification-badge');
    if (!badge) return;

    const today = new Date();
    const pendingEnquiries = mockData.filter(d => d.quoteStatus === 'Pending');
    let reminderCount = 0;
    
    pendingEnquiries.forEach(item => {
        const enqDate = new Date(item.enquiryDate);
        if (isNaN(enqDate.getTime())) return;
        
        const diffTime = Math.abs(today - enqDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 7) {
            reminderCount++;
        }
    });

    if (reminderCount > 0) {
        badge.style.display = 'flex';
        badge.innerText = reminderCount;
    } else {
        badge.style.display = 'none';
        badge.innerText = '0';
    }
}

// Render Table Data
function renderTable() {
    if (!tableBody) return; // if no table body exists
    tableBody.innerHTML = '';
    
    let filteredData = [...mockData];
    
    // Ensure backward compatibility
    filteredData.forEach(d => {
        if (!d.projectStatus) d.projectStatus = 'Active';
    });
    
    // Check which page we are on to filter
    const currentPage = window.location.pathname.split('/').pop().split('.')[0];
    
    if (currentPage === 'total-enquiries') {
        // Do nothing to filteredData. We want all records to show here.
    } else if (currentPage === 'quotes-issued') {
        filteredData = filteredData.filter(d => d.quoteStatus === 'Issued');
    } else if (currentPage === 'pending-quotes') {
        filteredData = filteredData.filter(d => d.quoteStatus === 'Pending');
    } else if (currentPage === 'revised-quotes') {
        filteredData = filteredData.filter(d => d.revisedQuote.toLowerCase().includes('revised'));
    } else if (currentPage === 'project-postponed') {
        filteredData = filteredData.filter(d => d.projectStatus === 'Postponed');
    } else if (currentPage === 'project-confirmed') {
        filteredData = filteredData.filter(d => d.projectStatus === 'Confirmed');
    } else if (currentPage === 'project-drop') {
        filteredData = filteredData.filter(d => d.projectStatus === 'Dropped');
    } else if (currentPage === 'order-lost') {
        filteredData = filteredData.filter(d => d.projectStatus === 'Lost');
    }

    // Sort descending by reference number on the home page
    if (currentPage === 'home' || currentPage === '' || currentPage === 'index') {
        filteredData.sort((a, b) => b.referralNumber - a.referralNumber);
    }

    filteredData.forEach((item, index) => {
        const tr = document.createElement('tr');
        
        // Determine badge styling based on status
        const quoteBadgeClass = item.quoteStatus === 'Issued' ? 'status-issued' : 'status-pending';
        const quoteIcon = item.quoteStatus === 'Issued' ? 'ri-check-line' : 'ri-time-line';
        
        let overdueWarning = '';
        if (item.quoteStatus === 'Pending') {
            const enqDate = new Date(item.enquiryDate);
            if (!isNaN(enqDate.getTime())) {
                const diffDays = Math.ceil(Math.abs(new Date() - enqDate) / (1000 * 60 * 60 * 24));
                if (diffDays > 7) {
                    overdueWarning = `<span style="display:block; margin-top:0.4rem; color:#ef4444; font-size:0.8rem; font-weight:600;"><i class="ri-error-warning-line"></i> Warning: Overdue</span>`;
                }
            }
        }
        
        const revisedBadgeClass = item.revisedQuote.includes('Revised') ? 'status-revised' : 
                                  (item.revisedQuote === 'Pending Review' ? 'status-pending' : '');
        
        const revisedHTML = revisedBadgeClass ? 
            `<span class="status-badge ${revisedBadgeClass}">${item.revisedQuote}</span>` : 
            `<span style="color: #94a3b8;">${item.revisedQuote}</span>`;

        // If on order-lost page, display "transferredTo" instead of "revisedQuote"
        const column4HTML = currentPage === 'order-lost' ? 
            `<span style="color: #ef4444; font-weight: 500;">${item.transferredTo || '-'}</span>` : 
            revisedHTML;

        // Render machine configurations
        let machineConfigsHTML = '';
        try {
            let configs = [];
            // Case 1: JSON in machineDia
            try {
                if (item.machineDia && item.machineDia.trim().startsWith('[')) {
                    const parsed = JSON.parse(item.machineDia);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        configs = parsed.map(c => {
                            return {
                                model: c.model || '-',
                                dia: c.dia || '-',
                                gauge: c.gauge || '-',
                                feeders: c.feeders || '-',
                                qty: c.qty || 1
                            };
                        });
                    } else if (Array.isArray(parsed) && parsed.length === 0) {
                        // If it's an empty array, fall back to legacy fields
                        throw new Error("Empty array");
                    } else {
                        throw new Error("Not an array");
                    }
                } else {
                    throw new Error("Not JSON");
                }
            } catch (e) {
                // Case 2: Standard single-machine record (old behavior or fallback)
                // If it's the JSON string "[]", safely treat it as '-'
                let literalDia = item.machineDia || '-';
                if (literalDia === '[]') literalDia = '-';

                configs = [{
                    model: item.machineModel || '-',
                    dia: literalDia,
                    gauge: item.machineGauge || '-',
                    feeders: item.machineFeeders || '-',
                    qty: item.machineQty || 1
                }];
            }

            const hasConfigs = configs.length > 0;
            // Only show header if we actually have data to show and it's not and empty set
            const tableHeaderHTML = hasConfigs ? `
                <div style="display: grid; grid-template-columns: 24px 2fr 1fr 1fr 1fr 0.8fr; gap: 0.5rem; padding: 0.25rem 0.75rem; color: var(--text-secondary); font-size: 0.65rem; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 0.25rem;">
                    <div>#</div>
                    <div>Model</div>
                    <div>Dia</div>
                    <div>Gauge</div>
                    <div>Feeders</div>
                    <div>Qty</div>
                </div>` : '';

            machineConfigsHTML = tableHeaderHTML + configs.map((c, i) => `
                <div style="padding:0.4rem 0.75rem; border: 1px solid rgba(255,255,255,0.03); border-radius: 4px; background: rgba(255,255,255,0.01); font-size:0.8rem; display: grid; grid-template-columns: 24px 2fr 1fr 1fr 1fr 0.8fr; gap: 0.5rem; align-items: center; white-space: nowrap;">
                    <span style="color: var(--primary-accent); font-weight: 700; font-size: 0.7rem;">#${i+1}</span>
                    <span style="color:var(--text-primary); font-weight: 700; overflow: hidden; text-overflow: ellipsis;">${c.model}</span>
                    <span style="color:var(--text-primary); font-weight: 600;">${c.dia}</span>
                    <span style="color:var(--text-primary); font-weight: 600;">${c.gauge}</span>
                    <span style="color:var(--text-primary); font-weight: 600;">${c.feeders}</span>
                    <span style="color:var(--text-primary); font-weight: 600;">${c.qty}</span>
                </div>
            `).join('');

        } catch (e) {
            console.error("Rendering error:", e);
            machineConfigsHTML = '<div style="color:#ef4444;">Data Error</div>';
        }

        const specsHTML = `<div style="margin-top: 0.5rem;">${machineConfigsHTML}</div>`;

        tr.innerHTML = `
            <td>
                <div class="customer-info" style="margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px dashed rgba(255,255,255,0.1);">
                    <span style="color: var(--primary-accent); font-weight: 600; font-size: 0.8rem; text-transform: uppercase;">
                        REF #${item.referralNumber.toString().padStart(4, '0')}
                    </span>
                    <span style="float: right; font-size: 0.8rem; color: var(--text-secondary);">
                        Enq: ${item.enquiryDate || 'Unknown'}
                    </span>
                </div>
                <div class="customer-info">
                    <strong>${item.clientName}</strong>
                    <span><i class="ri-user-line" style="vertical-align: middle;"></i> ${item.customerName}</span><br>
                    <span><i class="ri-phone-line" style="vertical-align: middle;"></i> ${item.contact}</span><br>
                    <span><i class="ri-mail-line" style="vertical-align: middle;"></i> ${item.email || '-'}</span>
                </div>
            </td>
            <td>
                <span style="font-weight: 500; display:block;">${item.machineTypes}</span>
                <span class="status-badge" style="margin-top:0.4rem; padding: 0.2rem 0.5rem; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:#cbd5e1; font-size:0.75rem;"><i class="ri-folder-info-line"></i> ${item.projectStatus || 'Active'}</span>
                ${specsHTML}
            </td>
            <td>
                <div class="customer-info">
                    <span class="status-badge ${quoteBadgeClass}">
                        <i class="${quoteIcon}"></i> ${item.quoteStatus}
                    </span>
                    <span style="display:block; margin-top:0.4rem; font-size: 0.8rem;">
                        ${item.displayQuoteDate !== '-' ? '<i class="ri-calendar-event-line"></i> ' + item.displayQuoteDate : '&nbsp;'}
                    </span>
                    ${overdueWarning}
                </div>
            </td>
            <td>${column4HTML}</td>
            <td>
                <div style="display: flex; gap: 0.75rem;">
                    <button class="action-btn" onclick="openNotes(${mockData.indexOf(item)})" title="View/Edit Notes" style="background:rgba(139, 92, 246, 0.1); border:none; color:#a78bfa; cursor:pointer; font-size:1.1rem; padding: 0.4rem 0.6rem; border-radius: 6px; transition: all 0.2s;">
                        <i class="ri-book-read-line"></i>
                    </button>
                    <button class="action-btn" onclick="printEntry(${mockData.indexOf(item)})" title="Print Enquiry" style="background:rgba(16, 185, 129, 0.1); border:none; color:#10b981; cursor:pointer; font-size:1.1rem; padding: 0.4rem 0.6rem; border-radius: 6px; transition: all 0.2s;">
                        <i class="ri-printer-line"></i>
                    </button>
                    ${(currentPage !== 'quotes-issued' && currentPage !== 'total-enquiries') ? `<button class="action-btn" onclick="editEntry(${mockData.indexOf(item)})" style="background:rgba(59, 130, 246, 0.1); border:none; color:#3b82f6; cursor:pointer; font-size:1.1rem; padding: 0.4rem 0.6rem; border-radius: 6px; transition: all 0.2s;">
                        <i class="ri-edit-line"></i>
                    </button>` : ''}
                    <button class="action-btn" onclick="deleteEntry(${mockData.indexOf(item)})" style="background:rgba(248, 113, 113, 0.1); border:none; color:#f87171; cursor:pointer; font-size:1.1rem; padding: 0.4rem 0.6rem; border-radius: 6px; transition: all 0.2s;">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(tr);
    });
    updateStats();
}

// Edit Entry
window.editEntry = function(index) {
    const item = mockData[index];
    if (!item) return;
    
    // Check if the modal exists on this page
    if (!modalOverlay || !form) {
        alert("Edit functionality is currently unavailable on this page layout.");
        return;
    }
    
    document.getElementById('clientName').value = item.clientName || '';
    document.getElementById('customerName').value = item.customerName || '';
    document.getElementById('contact').value = item.contact || '';
    if(document.getElementById('email')) document.getElementById('email').value = item.email || '';
    document.getElementById('machineTypes').value = item.machineTypes || '';
    
    // Clear and rebuild dynamic configuration rows
    const specsContainer = document.getElementById('specs-container');
    if (specsContainer) {
        specsContainer.innerHTML = '';
        try {
            const configs = JSON.parse(item.machineDia);
            if (Array.isArray(configs) && configs.length > 0) {
                configs.forEach(c => {
                    addMachineRow(
                        c.model || item.machineModel || '', 
                        c.dia || '', 
                        c.gauge || item.machineGauge || '', 
                        c.feeders || item.machineFeeders || '', 
                        c.qty || 1
                    );
                });
            } else {
                addMachineRow(item.machineModel || '', item.machineDia === '[]' ? '' : (item.machineDia || ''), item.machineGauge || '', item.machineFeeders || '', item.machineQty || 1);
            }
        } catch (e) {
            addMachineRow(item.machineModel || '', item.machineDia || '', item.machineGauge || '', item.machineFeeders || '', item.machineQty || 1);
        }
    }
    
    
    if(document.getElementById('projectStatus')) document.getElementById('projectStatus').value = item.projectStatus || 'Active';
    if(document.getElementById('transferredTo')) document.getElementById('transferredTo').value = item.transferredTo || '';
    
    document.getElementById('quoteStatus').value = item.quoteStatus || 'Pending';
    if(document.getElementById('quoteDate')) document.getElementById('quoteDate').value = item.quoteDate || '';
    
    // Toggle quoteDate visibility
    const quoteDateGroup = document.getElementById('quoteDateGroup');
    if (quoteDateGroup) {
        quoteDateGroup.style.display = (item.quoteStatus === 'Pending') ? 'block' : 'none';
    }
    
    let displayRevised = item.revisedQuote;
    if (displayRevised.startsWith('Revised - ')) {
        displayRevised = displayRevised.replace('Revised - ', '');
    } else if (displayRevised === 'N/A' || displayRevised === 'Pending Review') {
        displayRevised = '';
    }
    document.getElementById('revisedQuote').value = displayRevised || '';
    
    // Trigger change event for projectStatus
    if(document.getElementById('projectStatus')) {
        const event = new Event('change');
        document.getElementById('projectStatus').dispatchEvent(event);
    }
    
    editIndex = index;
    
    const header = modalOverlay.querySelector('.modal-header h2');
    if (header) header.innerText = 'Edit Enquiry';
    
    modalOverlay.classList.add('active');
};

let notesIndex = -1;
window.openNotes = function(index) {
    const item = mockData[index];
    if (!item) return;
    
    notesIndex = index;
    const notesModal = document.getElementById('notes-modal');
    const notesTextarea = document.getElementById('notes-textarea');
    
    if (notesModal && notesTextarea) {
        notesTextarea.value = item.notes || '';
        notesModal.classList.add('active');
    }
};

window.saveNotes = function() {
    if (notesIndex === -1) return;
    const item = mockData[notesIndex];
    const notes = document.getElementById('notes-textarea').value;
    
    fetch(`/api/enquiries/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
    }).then(res => res.json()).then(data => {
        if(data.success) {
            fetchData(true);
            document.getElementById('notes-modal').classList.remove('active');
            notesIndex = -1;
        } else {
            alert('Error saving notes: ' + data.error);
        }
    }).catch(err => console.error('Error saving notes:', err));
};

window.printEntry = function(index) {
    const item = mockData[index];
    if (!item) return;

    const printWindow = window.open('', '_blank');
    const date = new Date(item.createdAt).toLocaleDateString();
    
    let machinesHTML = '';
    let configs = [];
    try {
        // Parse from machineDia if it contains JSON array
        if (item.machineDia && item.machineDia.trim().startsWith('[')) {
            const parsed = JSON.parse(item.machineDia);
            if (Array.isArray(parsed) && parsed.length > 0) {
                configs = parsed.map(c => ({
                    model: c.model || '-',
                    dia: c.dia || '-',
                    gauge: c.gauge || '-',
                    feeders: c.feeders || '-',
                    qty: c.qty || 1
                }));
            } else if (Array.isArray(parsed) && parsed.length === 0) {
                throw new Error("Empty array");
            } else {
                throw new Error("Not an array");
            }
        } else {
            throw new Error("Not JSON");
        }
    } catch (e) {
        // Fallback for single machine record
        let literalDia = item.machineDia || '-';
        if (literalDia === '[]') literalDia = '-';

        configs = [{
            model: item.machineModel || '-',
            dia: literalDia,
            gauge: item.machineGauge || '-',
            feeders: item.machineFeeders || '-',
            qty: item.machineQty || 1
        }];
    }

    configs.forEach((c, i) => {
        machinesHTML += `
            <tr>
                <td>${i + 1}</td>
                <td>${c.model}</td>
                <td>${c.dia}</td>
                <td>${c.gauge}</td>
                <td>${c.feeders}</td>
                <td>${c.qty}</td>
            </tr>
        `;
    });

    printWindow.document.write(`
        <html>
            <head>
                <title>Enquiry - ${item.clientName}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
                    .brand { font-size: 24px; font-weight: 800; color: #3b82f6; }
                    .enquiry-info { text-align: right; }
                    .section { margin-bottom: 30px; }
                    .section-title { font-size: 18px; font-weight: 700; margin-bottom: 15px; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                    .field { margin-bottom: 10px; }
                    .label { font-weight: 600; color: #64748b; font-size: 14px; }
                    .value { font-size: 16px; margin-top: 2px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
                    th { background: #f8fafc; color: #64748b; font-size: 13px; text-transform: uppercase; }
                    .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #94a3b8; text-align: center; }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="brand">KNITWAY INDIA PVT LTD</div>
                    <div class="enquiry-info">
                        <div style="font-weight: 700;">ENQUIRY REPORT</div>
                        <div style="font-size: 14px; color: #64748b;">Ref: #ENQ-${item.id ? item.id.substring(item.id.length - 4).toUpperCase() : 'NEW'}</div>
                        <div style="font-size: 14px; color: #64748b;">Date: ${date}</div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Customer Information</div>
                    <div class="grid">
                        <div class="field">
                            <div class="label">Client / Company Name</div>
                            <div class="value">${item.clientName}</div>
                        </div>
                        <div class="field">
                            <div class="label">Customer Name</div>
                            <div class="value">${item.customerName}</div>
                        </div>
                        <div class="field">
                            <div class="label">Contact Details</div>
                            <div class="value">${item.contact}</div>
                        </div>
                        <div class="field">
                            <div class="label">Email Address</div>
                            <div class="value">${item.email || '-'}</div>
                        </div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Machine Requirements</div>
                    <div class="field">
                        <div class="label">Types of Machines Requested</div>
                        <div class="value">${item.machineTypes || '-'}</div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Model</th>
                                <th>Dia</th>
                                <th>Gauge</th>
                                <th>Feeders</th>
                                <th>Qty</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${machinesHTML}
                        </tbody>
                    </table>
                </div>

                <div class="section">
                    <div class="section-title">Status & Quotation</div>
                    <div class="grid">
                        <div class="field">
                            <div class="label">Project Status</div>
                            <div class="value">${item.projectStatus}</div>
                        </div>
                        <div class="field">
                            <div class="label">Quotation Status</div>
                            <div class="value">${item.quoteStatus}</div>
                        </div>
                        <div class="field">
                            <div class="label">Quotation Date</div>
                            <div class="value">${item.displayQuoteDate || '-'}</div>
                        </div>
                        <div class="field">
                            <div class="label">Revised Quote</div>
                            <div class="value">${item.revisedQuote || '-'}</div>
                        </div>
                    </div>
                </div>

                ${item.notes ? `
                <div class="section">
                    <div class="section-title">Additional Notes</div>
                    <div class="value" style="white-space: pre-wrap;">${item.notes}</div>
                </div>
                ` : ''}

                <div class="footer">
                    This is a computer generated report for KNITWAY INDIA PVT LTD.
                </div>

                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
        </html>
    `);
    printWindow.document.close();
};

// Delete Entry
window.deleteEntry = function(index) {
    const item = mockData[index];
    if(!item) return;

    if(confirm("Are you sure you want to delete this enquiry?")) {
        fetch(`/api/enquiries/${item.id}`, {
            method: 'DELETE'
        }).then(res => res.json()).then(data => {
            if(data.success) {
                fetchData(true); // Reload all data
            } else {
                alert('Error deleting enquiry: ' + data.error);
            }
        }).catch(err => console.error('Error deleting:', err));
    }
};

// Modal handlers
// Modal handlers
if (btnNewEnquiry) {
    btnNewEnquiry.addEventListener('click', () => {
        editIndex = -1;
        if (form) form.reset();
        
        // Reset dynamic spec rows to one empty row
        const specsContainer = document.getElementById('specs-container');
        if (specsContainer) {
            specsContainer.innerHTML = '';
            addMachineRow(); // Add one initial configuration box
        }
        
        // Reset quoteDate and visibility
        if(document.getElementById('quoteDate')) document.getElementById('quoteDate').value = '';
        const quoteDateGroup = document.getElementById('quoteDateGroup');
        if (quoteDateGroup) quoteDateGroup.style.display = 'block'; // Default status is Pending
        
        const header = modalOverlay.querySelector('.modal-header h2');
        if (header) header.innerText = 'Add New Enquiry';
        modalOverlay.classList.add('active');
        document.getElementById('clientName').focus();
    });
}

if (btnClose) {
    btnClose.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
    });
}

if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if(e.target === modalOverlay) {
            modalOverlay.classList.remove('active');
        }
    });
}

// Form Submission
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const clientName = document.getElementById('clientName').value;
        const customerName = document.getElementById('customerName').value;
        const contact = document.getElementById('contact').value;
        const email = document.getElementById('email') ? document.getElementById('email').value : '';
        const machineTypes = document.getElementById('machineTypes').value;
        
        // Collect all dynamic machine configurations
        const machineConfigs = [];
        let totalQty = 0;
        const configRows = document.querySelectorAll('.machine-config-box');
        configRows.forEach(box => {
            const model = box.querySelector('.field-model').value;
            const dia = box.querySelector('.field-dia').value;
            const gauge = box.querySelector('.field-gauge').value;
            const feeders = box.querySelector('.field-feeders').value;
            const qty = parseInt(box.querySelector('.field-qty').value) || 0;
            
            if (model || dia || gauge || feeders || qty > 0) {
                machineConfigs.push({ model, dia, gauge, feeders, qty });
                totalQty += qty;
            }
        });
        
        // If no dynamic rows were found or they were all empty, try reading legacy single fields (for page.tsx or older layouts)
        if (machineConfigs.length === 0) {
            const legacyModel = document.getElementById('machineModel') ? document.getElementById('machineModel').value : '';
            const legacyDia = document.getElementById('machineDia') ? document.getElementById('machineDia').value : '';
            const legacyGauge = document.getElementById('machineGauge') ? document.getElementById('machineGauge').value : '';
            const legacyFeeders = document.getElementById('machineFeeders') ? document.getElementById('machineFeeders').value : '';
            const legacyQty = document.getElementById('machineQty') ? (parseInt(document.getElementById('machineQty').value) || 1) : 1;
            
            if (legacyModel || legacyDia || legacyGauge || legacyFeeders) {
                machineConfigs.push({ model: legacyModel, dia: legacyDia, gauge: legacyGauge, feeders: legacyFeeders, qty: legacyQty });
                totalQty = legacyQty;
            }
        }
        
        const machineDiaValue = JSON.stringify(machineConfigs);
        const machineQtyValue = totalQty;
        
        // Root fields kept for backward compatibility (using values from the first machine entry)
        const firstMachine = machineConfigs[0] || {};
        const machineModelValue = firstMachine.model || '';
        const machineGaugeValue = firstMachine.gauge || '';
        const machineFeedersValue = firstMachine.feeders || '';

        const projectStatus = document.getElementById('projectStatus') ? document.getElementById('projectStatus').value : 'Active';
        const transferredTo = document.getElementById('transferredTo') ? document.getElementById('transferredTo').value : '';
        const quoteStatus = document.getElementById('quoteStatus').value;
        const quoteDate = document.getElementById('quoteDate') ? document.getElementById('quoteDate').value : '';
        let revisedQuote = document.getElementById('revisedQuote').value;
        
        if (!revisedQuote.trim()) {
            revisedQuote = quoteStatus === 'Pending' ? 'N/A' : 'Pending Review';
        } else if (!revisedQuote.toLowerCase().includes('revised')) {
            // Just formatting the user input nicely
            revisedQuote = "Revised - " + revisedQuote;
        }

        if (editIndex > -1) {
            // Update existing entry via PUT request
            const existing = mockData[editIndex];
            const updatedEntry = {
                clientName, customerName, contact, email, machineTypes,
                machineModel: machineModelValue, 
                machineDia: machineDiaValue, 
                machineGauge: machineGaugeValue, 
                machineFeeders: machineFeedersValue, 
                machineQty: machineQtyValue,
                projectStatus, transferredTo, quoteStatus, quoteDate,
                revisedQuote
            };
            
            fetch(`/api/enquiries/${existing.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedEntry)
            }).then(res => res.json()).then(data => {
                if(data.success) {
                    editIndex = -1;
                    fetchData(true); // Reload all data
                    modalOverlay.classList.remove('active');
                    form.reset();
                } else {
                    alert('Error updating enquiry: ' + data.error);
                }
            }).catch(err => console.error('Error updating:', err));

        } else {
            // Create new entry via POST request
            const newEntry = {
                clientName, customerName, contact, email, machineTypes,
                machineModel: machineModelValue, 
                machineDia: machineDiaValue, 
                machineGauge: machineGaugeValue, 
                machineFeeders: machineFeedersValue, 
                machineQty: machineQtyValue,
                projectStatus, transferredTo, quoteStatus, quoteDate,
                revisedQuote
            };
            
            fetch('/api/enquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEntry)
            }).then(res => res.json()).then(data => {
                if(data.success) {
                    fetchData(true); // Reload all data to get the new DB-assigned ID
                    modalOverlay.classList.remove('active');
                    form.reset();
                } else {
                    alert('Error saving enquiry: ' + data.error);
                }
            }).catch(err => console.error('Error saving:', err));
        }

    });
}

// Function to add dynamic Machine Configuration Box
function addMachineRow(model = '', dia = '', gauge = '', feeders = '', qty = 1) {
    const container = document.getElementById('specs-container');
    if (!container) return;

    const box = document.createElement('div');
    box.className = 'machine-config-box';
    box.style.border = '1px solid rgba(255,255,255,0.06)';
    box.style.padding = '0.75rem';
    box.style.borderRadius = '8px';
    box.style.background = 'rgba(255,255,255,0.015)';
    box.style.marginBottom = '0.75rem';
    box.style.position = 'relative';

    box.innerHTML = `
        <div style="display: grid; grid-template-columns: 2.5fr 1fr 1fr 1fr 0.8fr 32px; gap: 0.5rem; align-items: center;">
            <div class="form-group" style="margin-bottom: 0;">
                <input type="text" class="form-control field-model" style="padding: 0.45rem 0.5rem; font-size: 0.85rem;" placeholder="Machine Model" value="${model}">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <input type="text" class="form-control field-dia" style="padding: 0.45rem 0.5rem; font-size: 0.85rem;" placeholder="Dia" value="${dia}">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <input type="text" class="form-control field-gauge" style="padding: 0.45rem 0.5rem; font-size: 0.85rem;" placeholder="Gauge" value="${gauge}">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <input type="text" class="form-control field-feeders" style="padding: 0.45rem 0.5rem; font-size: 0.85rem;" placeholder="Feeders" value="${feeders}">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
                <input type="number" class="form-control field-qty" style="padding: 0.45rem 0.5rem; font-size: 0.85rem;" placeholder="Qty" min="1" value="${qty}">
            </div>
            <button type="button" class="remove-config-btn" title="Remove" style="background: rgba(239, 68, 68, 0.1); border: none; color: #ef4444; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                <i class="ri-delete-bin-line" style="font-size: 0.9rem;"></i>
            </button>
        </div>
    `;

    box.querySelector('.remove-config-btn').addEventListener('click', () => {
        const boxes = container.querySelectorAll('.machine-config-box');
        if (boxes.length > 1) {
            box.remove();
        } else {
            // Reset fields instead of removing last box
            box.querySelectorAll('input').forEach(input => input.value = input.type === 'number' ? 1 : '');
        }
    });

    container.appendChild(box);
}

// Function to fetch logged-in user profile
async function fetchUserProfile() {
    try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data.success && data.user) {
            const profileName = document.getElementById('user-display-name');
            if (profileName) profileName.innerText = data.user.fullName;
            
            const profileRole = document.getElementById('user-display-role');
            if (profileRole) profileRole.innerText = 'Connected';

            const avatarImg = document.getElementById('user-display-avatar');
            if (avatarImg) {
                const initials = (data.user.firstName[0] + data.user.lastName[0]).toUpperCase();
                avatarImg.src = `https://ui-avatars.com/api/?name=${initials}&background=3b82f6&color=fff&bold=true`;
            }
        }
    } catch (error) {
        console.error('Error fetching user profile:', error);
    }
}

// Global setup for specifications
const addSpecBtn = document.getElementById('add-spec-btn');
if (addSpecBtn) {
    addSpecBtn.addEventListener('click', () => addMachineRow());
}

// Setup Initial State
window.initDashboard = function initDashboard() {
    if (typeof window.fetchData === 'function') window.fetchData();
    else fetchData();
    
    // Toggle Transferred To field visibility
    const projectStatusEl = document.getElementById('projectStatus');
    const transferredToGroup = document.getElementById('transferredToGroup');
    if (projectStatusEl && transferredToGroup) {
        // Remove old listener if exists to prevent duplicates (rudimentary way)
        const newEl = projectStatusEl.cloneNode(true);
        if(projectStatusEl.parentNode) projectStatusEl.parentNode.replaceChild(newEl, projectStatusEl);
        
        newEl.addEventListener('change', (e) => {
            if (e.target.value === 'Lost') {
                transferredToGroup.style.display = 'block';
            } else {
                transferredToGroup.style.display = 'none';
            }
        });
    }

    // Toggle Quote Date visibility
    const quoteStatusEl = document.getElementById('quoteStatus');
    const quoteDateGroup = document.getElementById('quoteDateGroup');
    if (quoteStatusEl && quoteDateGroup) {
        quoteStatusEl.addEventListener('change', (e) => {
            if (e.target.value === 'Pending') {
                quoteDateGroup.style.display = 'block';
            } else {
                quoteDateGroup.style.display = 'none';
            }
        });
    }

    // Notes Modal Close
    const notesBtnClose = document.getElementById('notes-btn-close');
    const notesModal = document.getElementById('notes-modal');
    if (notesBtnClose && notesModal) {
        notesBtnClose.addEventListener('click', () => {
            notesModal.classList.remove('active');
        });
        notesModal.addEventListener('click', (e) => {
            if (e.target === notesModal) notesModal.classList.remove('active');
        });
    }

    // Save Notes Button
    const btnSaveNotes = document.getElementById('btn-save-notes');
    if (btnSaveNotes) {
        btnSaveNotes.addEventListener('click', window.saveNotes);
    }
}

// Make sure fetchData is available globally as well
window.fetchData = fetchData;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.initDashboard);
} else {
    // DOM already fully loaded (common when Next.js dynamically injects scripts)
    window.initDashboard();
}

// Global Logout Handler for Static Pages
window.handleLogout = async function(e) {
    e.preventDefault();
    try {
        const response = await fetch('/api/auth/logout', { method: 'POST' });
        if (response.ok) {
            window.location.href = '/login';
        } else {
            console.error('Logout failed');
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
};
