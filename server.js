const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/User'); 
const OpenAI = require('openai');

dotenv.config();

const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch(err => console.error("❌ MongoDB connection error:", err));

console.log("API Key Loaded:", process.env.OPENAI_API_KEY);
const app = express();
app.use(cors({
  origin: '*',
  methods: ['POST']
}));

app.use(express.json());
const session = require('express-session');

app.use(session({
  secret: process.env.SESSION_SECRET || 'mooreworks_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // set to true if using HTTPS
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));
app.use(express.static(path.join(__dirname, 'public')));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/generate', async (req, res) => {
 let subject = '';
  const { type, tone } = req.body;

  let messages = [
    {
      role: 'system',
      content: 'You are a professional assistant that writes client emails for land surveyors.'
    }
  ];

  if (type === 'estimate') {
    const { clientName, address, price, timeline, discussed, surveyType, details } = req.body;

subject = `Estimate for Survey at ${address}`;

    const phoneMention = discussed === 'yes'
      ? "This follows our recent phone call."
      : "We haven't yet spoken directly.";

    const justification = details?.trim()
      ? `Additional details: ${details}`
      : "";

     const toneInstruction = tone && tone !== 'default'
    ? `Write in a ${tone} tone.`
    : "";

    messages.push({
      role: 'user',
      content: `
      ${toneInstruction}
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

subject = `Scheduling Your ${jobType} Survey at ${address}`;

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

  const toneInstruction = tone && tone !== 'default'
    ? `Write in a ${tone} tone.`
    : "";

  messages.push({
    role: 'user',
    content: `
    ${toneInstruction}
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

subject = `Final ${reportType} Delivered for ${address}`;

  const followUpLine = moreDocs === 'yes'
    ? "Please note that additional documents are still pending and will be provided as soon as they are available."
    : "No further documents are expected at this time.";

  const notesLine = notes?.trim()
    ? `Additional information: ${notes}`
    : "";

  const toneInstruction = tone && tone !== 'default'
    ? `Write in a ${tone} tone.`
    : "";

  messages.push({
    role: 'user',
    content: `
    ${toneInstruction}
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

subject = `Request for Missing Info – ${address}`;

  const checklistLine = checklist.length
    ? `We are missing the following documents:\n- ${checklist.join('\n- ')}`
    : "We are missing some required documentation.";

  const notesLine = notes?.trim()
    ? `Additional message: ${notes}`
    : "";

  const feeNote = `
If you are unable to retrieve these documents, we can pull them for you at the rate described in the work order.
  `;

const toneInstruction = tone && tone !== 'default'
    ? `Write in a ${tone} tone.`
    : "";

  messages.push({
    role: 'user',
    content: `
    ${toneInstruction}
      Write a professional email requesting missing information for a survey project at ${address}, for client ${clientName}.
      ${checklistLine}
      ${notesLine}
      ${feeNote}
      End the email by asking the client to send the items or reach out with questions.
    `
  });


} else if (type === 'delay') {
  const {
    clientName,
    address,
    reason,
    timeline,
    apology,
    notes
  } = req.body;

subject = `Update on Your Survey – Delay at ${address}`;

  console.log("🎯 DELAY TYPE HIT");
  console.log("🧾 Payload:", req.body);

  try {
    const apologyLine = apology === 'yes'
      ? "Thank you for your patience -- we truly appreciate your flexibility."
      : "";

    const notesLine = notes?.trim()
      ? `Additional context: ${notes}`
      : "";

    const toneInstruction = tone && tone !== 'default'
    ? `Write in a ${tone} tone.`
    : "";

    messages.push({
      role: 'user',
      content: `
      ${toneInstruction}
        Write a professional job delay notification email for client ${clientName} regarding a project at ${address}.
        Reason for delay: ${reason}.
        New estimated timeline: ${timeline}.
        ${apologyLine}
        ${notesLine}
        End the email by offering to answer any questions or reschedule if needed.
      `
    });
  } catch (error) {
    console.error("❌ Error inside DELAY block:", error);
    return res.status(500).json({ error: 'Failed inside delay logic' });
  }

} else if (type === 'thankYou') {
  try {
    const {
      clientName,
      address,
      completedWork,
      review,
      referral,
      finalNote
    } = req.body;

subject = `Thank You – Project at ${address} Complete`;

    console.log("🎉 THANK YOU email triggered:", req.body);

    const reviewLine = review === 'yes'
      ? "If you were happy with our service, we’d love for you to leave us a quick review or share your feedback."
      : "";

    const referralLine = referral === 'yes'
      ? "We’re a small local team, and referrals go a long way — if you know anyone in need of surveying services, we’d be honored if you passed our name along."
      : "";

    const noteLine = finalNote?.trim()
      ? `Personal note: ${finalNote}`
      : "";

const toneInstruction = tone && tone !== 'default'
    ? `Write in a ${tone} tone.`
    : "";


    messages.push({
      role: 'user',
      content: `
      ${toneInstruction}
        Write a thank you and job completion email for ${clientName} regarding the project at ${address}.
        Work completed: ${completedWork}.
        ${reviewLine}
        ${referralLine}
        ${noteLine}
        End with a sincere thanks and let the client know you're available for future needs.
      `
    });
  } catch (err) {
    console.error("❌ Error in thankYou block:", err);
    return res.status(500).json({ error: "Failed in thankYou logic" });
  }


} else {
    return res.status(400).json({ error: 'Unsupported email type' });
  }

 try {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages
  });

  const raw = response.choices[0].message.content;

  const [maybeSubjectLine, ...rest] = raw.split('\n');
  let cleanEmail = raw;
  if (maybeSubjectLine.toLowerCase().startsWith('subject:')) {
    cleanEmail = rest.join('\n').trim(); // remove subject from body
  }

  res.json({ email: cleanEmail, subject });
} catch (err) {
  console.error(err);
  res.status(500).json({ error: 'Failed to generate email' });
}
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'email-generator.html'));});

app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });

    const result = await newUser.save();
    console.log("✅ MongoDB save result:", result);
    res.status(201).json({ message: 'Signup successful' });

  } catch (err) {
    console.error("❌ MongoDB save error:", err);
    res.status(500).json({ message: 'Mongo save failed' });
  }
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // Save user info to session
    req.session.userId = user._id;
    req.session.userEmail = user.email;

    console.log("✅ Session created for:", user.email);
    res.json({ message: 'Login successful' });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.get('/check-auth', (req, res) => {
  if (req.session.userId) {
    res.json({ message: `Authenticated as ${req.session.userEmail}` });
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("❌ Logout error:", err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
