const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4200;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint to save items
app.post('/api/items', (req, res) => {
  try {
    const items = req.body;
    fs.writeFileSync('items.json', JSON.stringify(items, null, 2));
    res.json({ success: true, message: 'Items saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API endpoint to load items
app.get('/api/items', (req, res) => {
  try {
    if (fs.existsSync('items.json')) {
      const items = JSON.parse(fs.readFileSync('items.json', 'utf8'));
      res.json(items);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API endpoint to save map
app.post('/api/map', (req, res) => {
  try {
    const map = req.body;
    fs.writeFileSync('map.json', JSON.stringify(map, null, 2));
    res.json({ success: true, message: 'Map saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// API endpoint to load map
app.get('/api/map', (req, res) => {
  try {
    if (fs.existsSync('map.json')) {
      const map = JSON.parse(fs.readFileSync('map.json', 'utf8'));
      res.json(map);
    } else {
      res.json({ width: 20, height: 20, layers: [] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 