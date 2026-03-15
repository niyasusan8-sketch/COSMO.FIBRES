import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

const app = express();
const PORT = 3000;

// Increase payload limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// In-memory store for prototyping
let products: any[] = [];

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const product = { ...req.body, id: Date.now().toString() };
  products.unshift(product);
  res.json(product);
});

app.put('/api/products/:id', (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    products[index] = { ...products[index], ...req.body };
    res.json(products[index]);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.delete('/api/products/:id', (req, res) => {
  products = products.filter(p => p.id !== req.params.id);
  res.json({ success: true });
});

app.post('/api/auth', (req, res) => {
  const { passcode } = req.body;
  // The requested passcode protection
  if (passcode === 'admin123' || passcode === '1234') {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
