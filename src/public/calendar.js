document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,listWeek'
    },
    events: async function (info, successCallback, failureCallback) {
      try {
        const res = await fetch('/api/calendar');
        const jobs = await res.json();

        const events = jobs.map(job => ({
          title: job.jobTitle || 'Scheduled Job',
          start: job.scheduledDate,
          extendedProps: {
            clientName: job.clientName,
            projectAddress: job.projectAddress,
            jobType: job.jobType,
            fieldCrewHours: job.fieldCrewHours,
            officeHours: job.officeHours,
            assignedCrew: job.assignedCrew,
            jobBrief: job.jobBrief
          }
        }));

        successCallback(events);
      } catch (error) {
        console.error('Failed to load events:', error);
        failureCallback(error);
      }
    },
    eventClick: function (info) {
      const job = info.event.extendedProps;

      alert(
        `📍 ${info.event.title}\n` +
        `Client: ${job.clientName}\n` +
        `Address: ${job.projectAddress}\n` +
        `Type: ${job.jobType}\n` +
        `Crew: ${job.assignedCrew.join(', ')}\n` +
        `Field Hours: ${job.fieldCrewHours}\n` +
        `Office Hours: ${job.officeHours}\n\n` +
        `📝 Brief:\n${job.jobBrief}`
      );
    }
  });

  calendar.render();
});