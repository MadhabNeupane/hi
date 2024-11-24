const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

const bookSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
});

const Book = mongoose.model('Book', bookSchema);

// API Routes
// Get all available books
app.get('/books', async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

// Add or update a book (Increase quantity if book exists)
app.post('/books', async (req, res) => {
  const { name, price, quantity } = req.body;

  let book = await Book.findOne({ name });
  if (book) {
    book.quantity += quantity; // Increase quantity if the book exists
    await book.save();
  } else {
    book = new Book({ name, price, quantity });
    await book.save();
  }
  res.json(book);
});

// Sell a book (Decrease quantity if enough stock is available)
app.post('/books/sell', async (req, res) => {
  const { name, quantity } = req.body;

  const book = await Book.findOne({ name });
  if (!book || book.quantity < quantity) {
    return res.status(400).json({ error: 'Not enough stock or book unavailable' });
  }

  book.quantity -= quantity; // Decrease quantity when a book is sold
  await book.save();
  res.json(book);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
