document.addEventListener('DOMContentLoaded', async () => {
  const calendarEl = document.getElementById('calendar');

  // Fetch calendar jobs from backend
  const res = await fetch('/api/calendar');
  const jobs = await res.json();

  // Convert jobs to FullCalendar event format
  const events = jobs.map(job => ({
    title: job.jobType || job.address || 'Scheduled Job',
    start: job.date,
    extendedProps: {
       _id: job._id,
      crew: job.crew,
      address: job.address,
      fieldHours: job.fieldHours,
      officeHours: job.officeHours,
      jobBrief: job.jobBrief
    }
  }));

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 'auto',
    events: events,
   eventClick: function(info) {
  const job = info.event.extendedProps;
  const jobId = info.event._def.extendedProps._id;

  const popup = document.createElement('div');
  popup.classList.add('calendar-popup');

  popup.innerHTML = `
    <div class="popup-content">
      <h3>${info.event.title}</h3>
      <p><strong>Address:</strong> ${job.address}</p>
      <p><strong>Crew:</strong> ${job.crew}</p>
      <p><strong>Field Hours:</strong> ${job.fieldHours}</p>
      <p><strong>Office Hours:</strong> ${job.officeHours}</p>
      <p><strong>Notes:</strong> ${job.jobBrief}</p>
      <button id="editJobBtn">✏️ Edit</button>
      <button id="deleteJobBtn">🗑️ Delete</button>
      <button id="closePopupBtn">Close</button>
    </div>
  `;

  document.body.appendChild(popup);

  document.getElementById('closePopupBtn').addEventListener('click', () => popup.remove());

  document.getElementById('deleteJobBtn').addEventListener('click', async () => {
  if (confirm("Delete this job?")) {
    const res = await fetch(`/api/calendar/${job._id}`, { method: 'DELETE' });
    if (res.ok) {
      alert('Deleted!');
      popup.remove();
      window.location.reload();
    } else {
      alert('Failed to delete job.');
    }
  }
});

  document.getElementById('editJobBtn').addEventListener('click', () => {
    popup.remove();
    prefillJobForm(job); // Define this function next
    jobModal.style.display = 'flex';
    jobForm.dataset.editing = job._id;
  });
} 
  });

  calendar.render();
});

// === Modal Popup Logic ===
const addJobBtn = document.getElementById('addJobBtn');
const jobModal = document.getElementById('jobModal');
const cancelBtn = document.getElementById('cancelBtn');
const jobForm = document.getElementById('jobForm');

// Open modal
addJobBtn.addEventListener('click', () => {
  jobModal.style.display = 'flex';
});

// Close modal
cancelBtn.addEventListener('click', () => {
  jobModal.style.display = 'none';
});

// Submit form
function prefillJobForm(job) {
  document.getElementById('jobType').value = job.jobType || '';
  document.getElementById('date').value = job.date || '';
  document.getElementById('crew').value = job.crew || '';
  document.getElementById('address').value = job.address || '';
  document.getElementById('fieldHours').value = job.fieldHours || 0;
  document.getElementById('officeHours').value = job.officeHours || 0;
  document.getElementById('jobBrief').value = job.jobBrief || '';
}

jobForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(jobForm);
  const jobData = Object.fromEntries(formData.entries());

  // Convert numeric fields properly
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
 