document.addEventListener('DOMContentLoaded', () => {
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const jobList = document.getElementById('jobList');
  const generateBtn = document.getElementById('generateBtn');
  const preview = document.getElementById('invoicePreview');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadPdfBtn');

  let loadedJobs = [];

  // Load jobs from calendar within selected range
  document.getElementById('loadJobsBtn').addEventListener('click', async () => {
    const start = startDateInput.value;
    const end = endDateInput.value;

    if (!start || !end) {
      return alert('Please select a start and end date.');
    }

    try {
      const res = await fetch(`/api/calendar/jobs?start=${start}&end=${end}`);
      const data = await res.json();

      loadedJobs = data;
      jobList.innerHTML = '';

      if (data.length === 0) {
        jobList.innerHTML = '<p>No jobs found for this range.</p>';
        return;
      }

      data.forEach((job, index) => {
        const div = document.createElement('div');
        div.innerHTML = `
          <label>
            <input type="checkbox" data-index="${index}" checked />
            ${job.date} — ${job.jobType} at ${job.address}
          </label>
        `;
        jobList.appendChild(div);
      });

    } catch (err) {
      console.error('Error loading jobs:', err);
      alert('Failed to load jobs.');
    }
  });

  // Generate invoice preview
  generateBtn.addEventListener('click', () => {
    const company = document.getElementById('companyName').value.trim();
    const client = document.getElementById('clientName').value.trim();
    const rate = parseFloat(document.getElementById('hourlyRate').value);
    const notes = document.getElementById('invoiceNotes').value.trim();

    const selectedJobs = Array.from(jobList.querySelectorAll('input[type="checkbox"]:checked'))
      .map(cb => loadedJobs[cb.dataset.index]);

    let totalHours = selectedJobs.reduce((sum, job) => sum + (job.totalHours || 0), 0);
    let totalAmount = rate * totalHours;

    let text = `INVOICE\n\nFrom: ${company}\nTo: ${client}\n\n`;
    text += `Hourly Rate: $${rate.toFixed(2)}\n\n`;
    text += `Jobs Included:\n`;

    selectedJobs.forEach(job => {
      text += `- ${job.date} | ${job.jobType} | ${job.address} | ${job.totalHours || 0} hrs\n`;
    });

    text += `\nTotal Hours: ${totalHours} hrs\n`;
    text += `Total Amount Due: $${totalAmount.toFixed(2)}\n\n`;

    if (notes) {
      text += `Notes:\n${notes}\n`;
    }

    preview.value = text;
  });

  // Copy invoice text
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(preview.value).then(() => {
      alert('Invoice copied to clipboard.');
    });
  });

  // Download invoice as PDF
  downloadBtn.addEventListener('click', async () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFont("courier");
    const lines = preview.value.split('\n');
    lines.forEach((line, i) => doc.text(line, 10, 10 + (i * 7)));
    doc.save("invoice.pdf");
  });
});