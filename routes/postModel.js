const mongoose = require('mongoose');

var postSchema = mongoose.Schema({
    username: String,
    postText: String,
    date: {
        type: Date,
        default: new Date()
    },
    likes: [],
    dislikes: [],
    loves: []
})

module.exports = mongoose.model('posts', postSchema);