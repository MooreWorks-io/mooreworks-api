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
  document.getElementById('detailsNotes').innerText = job.jobBrief || '';

  document.getElementById('editJobBtn').dataset.jobId = job._id;
  document.getElementById('jobDetailsPopup').style.display = 'block';
},
 }); 

calendar.render();

window.closeDetailsPopup = function () {
  document.getElementById('jobDetailsPopup').style.display = 'none';
};



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

// Edit button in read-only popup
document.getElementById('editJobBtn').addEventListener('click', () => {
  const jobId = document.getElementById('editJobBtn').dataset.jobId;
  const job = jobs.find(j => j._id === jobId);
  if (!job) return;

  closeDetailsPopup(); // hide read-only popup
  prefillJobForm(job); // prefill form
  jobForm.dataset.editing = job._id;
  jobModal.style.display = 'flex';
});

});