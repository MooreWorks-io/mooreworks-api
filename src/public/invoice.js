document.addEventListener('DOMContentLoaded', async () => {
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const jobList = document.getElementById('jobList');
  const generateBtn = document.getElementById('generateBtn');
  const preview = document.getElementById('invoicePreview');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadPdfBtn');

  const fieldRateInput = document.getElementById('fieldRate');
  const officeRateInput = document.getElementById('officeRate');
  const courthouseRateInput = document.getElementById('courthouseRate');

  let loadedJobs = [];

  // Step 1: Load user hourly rates from account settings
  try {
    const res = await fetch('/api/user/rates');
    const rates = await res.json();
    fieldRateInput.value = rates.fieldRate || 0;
    officeRateInput.value = rates.officeRate || 0;
    courthouseRateInput.value = rates.courthouseRate || 0;
  } catch (err) {
    console.error('Failed to load user rates:', err);
  }

  // Step 2: Load jobs within selected date range
  document.getElementById('loadJobsBtn').addEventListener('click', async () => {
    const start = startDateInput.value;
    const end = endDateInput.value;

    if (!start || !end) return alert('Please select a start and end date.');

    try {
      const res = await fetch(`/api/calendar/jobs?start=${start}&end=${end}`);
      const jobs = await res.json();
      loadedJobs = jobs;
      jobList.innerHTML = '';

      if (!jobs.length) {
        jobList.innerHTML = '<p>No jobs found for this range.</p>';
        return;
      }

      jobs.forEach((job, i) => {
        const label = document.createElement('label');
        label.innerHTML = `
          <input type="checkbox" data-index="${i}" checked />
          ${job.date} — ${job.jobType} at ${job.address}
        `;
        jobList.appendChild(label);
      });
    } catch (err) {
      console.error('Error loading jobs:', err);
      alert('Failed to load jobs.');
    }
  });

  // Step 3: Generate invoice text
  generateBtn.addEventListener('click', () => {
    const company = document.getElementById('companyName').value.trim();
    const client = document.getElementById('clientName').value.trim();
    const notes = document.getElementById('invoiceNotes').value.trim();

    const fieldRate = parseFloat(fieldRateInput.value) || 0;
    const officeRate = parseFloat(officeRateInput.value) || 0;
    const courthouseRate = parseFloat(courthouseRateInput.value) || 0;

    const selectedJobs = Array.from(jobList.querySelectorAll('input[type="checkbox"]:checked'))
      .map(cb => loadedJobs[cb.dataset.index]);

    let totalField = 0, totalOffice = 0, totalCourt = 0;

    selectedJobs.forEach(job => {
      totalField += job.fieldHours || 0;
      totalOffice += job.officeHours || 0;
      totalCourt += job.courthouseHours || 0;
    });

    const totalDue =
      (totalField * fieldRate) +
      (totalOffice * officeRate) +
      (totalCourt * courthouseRate);

    let output = `INVOICE\n\nFrom: ${company}\nTo: ${client}\n\n`;
    output += `Rates:\n- Field: $${fieldRate.toFixed(2)}\n- Office: $${officeRate.toFixed(2)}\n- Courthouse: $${courthouseRate.toFixed(2)}\n\n`;
    output += `Jobs Included:\n`;

    selectedJobs.forEach(job => {
      output += `- ${job.date} | ${job.jobType} | ${job.address}\n`;
      output += `  Field: ${job.fieldHours || 0}h, Office: ${job.officeHours || 0}h, Courthouse: ${job.courthouseHours || 0}h\n`;
    });

    output += `\nTotals:\n`;
    output += `- Field: ${totalField}h x $${fieldRate.toFixed(2)} = $${(totalField * fieldRate).toFixed(2)}\n`;
    output += `- Office: ${totalOffice}h x $${officeRate.toFixed(2)} = $${(totalOffice * officeRate).toFixed(2)}\n`;
    output += `- Courthouse: ${totalCourt}h x $${courthouseRate.toFixed(2)} = $${(totalCourt * courthouseRate).toFixed(2)}\n`;
    output += `\nTotal Amount Due: $${totalDue.toFixed(2)}\n`;

    if (notes) output += `\nNotes:\n${notes}`;

    preview.value = output;
  });

  // Step 4: Copy invoice text
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(preview.value).then(() => {
      alert('Invoice copied to clipboard.');
    });
  });

  // Step 5: Download invoice as PDF
  downloadBtn.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFont('courier');
    preview.value.split('\n').forEach((line, i) => {
      doc.text(line, 10, 10 + i * 7);
    });
    doc.save('invoice.pdf');
  });
});