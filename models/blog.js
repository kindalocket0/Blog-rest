const mongoose = require("mongoose");



const blogSchema = new mongoose.Schema({
  title: String,
  user: String,
  image: String,
  body: String,
  created: {
    type: Date,
    default: Date.now
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }] 
})

module.exports = mongoose.model('blog', blogSchema);

