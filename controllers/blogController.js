const fs = require('fs').promises;
const path = require('path');
const sanitizeHtml = require('sanitize-html');
const Blog = require('../models/blogModel');

// Create a new blog
async function createBlog(req, res) {
  try {
    const { imgSrc, imgAlt, category, title, content } = req.body;

    // Sanitize the HTML content before saving
    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'li']),
      allowedAttributes: {
        '*': ['style']
      }
    });

    // Save the sanitized content to an HTML file
    const contentFileName = `${Date.now()}.html`;
    const contentFilePath = path.join(__dirname, '..', 'blog_content', contentFileName);
    await fs.writeFile(contentFilePath, sanitizedContent, 'utf8');

    // Create a new blog document
    const newBlog = new Blog({
      imgSrc,
      imgAlt,
      category,
      title,
      contentFilePath: contentFileName, // Store only the filename, not the full path
    });

    // Save the blog document to the database
    await newBlog.save();

    res.status(201).json({ message: 'Blog created successfully' });
  } catch (err) {
    console.error('Error creating blog:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
}

// Get all blogs
async function getAllBlogs(req, res) {
  try {
    const itemsPerPage = 6;
    const currentPage = parseInt(req.query.page) || 1;

    const totalBlogs = await Blog.countDocuments();
    const totalPages = Math.ceil(totalBlogs / itemsPerPage);

    const blogs = await Blog.find()
      .skip((currentPage - 1) * itemsPerPage)
      .limit(itemsPerPage);

    const blogsWithContent = await Promise.all(
      blogs.map(async (blog) => {
        const { contentFilePath, ...rest } = blog.toObject();
        if (contentFilePath) {
          try {
            const filePath = path.join(__dirname, '..', 'blog_content', contentFilePath);
            const content = await fs.readFile(filePath, 'utf8');
            return { ...rest, content };
          } catch (error) {
            console.error('Error reading blog content:', error);
            return { ...rest }; // Return the blog data without content
          }
        }
        return { ...rest };
      })
    );

    res.json({
      blogs: blogsWithContent,
      totalPages,
      currentPage,
    });
  } catch (err) {
    console.error('Error retrieving blogs:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
}


// Get a single blog by ID
async function getBlogById(req, res) {
  try {
    const blogId = req.params.id; // Extract blog ID from the request params
    const blog = await Blog.findById(blogId);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const { contentFilePath, ...rest } = blog.toObject(); // Extract fields from the document

    if (contentFilePath) {
      try {
        const filePath = path.join(__dirname, '..', 'blog_content', contentFilePath);
        const content = await fs.readFile(filePath, 'utf8');
        return res.json({ ...rest, content });
      } catch (error) {
        console.error('Error reading blog content:', error);
      }
    }

    res.json({ ...rest });
  } catch (err) {
    console.error('Error retrieving blog:', err);
    res.status(500).json({ error: 'An error occurred' });
  }
}

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
};
