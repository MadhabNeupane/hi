require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const Joi = require('joi');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const uri = process.env.MONGO_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Define the book schema
const bookSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  description: { type: String },
  image: { type: String }, // URL for book image
});

const Book = mongoose.model('Book', bookSchema);

// Validation schema for adding or updating books
const bookValidationSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().min(0).required(),
  quantity: Joi.number().integer().min(0).required(),
  description: Joi.string().optional(),
  image: Joi.string().uri().optional(),
});

// API Routes

// Get all available books
app.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Add or update a book
app.post('/books', async (req, res) => {
  const { error } = bookValidationSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { name, price, quantity, description, image } = req.body;

  try {
    let book = await Book.findOne({ name });
    if (book) {
      book.quantity += quantity;
      await book.save();
    } else {
      book = new Book({ name, price, quantity, description, image });
      await book.save();
    }
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add or update book' });
  }
});

// Sell a book
app.post('/books/sell', async (req, res) => {
  const { name, quantity } = req.body;

  try {
    const book = await Book.findOne({ name });
    if (!book || book.quantity < quantity) {
      return res.status(400).json({ error: 'Not enough stock or book unavailable' });
    }

    book.quantity -= quantity;
    await book.save();
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: 'Failed to sell book' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
