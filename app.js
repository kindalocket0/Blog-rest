const express = require('express');
const methodOverride = require('method-override')
const mongoose = require('mongoose');
const nl2br = require('nl2br');
const bodyParser = require('body-parser');
const expSan = require('express-sanitizer')
const faker = require('faker');

const Blog = require("./models/blog")
const User = require('./models/user')
const Comment = require("./models/comment")

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


//EXPRESS SET UP

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(expSan());
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));


//ROUTES


//ROOT REDIRECTS TO INDEX
app.get('/', (req, res) => {
    res.redirect('/blogs');
});

//BLOGS INDEX
//SHOWS ALL BLOGS
app.get('/blogs', (req, res) => {
    Blog.find((err, blogs) => {
        (err) ? console.log(err): res.render('blogs/index', {
            blogs: blogs
        });
    })
});

//BLOGS NEW
//SHOWS FORM FOR NEW BLOG
app.get('/blogs/new', (req, res) => {
    res.render('blogs/newPost')
});

//BLOGS CREATE
//CREATES A NEW BLOG AND REDIRECTS TO INDEX
app.post('/blogs', (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, (err, newBlog) => {
        (err) ? console.log(err): res.redirect('/blogs');

    })
})

//BLOGS SHOW
//SHOWS ONE SPECIFIC BLOG
app.get('/blogs/:id', (req, res) => {
    Blog.findById(req.params.id).populate('comments').exec((err, blog) => {
        (err) ? res.redirect('/blogs'): res.render('blogs/show', {
            blog: blog,
            nl2br: nl2br,
            comments: blog.comments

        })
    })

});

//BLOGS EDIT
//SHOWS THE EDIT FORM FOR A SPECIFIC BLOG
app.get('/blogs/:id/edit', (req, res) => {
    Blog.findById(req.params.id, (err, blog) => {
        (err) ? res.redirect('/blogs'): res.render('blogs/edit', {
            blog: blog
        })

    })
});

//BLOGS UPDATE
//UPDATES ONE SPECIFIC BLOG AND REDIRECTS TO ITS SHOW PAGE
app.put('/blogs/:id', (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);

    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, blog) => {
        (err) ? res.redirect('/blogs'): res.redirect(`/blogs/${blog._id}`)

    })
});

//BLOGS DESTROY
//DELETES A SPECIFIC BLOG AND REDIRECTS TO INDEX
app.delete('/blogs/:id', (req, res) => {
    Blog.findByIdAndDelete(req.params.id, (err, blog) => {
        (err) ? res.redirect('blogs/:id'): res.redirect('/blogs');
    })
});

//////////////////////////
//COMMENT ROUTES
/////////////////////////

//NEW COMMENT

app.get('/blogs/:id/comments/new', (req, res) => {
    Blog.findById(req.params.id, (err, blog) => {
        if (err) {
            res.redirect('/blogs/:id'); 
        } else {
            res.render('comments/new', {blog: blog});
            
        }
    })
});

//CREATE COMMENT

app.post('/blogs/:id', (req, res) => {
    req.body.comment.text = req.sanitize(req.body.comment.text);
    Comment.create(req.body.comment, (err, comment) => {
        if (err) {
            console.log(err);
        } else {
            Blog.findById(req.params.id, (err, blog) => {
                blog.comments.push(comment)
                blog.save();
                res.redirect(`/blogs/${req.params.id}`);
            })
        }
    })
});

//EDIT COMMENT

app.get('/blogs/:blogid/comments/:commentid/edit', (req, res) => {
    Comment.findById(req.params.commentid, (err, comment) => {
        if (err) {
            console.log(err);
        } else {
            Blog.findById(req.params.blogid, (err, blog) => {
                res.render('comments/edit', {comment: comment, blog: blog});

            })
        }
    })
});

//UPDATE COMMENT
app.put('/blogs/:blogid/comments/:commentid', (req, res) => {
    req.body.comment.text = req.sanitize(req.body.comment.text);

    Comment.findByIdAndUpdate(req.params.commentid, req.body.comment, (err, comment) => {
        (err) ? console.log(err) : res.redirect(`/blogs/${req.params.blogid}`);

    })
});

//dESTROY COMMENT
app.delete('/blogs/:blogid/comments/:commentid', (req, res) => {
  Comment.findByIdAndDelete(req.params.commentid, (err, comment) => {
      (err) ? res.redirect('blogs/:id'): res.redirect(`/blogs/${req.params.blogid}`);
  })
});

app.listen(3000, () => {
    console.log('Server started on 3000');
});