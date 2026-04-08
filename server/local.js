import app from './api.js';

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`🚀 Local server running at http://localhost:${PORT}/`);
});
