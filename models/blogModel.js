const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  href: String,
  imgSrc: String,
  imgAlt: String,
  category: String,
  title: String,
  contentFilePath: String,
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
