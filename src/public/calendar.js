let jobs = [];
document.addEventListener('DOMContentLoaded', async () => {
  let activeModal = null;
  const calendarEl = document.getElementById('calendar');
  const jobModal = document.getElementById('jobModal');
  const jobForm = document.getElementById('jobForm');
  const addJobBtn = document.getElementById('addJobBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const groupedModal = document.getElementById('groupedDetailsModal');

  const res = await fetch('/api/calendar');
  const jobs = await res.json();

  const events = jobs.map(job => ({
    title: job.jobType || job.address || 'Scheduled Job',
    start: job.date,
    extendedProps: { ...job }
  }));

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    aspectRatio: 1.15,
    events,
   eventClick: function(info) {
  if (activeModal === 'grouped') {
  return; // still prevent opening if grouped modal is *currently* open
}

  const job = info.event.extendedProps;
  console.log('Clicked job:', job);
  document.getElementById('detailsTitle').innerText = job.jobType || job.address || 'Job';
  document.getElementById('detailsAddress').innerText = job.address || 'N/A';
  document.getElementById('detailsType').innerText = job.jobType || 'N/A';
  document.getElementById('detailsDate').innerText = job.date || 'N/A';
  document.getElementById('detailsCrew').innerText = job.crew || 'N/A';
  document.getElementById('detailsFieldHours').innerText = job.fieldHours || 'N/A';
  document.getElementById('detailsOfficeHours').innerText = job.officeHours || 'N/A';
  document.getElementById('detailsNotes').innerText = job.jobBrief || 'N/A';
document.getElementById('detailsInvoiceStatus').innerText =
  job.invoiceStatus === 'paid' ? 'Invoice Sent (Paid)' :
  job.invoiceStatus === 'unpaid' ? 'Invoice Sent (Unpaid)' :
  'Unsent Invoice'; 
  document.getElementById('editJobBtn').dataset.jobId = job._id;
  document.getElementById('jobDetailsPopup').style.display = 'flex';
  activeModal = 'details'; // ✅ track which modal is open
} 
  });
  calendar.render();

  const searchInput = document.getElementById('jobSearchInput');
  const resultsList = document.getElementById('searchResults');

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    resultsList.innerHTML = '';
    if (!query) return (resultsList.style.display = 'none');

    const grouped = {};
    jobs.forEach(job => {
      const key = `${job.jobType}||${job.address}`;
      if (job.jobType.toLowerCase().includes(query) || job.address.toLowerCase().includes(query)) {
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(job);
      }
    });

    Object.entries(grouped).forEach(([key, jobGroup]) => {
      const [name, address] = key.split('||');
      const li = document.createElement('li');
      li.textContent = `${name || 'Job'} — ${address || 'No Address'}`;
      li.className = 'search-result-item';
      li.addEventListener('click', () => {
  console.log('Search result clicked:', name, address);
  searchInput.value = '';
  resultsList.style.display = 'none';
  openGroupedModal(name, address, jobGroup);
});
      resultsList.appendChild(li);
    });

    resultsList.style.display = Object.keys(grouped).length ? 'block' : 'none';
  });

  window.closeDetailsPopup = () => {
    document.getElementById('jobDetailsPopup').style.display = 'none';
     activeModal = null;
  };

  window.closeGroupedModal = () => {
    document.getElementById('groupedDetailsModal').style.display = 'none';
     activeModal = null;
  };

  window.openGroupedModal = function(name, address, jobGroup) {
  console.log('Grouped modal function called:', name, jobGroup);

  // Hide any existing modals
  document.getElementById('jobDetailsPopup').style.display = 'none';
  document.getElementById('jobModal').style.display = 'none';
  document.getElementById('groupedDetailsModal').style.display = 'none';

  const modal = document.getElementById('groupedDetailsModal');
  const tbody = document.getElementById('groupedJobRows');
  if (!modal || !tbody) {
    console.error('Grouped modal elements not found');
    return;
  }

  // Set header content
  document.getElementById('groupedClientName').textContent = name;
  document.getElementById('groupedClientAddress').textContent = address;

  // Reset table rows and totals
  tbody.innerHTML = '';
  let totalField = 0;
  let totalOffice = 0;

  jobGroup.forEach(job => {
    const row = document.createElement('tr');

    const dateCell = document.createElement('td');
    dateCell.textContent = job.date || 'N/A';

    const fieldCell = document.createElement('td');
    fieldCell.textContent = job.fieldHours || 0;
    totalField += parseFloat(job.fieldHours) || 0;

    const officeCell = document.createElement('td');
    officeCell.textContent = job.officeHours || 0;
    totalOffice += parseFloat(job.officeHours) || 0;

    const editCell = document.createElement('td');
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'cta-button small';
    editBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      const match = jobGroup.find(j => j._id === job._id);
      if (match) {
        prefillJobForm(match);
        jobForm.dataset.editing = match._id;
        document.getElementById('jobModal').style.display = 'flex';
      }
    });

    editCell.appendChild(editBtn);
    row.appendChild(dateCell);
    row.appendChild(fieldCell);
    row.appendChild(officeCell);
    row.appendChild(editCell);
    tbody.appendChild(row);
  });

  document.getElementById('totalFieldHours').textContent = totalField.toFixed(1);
  document.getElementById('totalOfficeHours').textContent = totalOffice.toFixed(1);

  const invoiceStatusSelect = document.getElementById('groupedInvoiceStatus');
  invoiceStatusSelect.value = '';

  // Show modal
  modal.style.display = 'flex';
};

  document.getElementById('editJobBtn').addEventListener('click', () => {
    const jobId = document.getElementById('editJobBtn').dataset.jobId;
    const job = jobs.find(j => j._id === jobId);
    if (!job) return;
    closeDetailsPopup();
    prefillJobForm(job);
    jobForm.dataset.editing = job._id;
    jobModal.style.display = 'flex';
  });

  addJobBtn.addEventListener('click', () => {
    jobForm.dataset.editing = '';
    jobForm.reset();
    document.getElementById('modalHeader').textContent = 'Add New Job';
    jobModal.style.display = 'flex';
  });

  cancelBtn.addEventListener('click', () => {
    jobModal.style.display = 'none';
  });

  jobForm.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(jobForm);
    const jobData = Object.fromEntries(formData.entries());
    jobData.fieldHours = parseFloat(jobData.fieldHours) || 0;
    jobData.officeHours = parseFloat(jobData.officeHours) || 0;
    const isEditing = jobForm.dataset.editing;

    await fetch(`/api/calendar${isEditing ? '/' + isEditing : ''}`, {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(jobData)
    });

    jobForm.dataset.editing = '';
    jobModal.style.display = 'none';
    window.location.reload();
  });

  document.getElementById('deleteJobBtn').addEventListener('click', async () => {
    const jobId = document.getElementById('editJobBtn').dataset.jobId;
    if (!jobId) return;
    if (!confirm('Are you sure you want to delete this job?')) return;

    const res = await fetch(`/api/calendar/${jobId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (res.ok) {
      closeDetailsPopup();
      window.location.reload();
    } else {
      alert('Failed to delete job.');
    }
  });

  function prefillJobForm(job) {
    document.getElementById('modalHeader').textContent = 'Edit Job';
    document.getElementById('jobType').value = job.jobType || '';
    document.getElementById('date').value = job.date || '';
    document.getElementById('crew').value = job.crew || '';
    document.getElementById('address').value = job.address || '';
    document.getElementById('fieldHours').value = job.fieldHours || 0;
    document.getElementById('officeHours').value = job.officeHours || 0;
    document.getElementById('jobBrief').value = job.jobBrief || '';
  }
});

document.getElementById('saveInvoiceStatusBtn').addEventListener('click', async () => {
  const status = document.getElementById('groupedInvoiceStatus').value;
  if (!status) return alert('Please select an invoice status.');

  const name = document.getElementById('groupedClientName').textContent;
  const address = document.getElementById('groupedClientAddress').textContent;

  try {
    const res = await fetch('/api/calendar/update-invoice-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        address,
        invoiceStatus: status
      })
    });

    const data = await res.json();
    if (data.success) {
      for (let job of jobs) {
    if (job.name === name && job.address === address) {
      job.invoiceStatus = status;
    }
  }
      alert('Invoice status updated for all matching jobs.');
      document.getElementById('groupedDetailsModal').style.display = 'none';
      activeModal = null;
    } else {
      throw new Error(data.message || 'Failed to update jobs');
    }
  } catch (err) {
    console.error('Invoice update failed:', err);
    alert('There was an error updating invoice status.');
  }
});