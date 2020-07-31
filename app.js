const express = require('express');
const methodOverride = require('method-override')
const mongoose = require('mongoose');
const nl2br = require('nl2br');
const bodyParser = require('body-parser');
const expSan = require('express-sanitizer')
const app = express();


// MONGODB CONNECTION
const connectionString = "mongodb+srv://admin:sc144229@learning-db-peb24.mongodb.net/blogDB?retryWrites=true&w=majority"

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("connected to db");

});


//SCHEMA SET UPS

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  posts: []
})

User = mongoose.model('user', userSchema);

const blogSchema = new mongoose.Schema({
  title: String,
  user: userSchema,
  image: String,
  body: String,
  created: {
    type: Date,
    default: Date.now
  }
})

const Blog = mongoose.model('blog', blogSchema);

//EXPRESS SET UP

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(expSan());
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));


//ROUTES

app.get('/', (req, res) => {
  res.redirect('/blogs');
});

app.get('/blogs', (req, res) => {
  Blog.find((err, blogs) => {
    (err) ? console.log(err): res.render('index', {
      blogs: blogs
    });
  })
});

app.get('/blogs/new', (req, res) => {
  res.render('newPost')
});

app.post('/blogs', (req, res) => {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.create(req.body.blog, (err, newBlog) => {
    (err) ? console.log(err): res.redirect('/blogs');

  })
})

app.get('/blogs/:id', (req, res) => {
  Blog.findById(req.params.id, (err, blog) => {
    (err) ? res.redirect('/blogs'): res.render('show', {
      blog: blog,
      nl2br: nl2br
    })
  })

});

app.get('/blogs/:id/edit', (req, res) => {
  Blog.findById(req.params.id, (err, blog) => {
    (err) ? res.redirect('/blogs'): res.render('edit', {
      blog: blog
    })

  })
});

app.put('/blogs/:id', (req, res) => {
  req.body.blog.body = req.sanitize(req.body.blog.body);

  Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, x) => {
    (err) ? res.redirect('/blogs'): res.redirect('/blogs/:id')

  })
});

app.delete('/blogs/:id', (req, res) => {
  Blog.findByIdAndDelete(req.params.id, (err, blog) => {
    (err) ? res.redirect('blogs/:id'): res.redirect('/blogs');
  })
});

app.listen(3000, () => {
  console.log('Server started on 3000');
});