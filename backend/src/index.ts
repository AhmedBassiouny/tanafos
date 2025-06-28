import express from 'express';

const app = express();
const PORT = 3001;

app.use(express.json());

// Add CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Tanafos backend!' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});