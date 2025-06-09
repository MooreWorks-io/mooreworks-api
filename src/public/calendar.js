document.addEventListener('DOMContentLoaded', async () => {
  const calendarEl = document.getElementById('calendar');
  const jobModal = document.getElementById('jobModal');
  const jobForm = document.getElementById('jobForm');
  const addJobBtn = document.getElementById('addJobBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  // Fetch jobs from backend
  const res = await fetch('/api/calendar');
  const jobs = await res.json();

  const events = jobs.map(job => ({
    title: job.jobType || job.address || 'Scheduled Job',
    start: job.date,
    extendedProps: {
      _id: job._id,
      jobType: job.jobType,
      crew: job.crew,
      address: job.address,
      fieldHours: job.fieldHours,
      officeHours: job.officeHours,
      jobBrief: job.jobBrief,
      invoiceStatus: job.invoiceStatus,
      date: job.date
    }
  }));

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 'auto',
    events: events,
    eventClick: function(info) {
      const job = info.event.extendedProps;
      document.getElementById('detailsTitle').innerText = job.jobType || job.address || 'Job';
      document.getElementById('detailsAddress').innerText = job.address || 'N/A';
      document.getElementById('detailsType').innerText = job.jobType || 'N/A';
      document.getElementById('detailsDate').innerText = job.date || 'N/A';
      document.getElementById('detailsCrew').innerText = job.crew || 'N/A';
      document.getElementById('detailsFieldHours').innerText = job.fieldHours || 'N/A';
      document.getElementById('detailsOfficeHours').innerText = job.officeHours || 'N/A';
      document.getElementById('detailsNotes').innerText = job.jobBrief || 'N/A';
      document.getElementById('detailsInvoiceStatus').innerText = job.invoiceStatus || 'Unsent Invoice';
      document.getElementById('editJobBtn').dataset.jobId = job._id;
      document.getElementById('jobDetailsPopup').style.display = 'flex';
    }
  });

  calendar.render();

  const searchInput = document.getElementById('jobSearchInput');
  const resultsList = document.getElementById('searchResults');

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    resultsList.innerHTML = '';
    if (!query) {
      resultsList.style.display = 'none';
      return;
    }

    const grouped = {};
    jobs.forEach(job => {
      const name = job.jobType || '';
      const address = job.address || '';
      if (name.toLowerCase().includes(query) || address.toLowerCase().includes(query)) {
        const key = `${name}||${address}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(job);
      }
    });

    Object.entries(grouped).forEach(([key, jobGroup]) => {
      const [name, address] = key.split('||');
      const li = document.createElement('li');
      li.textContent = `${name || 'Job'} — ${address || 'No Address'}`;
      li.style.padding = '0.5rem';
      li.style.cursor = 'pointer';
      li.style.borderBottom = '1px solid #eee';
      li.addEventListener('click', () => {
        searchInput.value = '';
        resultsList.style.display = 'none';
        openGroupedModal(name, address, jobGroup);
      });
      resultsList.appendChild(li);
    });

    resultsList.style.display = Object.keys(grouped).length ? 'block' : 'none';
  });

  window.closeDetailsPopup = function () {
    document.getElementById('jobDetailsPopup').style.display = 'none';
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

  jobForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(jobForm);
    const jobData = Object.fromEntries(formData.entries());
    jobData.invoiceStatus = document.getElementById('invoiceStatus').value || '';
    jobData.fieldHours = parseFloat(jobData.fieldHours) || 0;
    jobData.officeHours = parseFloat(jobData.officeHours) || 0;
    const isEditing = jobForm.dataset.editing;

    const res = await fetch(`/api/calendar${isEditing ? '/' + isEditing : ''}`, {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(jobData)
    });

    jobForm.dataset.editing = '';
    jobModal.style.display = 'none';
    window.location.reload();
  });

  window.openGroupedModal = function(name, address, jobGroup) {
    document.getElementById('jobDetailsPopup').style.display = 'none';
    document.getElementById('groupedClientName').textContent = name;
    document.getElementById('groupedClientAddress').textContent = address;
    const tbody = document.getElementById('groupedJobRows');
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
      editBtn.onclick = () => {
        closeGroupedModal();
        const match = jobs.find(j => j._id === job._id);
        if (match) {
          prefillJobForm(match);
          jobForm.dataset.editing = match._id;
          document.getElementById('jobModal').style.display = 'flex';
        }
      };
      editCell.appendChild(editBtn);

      row.appendChild(dateCell);
      row.appendChild(fieldCell);
      row.appendChild(officeCell);
      row.appendChild(editCell);
      tbody.appendChild(row);
    });

    document.getElementById('totalFieldHours').textContent = totalField.toFixed(1);
    document.getElementById('totalOfficeHours').textContent = totalOffice.toFixed(1);
    const groupedModal = document.getElementById('groupedDetailsModal');
if (!groupedModal) return;
groupedModal.style.display = 'flex';
  };

  window.closeGroupedModal = function () {
    document.getElementById('groupedDetailsModal').style.display = 'none';
  };

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

  document.getElementById('deleteJobBtn').addEventListener('click', async () => {
    const jobId = document.getElementById('editJobBtn').dataset.jobId;
    if (!jobId) return;

    const confirmDelete = confirm('Are you sure you want to delete this job?');
    if (!confirmDelete) return;

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
}); // ✅ Closes DOMContentLoaded