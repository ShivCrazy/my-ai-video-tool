import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// 🚨 This line serves your frontend (public/index.html)
app.use(express.static('public'));

// --- TEST ROUTE ---
app.get('/api/test', (req, res) => {
  res.json({ message: "Backend is working!" });
});

// --- AI GENERATE ROUTE (DUMMY FOR NOW) ---
app.post('/api/generate', (req, res) => {
  res.json({ status: "success", msg: "AI generation coming soon!" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
