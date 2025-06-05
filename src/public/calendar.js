document.addEventListener('DOMContentLoaded', async () => {
  const calendarEl = document.getElementById('calendar');

  // Fetch calendar jobs from backend
  const res = await fetch('/api/calendar');
  const jobs = await res.json();

  // Convert jobs to FullCalendar event format
  const events = jobs.map(job => ({
    title: job.title || job.address || 'Scheduled Job',
    start: job.date,
    extendedProps: {
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
      const props = info.event.extendedProps;
      alert(`📍 ${props.address}\n👷 Crew: ${props.crew}\n🕒 Field: ${props.fieldHours}h, Office: ${props.officeHours}h\n📝 ${props.jobBrief}`);
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
jobForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(jobForm);
  const jobData = Object.fromEntries(formData.entries());

  // Convert numeric fields properly
  jobData.fieldHours = parseFloat(jobData.fieldHours) || 0;
  jobData.officeHours = parseFloat(jobData.officeHours) || 0;

  const res = await fetch('/api/calendar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(jobData)
  });

  if (res.ok) {
    alert('✅ Job added!');
    window.location.reload();
  } else {
    const error = await res.json();
    alert(`❌ Failed to add job: ${error.message}`);
  }
});
