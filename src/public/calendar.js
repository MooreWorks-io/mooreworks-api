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

  document.getElementById('detailsTitle').innerText = job.jobType || job.address || 'Job';
  document.getElementById('detailsAddress').innerText = job.address || 'N/A';
  document.getElementById('detailsType').innerText = job.jobType || 'N/A';
  document.getElementById('detailsDate').innerText = job.date || 'N/A';
  document.getElementById('detailsCrew').innerText = job.crew || 'N/A';
  document.getElementById('detailsAccess').innerText = job.access || 'N/A';
  document.getElementById('detailsClientPresent').innerText = job.clientPresent || 'N/A';
  document.getElementById('detailsNotes').innerText = job.jobBrief || 'N/A';

  document.getElementById('editJobBtn').dataset.jobId = job._id;

  // Show the new modal
  document.getElementById('jobDetailsPopup').style.display = 'flex';
}
 }); 

calendar.render();

window.closeDetailsPopup = function () {
  document.getElementById('jobDetailsPopup').style.display = 'none';
};

document.getElementById('editJobBtn').addEventListener('click', () => {
  const jobId = document.getElementById('editJobBtn').dataset.jobId;
  const job = jobs.find(j => j._id === jobId);
  if (!job) return;

  // Close the read-only modal
  closeDetailsPopup();

  // Prefill form fields
  document.getElementById('modalHeader').textContent = 'Edit Job';
  document.getElementById('jobType').value = job.jobType || '';
  document.getElementById('date').value = job.date || '';
  document.getElementById('crew').value = job.crew || '';
  document.getElementById('address').value = job.address || '';
  document.getElementById('fieldHours').value = job.fieldHours || 0;
  document.getElementById('officeHours').value = job.officeHours || 0;
  document.getElementById('jobBrief').value = job.jobBrief || '';

  // Set form in editing mode
  jobForm.dataset.editing = job._id;

  // Show the edit modal
  jobModal.style.display = 'flex';
});

  // Open modal from Add Job button
  addJobBtn.addEventListener('click', () => {
    jobForm.dataset.editing = '';
    jobModal.style.display = 'flex';
    jobForm.reset();
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

});