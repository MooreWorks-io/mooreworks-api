const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();
console.log("API Key Loaded:", process.env.OPENAI_API_KEY);
const app = express();
app.use(cors({
 origin: '*', // For now, allows all — or replace with your Squarespace domain
  methods: ['POST']
}));
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/generate', async (req, res) => {
  const { type } = req.body;

  let messages = [
    {
      role: 'system',
      content: 'You are a professional assistant that writes client emails for land surveyors.'
    }
  ];

  if (type === 'estimate') {
    const { clientName, address, price, timeline, discussed, surveyType, details } = req.body;

    const phoneMention = discussed === 'yes'
      ? "This follows our recent phone call."
      : "We haven't yet spoken directly.";

    const justification = details?.trim()
      ? `Additional details: ${details}`
      : "";

    messages.push({
      role: 'user',
      content: `
        Write a clear and professional follow-up estimate email for a land surveying client named ${clientName}
        regarding their project at ${address}. The type of survey is: ${surveyType}.
        Estimated price is $${price}. Estimated timeline is: ${timeline}.
        ${phoneMention}
        ${justification}
        End the email with a line asking the client to reply if they would like to proceed.
      `
    });
    
} else if (type === 'schedule') {
  const {
    clientName,
    address,
    jobType,
    access,
    presence,
    dates,
    contact,
    notes
  } = req.body;

  const accessLine = access === 'yes'
    ? "The property is accessible."
    : "Please confirm that we will have access to the property.";

  const presenceLine = presence === 'yes'
    ? "The client would like to be present for the survey."
    : presence === 'no'
    ? "The client does not need to be present."
    : "The client is welcome to be present, but it's optional.";

  const notesLine = notes?.trim()
    ? `Additional notes: ${notes}`
    : "";

  messages.push({
    role: 'user',
    content: `
      Write a professional email to schedule a land surveying job for a client named ${clientName}
      at the address ${address}. The type of job is: ${jobType}.
      ${accessLine}
      ${presenceLine}
      Preferred timeframe: ${dates}.
      Preferred contact method: ${contact}.
      ${notesLine}
      Keep the tone professional and prompt the client to confirm availability or request a different time.
    `
  });

} else if (type === 'finalReport') {
  const {
    clientName,
    address,
    reportType,
    deliveryMethod,
    moreDocs,
    notes
  } = req.body;

  const followUpLine = moreDocs === 'yes'
    ? "Please note that additional documents are still pending and will be provided as soon as they are available."
    : "No further documents are expected at this time.";

  const notesLine = notes?.trim()
    ? `Additional information: ${notes}`
    : "";

  messages.push({
    role: 'user',
    content: `
      Write a professional delivery email for a completed land survey.
      Client: ${clientName}
      Project Address: ${address}
      Report Type: ${reportType}
      Delivery Method: ${deliveryMethod}
      ${followUpLine}
      ${notesLine}
      End the email by thanking the client and offering to answer any questions.
    `
  });

} else if (type === 'infoRequest') {
  const { clientName, address, checklist, notes } = req.body;

  const checklistLine = checklist.length
    ? `We are missing the following documents:\n- ${checklist.join('\n- ')}`
    : "We are missing some required documentation.";

  const notesLine = notes?.trim()
    ? `Additional message: ${notes}`
    : "";

  const feeNote = `
If you are unable to retrieve these documents, we can pull them for you at a rate of $65/hour for courthouse time, once the job is secured.
  `;

  messages.push({
    role: 'user',
    content: `
      Write a professional email requesting missing information for a survey project at ${address}, for client ${clientName}.
      ${checklistLine}
      ${notesLine}
      ${feeNote}
      End the email by asking the client to send the items or reach out with questions.
    `
  });

} else {
    return res.status(400).json({ error: 'Unsupported email type' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages
    });

    const message = response.choices[0].message.content;
    res.json({ email: message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate email' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
const path = require('path');

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'email-generator.html'));});
  