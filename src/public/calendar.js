document.addEventListener('DOMContentLoaded', async () => {
  const calendarEl = document.getElementById('calendar');
  const jobModal = document.getElementById('jobModal');
  const jobForm = document.getElementById('jobForm');
  const addJobBtn = document.getElementById('addJobBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  // Fetch jobs from backend
  const res = await fetch('/api/calendar');
  const jobs = await res.json();

  // Convert to FullCalendar event format
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
      date: job.date
    }
  }));

  // Initialize calendar
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 'auto',
    events: events,
    eventClick: function(info) {
      const job = info.event.extendedProps;

      // Prefill modal
      prefillJobForm(job);
      jobForm.dataset.editing = job._id;
      jobModal.style.display = 'flex';

      // Add Delete button if not already added
      if (!document.getElementById('deleteFromModal')) {
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.id = 'deleteFromModal';
        deleteBtn.style.marginLeft = '10px';
        deleteBtn.classList.add('danger');

        deleteBtn.addEventListener('click', async () => {
          if (confirm('Delete this job?')) {
            const res = await fetch(`/api/calendar/${job._id}`, {
              method: 'DELETE',
            });
            if (res.ok) {
              jobModal.style.display = 'none';
              window.location.reload();
            } else {
              alert('Failed to delete job.');
            }
          }
        });

        document.getElementById('cancelBtn').insertAdjacentElement('beforebegin', deleteBtn);
      }
    }
  });

  calendar.render();

  // Open modal from Add Job button
  addJobBtn.addEventListener('click', () => {
    jobForm.dataset.editing = '';
    jobForm.reset();
    jobModal.style.display = 'flex';
    document.getElementById('modalHeader').textContent = 'Add New Job';
  });

  // Close modal
  cancelBtn.addEventListener('click', () => {
    jobModal.style.display = 'none';
  });

  // Form submit logic (create or update)
  jobForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(jobForm);
    const jobData = Object.fromEntries(formData.entries());

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