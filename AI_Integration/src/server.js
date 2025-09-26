import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import summarizeRoutes from './routes/summarizeRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3100;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'AI_Integration' });
});

app.use('/ai', summarizeRoutes);

app.listen(port, () => {
  console.log(`AI_Integration service running at http://localhost:${port}`);
});


