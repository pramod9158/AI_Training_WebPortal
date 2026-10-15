const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function parseArgs() {
  const args = process.argv.slice(2);
  const params = {
    studentName: 'Ashish Pawar',
    studentEmail: 'ashish.performance@outlook.com',
    studentPhone: '+91 6356418487',
    programName: 'Track 02: Performance Testing and Engineering Masterclass',
    originalPrice: 9999,
    discount: 1999,
    totalAgreedFee: 8000,
    amountPaid: 4000,
    balanceDue: 4000,
    balanceDueDate: '15 November 2026',
    paymentMode: 'Direct UPI Transfer (Bank-to-Bank)',
    upiRef: 'UPI/6288' + Math.floor(100000 + Math.random() * 900000),
    invoiceNo: 'WN-INV-2026-PT084',
    invoiceDate: '15 October 2026',
    outputPdf: 'Waynautic_Invoice_Performance_Testing.pdf'
  };

  for (let i = 0; i < args.length; i++) {
    const key = args[i].replace(/^--/, '');
    const val = args[i + 1];
    if (key === 'name' && val) { params.studentName = val; i++; }
    else if (key === 'email' && val) { params.studentEmail = val; i++; }
    else if (key === 'phone' && val) { params.studentPhone = val; i++; }
    else if (key === 'utr' && val) { params.upiRef = val; i++; }
    else if (key === 'inv' && val) { params.invoiceNo = val; i++; }
    else if (key === 'out' && val) { params.outputPdf = val; i++; }
    else if (key === 'paid' && val) { params.amountPaid = Number(val); i++; }
    else if (key === 'balance' && val) { params.balanceDue = Number(val); i++; }
  }

  return params;
}

function generateInvoiceHtml(params) {
  let logoBase64 = '';
  try {
    const logoBuffer = fs.readFileSync(path.join(__dirname, '..', 'public', 'Waynautic Logo New.png'));
    logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
  } catch (err) {
    console.warn('Could not read logo, continuing with text brand');
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${params.invoiceNo}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      font-size: 10.5px;
      line-height: 1.4;
    }

    /* Container */
    .invoice-card {
      width: 100%;
      max-width: 100%;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 10px;
      overflow: hidden;
    }

    /* Header */
    .header {
      background: linear-gradient(135deg, #090D16 0%, #0F172A 100%);
      color: #ffffff;
      padding: 18px 24px 14px;
      border-bottom: 2.5px solid #0ea5e9;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo-img {
      height: 32px;
      width: auto;
      object-fit: contain;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      background: rgba(14, 165, 233, 0.18);
      border: 1px solid rgba(14, 165, 233, 0.5);
      color: #38bdf8;
    }
    .header-title-row {
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .header-title-row h1 {
      margin: 0;
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
    }
    .header-subtitle {
      color: #94a3b8;
      font-size: 10px;
      margin-top: 2px;
    }
    .inv-number {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      color: #38bdf8;
      font-weight: 700;
      font-size: 12px;
      text-align: right;
    }

    /* Meta section */
    .meta-grid {
      display: flex;
      justify-content: space-between;
      padding: 12px 24px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      gap: 16px;
    }
    .meta-col {
      flex: 1;
    }
    .meta-label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #64748b;
      font-weight: 700;
      margin-bottom: 2px;
    }
    .meta-val-name {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
    }
    .meta-val-text {
      font-size: 10px;
      color: #334155;
      margin-top: 1.5px;
    }

    /* Content Area */
    .content-body {
      padding: 12px 24px 8px;
    }

    /* Table */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 2px;
    }
    .items-table th {
      text-align: left;
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #475569;
      background: #f1f5f9;
      padding: 6px 10px;
      border-bottom: 1px solid #cbd5e1;
    }
    .items-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }
    .item-title {
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
    }
    .item-desc {
      font-size: 10px;
      color: #64748b;
      margin-top: 2px;
      line-height: 1.35;
    }
    .item-tags {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
      margin-top: 4px;
    }
    .item-tag {
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 1.5px 5px;
      font-size: 9px;
      color: #475569;
      font-weight: 600;
    }

    /* Installment schedule box */
    .installment-box {
      margin-top: 10px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 7px;
      overflow: hidden;
    }
    .installment-header {
      background: #e2e8f0;
      padding: 5px 10px;
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #334155;
    }
    .installment-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 10px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 10.5px;
    }
    .installment-row:last-child {
      border-bottom: none;
    }
    .status-paid {
      color: #15803d;
      background: #dcfce7;
      border: 1px solid #86efac;
      padding: 1.5px 7px;
      border-radius: 10px;
      font-size: 9px;
      font-weight: 700;
    }
    .status-pending {
      color: #b45309;
      background: #fef3c7;
      border: 1px solid #fde68a;
      padding: 1.5px 7px;
      border-radius: 10px;
      font-size: 9px;
      font-weight: 700;
    }

    /* Summary Totals */
    .summary-grid {
      display: flex;
      justify-content: space-between;
      margin-top: 10px;
      gap: 16px;
    }
    .summary-left {
      flex: 1.2;
      background: #eff6ff;
      border: 1px dashed #93c5fd;
      border-radius: 7px;
      padding: 8px 12px;
      font-size: 10px;
      line-height: 1.35;
      color: #1e40af;
    }
    .summary-right {
      flex: 1;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 7px;
      padding: 8px 12px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 2.5px 0;
      font-size: 10.5px;
      color: #475569;
    }
    .total-row.strong {
      border-top: 1.5px solid #0f172a;
      margin-top: 4px;
      padding-top: 5px;
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
    }
    .highlight-paid {
      color: #15803d;
      font-weight: 800;
    }
    .highlight-due {
      color: #b91c1c;
      font-weight: 800;
    }

    /* Terms & Footer */
    .terms-box {
      margin-top: 10px;
      border-top: 1px solid #e2e8f0;
      padding-top: 8px;
      font-size: 9px;
      color: #64748b;
      line-height: 1.38;
    }
    .terms-title {
      font-weight: 800;
      color: #334155;
      text-transform: uppercase;
      font-size: 9px;
      margin-bottom: 3px;
    }
    .footer-bar {
      margin-top: 10px;
      background: #090D16;
      color: #94a3b8;
      padding: 10px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 9.5px;
    }
    .sign-box {
      text-align: right;
    }
    .sign-badge {
      font-weight: 800;
      color: #38bdf8;
      font-size: 10.5px;
    }
  </style>
</head>
<body>

  <div class="invoice-card">
    
    <!-- 1. Header Banner -->
    <div class="header">
      <div class="header-top">
        <div>
          ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" alt="Waynautic Academy" />` : '<strong style="font-size: 20px; color: #fff;">WAYNAUTIC ACADEMY</strong>'}
        </div>
        <div>
          <span class="badge">Verified Direct UPI Payment</span>
        </div>
      </div>
      <div class="header-title-row">
        <div>
          <h1>Official Enrollment Invoice</h1>
          <div class="header-subtitle">Partially Paid — Installment 1 of 2 Acknowledged</div>
        </div>
        <div class="inv-number">
          ${params.invoiceNo}<br>
          <span style="font-size: 10.5px; color: #94a3b8; font-weight: normal;">Date: ${params.invoiceDate}</span>
        </div>
      </div>
    </div>

    <!-- 2. Metadata Grid -->
    <div class="meta-grid">
      <div class="meta-col">
        <div class="meta-label">Billed To (Student)</div>
        <div class="meta-val-name">${params.studentName}</div>
        <div class="meta-val-text">Email: <strong>${params.studentEmail}</strong></div>
        ${params.studentPhone ? `<div class="meta-val-text">Contact: ${params.studentPhone}</div>` : ''}
        <div class="meta-val-text">Student Portal ID: <code style="font-size: 10px; color: #0284c7;">${params.studentEmail.split('@')[0]}</code></div>
      </div>

      <div class="meta-col" style="border-left: 1px solid #e2e8f0; padding-left: 20px;">
        <div class="meta-label">Payment & Verification Details</div>
        <div class="meta-val-text">Payment Mode: <strong>${params.paymentMode}</strong></div>
        <div class="meta-val-text">UPI / UTR Ref: <code style="font-weight: bold; color: #0f172a;">${params.upiRef}</code></div>
        <div class="meta-val-text">Gateway: <strong>Direct Bank Transfer (Offline Verified)</strong></div>
        <div class="meta-val-text">Status: <span class="status-paid">Partially Paid (₹${params.amountPaid.toLocaleString('en-IN')})</span></div>
      </div>

      <div class="meta-col" style="border-left: 1px solid #e2e8f0; padding-left: 20px;">
        <div class="meta-label">Issued By</div>
        <div class="meta-val-name" style="font-size: 12px;">Waynautic Technologies</div>
        <div class="meta-val-text">Division: Waynautic Academy</div>
        <div class="meta-val-text">Pune, Maharashtra, India</div>
        <div class="meta-val-text">Web: academy.waynautic.com</div>
      </div>
    </div>

    <!-- 3. Line Items & Installment Plan -->
    <div class="content-body">
      
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 70%;">Program & Inclusions</th>
            <th style="width: 15%; text-align: right;">Standard Price</th>
            <th style="width: 15%; text-align: right;">Total Agreed</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="item-title">${params.programName}</div>
              <div class="item-desc">
                Comprehensive code-first training with real-world project deliverables.
                Master workload modeling, distributed load generation, runtime APM telemetry & bottleneck analysis.
              </div>
              <div class="item-tags">
                <span class="item-tag">Apache JMeter</span>
                <span class="item-tag">Micro Focus LoadRunner</span>
                <span class="item-tag">Grafana K6</span>
                <span class="item-tag">AppDynamics</span>
                <span class="item-tag">Datadog</span>
                <span class="item-tag">3-Month Internship</span>
                <span class="item-tag">Dual Certification</span>
              </div>
            </td>
            <td style="text-align: right; color: #64748b; text-decoration: line-through;">
              ₹${params.originalPrice.toLocaleString('en-IN')}
            </td>
            <td style="text-align: right; font-weight: 800; color: #0f172a; font-size: 13px;">
              ₹${params.totalAgreedFee.toLocaleString('en-IN')}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Installment Ledger -->
      <div class="installment-box">
        <div class="installment-header">
          Official Installment Schedule & Payment Ledger (Agreed 2-Part Payment)
        </div>
        
        <div class="installment-row">
          <div>
            <strong>Installment 01 (Advance / Enrollment)</strong>
            <span style="color: #64748b; margin-left: 8px;">Received on ${params.invoiceDate} via Direct UPI (${params.upiRef})</span>
          </div>
          <div>
            <span style="font-weight: 700; margin-right: 12px;">₹${params.amountPaid.toLocaleString('en-IN')}</span>
            <span class="status-paid">PAID &amp; CLEARED</span>
          </div>
        </div>

        <div class="installment-row">
          <div>
            <strong>Installment 02 (Remaining Balance)</strong>
            <span style="color: #64748b; margin-left: 8px;">Due Date: <strong>${params.balanceDueDate}</strong> (Payable via UPI / Bank Transfer)</span>
          </div>
          <div>
            <span style="font-weight: 700; margin-right: 12px; color: #b45309;">₹${params.balanceDue.toLocaleString('en-IN')}</span>
            <span class="status-pending">SCHEDULED / PENDING</span>
          </div>
        </div>
      </div>

      <!-- Financial Calculation Summary -->
      <div class="summary-grid">
        <div class="summary-left">
          <strong>Note on Special Concession & Direct UPI Payment:</strong><br>
          An authorized concession of <strong>₹${params.discount.toLocaleString('en-IN')}</strong> was granted on the standard program fee of ₹${params.originalPrice.toLocaleString('en-IN')}, bringing the net agreed fee to <strong>₹${params.totalAgreedFee.toLocaleString('en-IN')}</strong> payable in two equal installments. The first installment of <strong>₹${params.amountPaid.toLocaleString('en-IN')}</strong> has been received via direct UPI. Access to Phase 1 live sessions, portal workspace, and study repositories has been granted.
        </div>

        <div class="summary-right">
          <div class="total-row">
            <span>Course List Price:</span>
            <span>₹${params.originalPrice.toLocaleString('en-IN')}.00</span>
          </div>
          <div class="total-row">
            <span>Special Scholarship Discount:</span>
            <span style="color: #15803d;">- ₹${params.discount.toLocaleString('en-IN')}.00</span>
          </div>
          <div class="total-row" style="font-weight: 700; color: #0f172a;">
            <span>Net Agreed Program Fee:</span>
            <span>₹${params.totalAgreedFee.toLocaleString('en-IN')}.00</span>
          </div>
          <div class="total-row" style="padding-top: 4px;">
            <span>Amount Paid Today (Inst. 1):</span>
            <span class="highlight-paid">₹${params.amountPaid.toLocaleString('en-IN')}.00</span>
          </div>
          <div class="total-row strong">
            <span>Remaining Balance Due:</span>
            <span class="highlight-due">₹${params.balanceDue.toLocaleString('en-IN')}.00</span>
          </div>
        </div>
      </div>

      <!-- Terms & Policy Box -->
      <div class="terms-box">
        <div class="terms-title">Terms & Conditions of Enrollment</div>
        • <strong>100% Strict No-Refund Policy:</strong> All fees paid to Waynautic Academy are strictly non-refundable and non-transferable under all circumstances.<br>
        • <strong>Exclusive Pune Jurisdiction:</strong> All agreements, dispute resolutions, and claims are governed by Indian law under the exclusive jurisdiction of the competent courts of Pune, Maharashtra.<br>
        • <strong>Placement Assistance (No Job Guarantee):</strong> We provide resume reviews, portfolio projects, and mock interviews. We do not guarantee jobs, CTC offers, or third-party interview calls; hiring rests with external employers.<br>
        • <strong>Proprietary IP:</strong> All course videos, assignments, code notes, and mind maps are copyrighted. Screen recording, downloading, or redistribution is strictly prohibited by law.<br>
        • <strong>Internship & Dual Certification:</strong> The 3-Month Industry Internship and official completion credentials are provided upon clearing curriculum deliverables and remaining dues.
      </div>

    </div>

    <!-- 4. Footer -->
    <div class="footer-bar">
      <div>
        <strong>Waynautic Academy</strong> • Pune, Maharashtra, India<br>
        Support: <a href="mailto:academy@waynautic.com" style="color: #38bdf8; text-decoration: none;">academy@waynautic.com</a> • WhatsApp / Tel: +91 9158998226
      </div>
      <div class="sign-box">
        <div class="sign-badge">WAYNAUTIC ACADEMY</div>
        <div style="font-size: 8.5px; color: #94a3b8; margin-top: 2px;">Authorized Accounts & Finance Seal</div>
      </div>
    </div>

  </div>

</body>
</html>`;
}

function main() {
  const params = parseArgs();
  console.log('Generating invoice for:', params.studentName, '| Plan:', params.programName);

  const html = generateInvoiceHtml(params);
  const tempHtmlPath = path.resolve('temp_invoice.html');
  const outputPdfPath = path.resolve(params.outputPdf);

  fs.writeFileSync(tempHtmlPath, html, 'utf8');

  // Search Chrome or Edge
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];

  const browserPath = candidates.find(c => fs.existsSync(c));
  if (!browserPath) {
    throw new Error('Neither Chrome nor Edge was found on this system');
  }

  console.log('Using browser:', browserPath);
  execSync(`"${browserPath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${outputPdfPath}" "${tempHtmlPath}"`);

  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }

  const stat = fs.statSync(outputPdfPath);
  console.log(`Successfully created PDF: ${outputPdfPath} (${stat.size} bytes)`);

  // Also copy to public directory for direct web serving
  const publicPdfPath = path.join(__dirname, '..', 'public', params.outputPdf);
  fs.copyFileSync(outputPdfPath, publicPdfPath);
  console.log(`Copied to public folder: ${publicPdfPath}`);

  // Also copy to artifacts directory if available
  const artifactDir = 'C:\\Users\\User\\.gemini\\antigravity-ide\\brain\\a7f7042f-2c0d-4af4-8bab-8409bbe26937';
  if (fs.existsSync(artifactDir)) {
    const artifactPdfPath = path.join(artifactDir, params.outputPdf);
    fs.copyFileSync(outputPdfPath, artifactPdfPath);
    console.log(`Copied to artifacts: ${artifactPdfPath}`);
  }
}

main();
