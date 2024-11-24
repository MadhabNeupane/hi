const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Book Schema
const BookSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true }, // Added price field
  quantity: { type: Number, required: true }, // Added quantity field
});

const Book = mongoose.model('Book', BookSchema);

// Routes
app.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/books', async (req, res) => {
  try {
    const { name, price, quantity } = req.body;

    // Validate inputs
    if (!name || price == null || quantity == null) {
      return res.status(400).json({ error: 'Name, price, and quantity are required.' });
    }

    const book = new Book({ name, price, quantity });
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/books/:id', async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
