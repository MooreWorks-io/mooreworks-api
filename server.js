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
  const { clientName, address, price, timeline } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional assistant that writes client follow-up emails for land surveyors.',
        },
        {
          role: 'user',
          content: `Write a follow-up estimate email for a client named ${clientName} about a project at ${address}. The estimated price is $${price} and the expected timeline is ${timeline}.`,
        },
      ],
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
  