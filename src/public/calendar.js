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