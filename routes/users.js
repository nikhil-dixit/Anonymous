const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost/gfaadbook');

var userSchema = mongoose.Schema({
    username: String,
    password: String,
    name: String,
    email: String,
    resetTime: String,
    resetToken: String,
    profilepic: {
        type: String,
        default: 'https://images.unsplash.com/photo-1525389999255-82bad487f23c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80'
    }
})

userSchema.plugin(plm);

module.exports = mongoose.model('user', userSchema);