const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors')
const blogRoutes = require('./routes/blogRoute');

const app = express();
app.use(cors())
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect("mongodb+srv://yogendra:yogendra@cluster0.r2gbftx.mongodb.net/jalsanews", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });

// Routes
app.use('/blogs', blogRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
