// ============================
// CALENDAR.JS - Cleaned + Fixed
// ============================

let calendar;
let jobs = [];

function refreshCalendarEvents() {
  const updatedEvents = jobs.map(job => {
    let bgColor = '#7A3EF0'; // Default purple

    if (job.invoiceStatus === 'unpaid') {
      bgColor = '#e74c3c'; // Red
    } else if (job.invoiceStatus === 'paid') {
      bgColor = '#27ae60'; // Green
    }

    return {
      title: job.jobType || job.address || 'Scheduled Job',
      start: job.date,
      backgroundColor: bgColor,
      borderColor: bgColor,
      textColor: '#fff',
      extendedProps: { ...job }
    };
  });

  calendar.removeAllEvents();
  calendar.addEventSource(updatedEvents);
   calendar.refetchEvents();
}

document.addEventListener('DOMContentLoaded', async () => {
  let activeModal = null;
  const calendarEl = document.getElementById('calendar');
  const jobModal = document.getElementById('jobModal');
  const jobForm = document.getElementById('jobForm');
  const addJobBtn = document.getElementById('addJobBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const groupedModal = document.getElementById('groupedDetailsModal');

  const res = await fetch('/api/calendar');
  jobs = await res.json();
  

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    aspectRatio: 1.15,
    events: [],

    eventClick: function(info) {
      if (activeModal === 'grouped') return;

      const eventJob = info.event.extendedProps;
      const job = jobs.find(j => j._id === eventJob._id);
      if (!job) return;

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
      activeModal = 'details';
    }
  });
  calendar.render();
  refreshCalendarEvents();

  // Search Logic
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
    const modal = document.getElementById('groupedDetailsModal');
    const tbody = document.getElementById('groupedJobRows');
    if (!modal || !tbody) return;

    document.getElementById('groupedClientName').textContent = name;
    document.getElementById('groupedClientAddress').textContent = address;

    tbody.innerHTML = '';
    let totalField = 0;
    let totalOffice = 0;

    jobGroup.forEach(job => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${job.date || 'N/A'}</td>
        <td>${job.fieldHours || 0}</td>
        <td>${job.officeHours || 0}</td>
        <td><button class="cta-button small">Edit</button></td>
      `;
      row.querySelector('button').addEventListener('click', () => {
        modal.style.display = 'none';
        const match = jobGroup.find(j => j._id === job._id);
        if (match) {
          prefillJobForm(match);
          jobForm.dataset.editing = match._id;
          jobModal.style.display = 'flex';
        }
      });
      totalField += parseFloat(job.fieldHours) || 0;
      totalOffice += parseFloat(job.officeHours) || 0;
      tbody.appendChild(row);
    });

    document.getElementById('totalFieldHours').textContent = totalField.toFixed(1);
    document.getElementById('totalOfficeHours').textContent = totalOffice.toFixed(1);

    document.getElementById('groupedInvoiceStatus').value = '';
    modal.style.display = 'flex';
    activeModal = 'grouped';
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

  document.getElementById('saveInvoiceStatusBtn').addEventListener('click', async () => {
    const status = document.getElementById('groupedInvoiceStatus').value;
    if (!status) return alert('Please select an invoice status.');

    const name = document.getElementById('groupedClientName').textContent;
    const address = document.getElementById('groupedClientAddress').textContent;

    try {
      const res = await fetch('/api/calendar/update-invoice-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address, invoiceStatus: status })
      });

      const data = await res.json();
      if (data.success) {
        for (let job of jobs) {
          if (job.jobType === name && job.address === address) {
            job.invoiceStatus = status;
          }
        }
        refreshCalendarEvents();
        calendar.render();
        alert('Invoice status updated.');
        closeGroupedModal();
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (err) {
      console.error('Invoice update failed:', err);
      alert('There was an error updating invoice status.');
    }
  });
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
  document.getElementById('invoiceStatus').value = job.invoiceStatus || '';
}