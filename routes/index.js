const express = require('express');
const router = express.Router();
const passport = require('passport');
const localStrategy = require('passport-local');
const userModel = require('./users');
const postModel = require('./postModel');
const nm = require('nodemailer');
var multer = require("multer");
var fs = require("fs");

const names = require('./randomNames');
const crypto = require("crypto");

passport.use(new localStrategy(userModel.authenticate()));


var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/images/uploads')
    },
    filename: function(req, file, cb) {

        var date = new Date();
        var newdate = date.getTime();


        var totalname = newdate + file.originalname;
        cb(null, totalname)
    }
})

var upload = multer({ storage: storage })


// || get routes ||
// ||            ||


router.get('/', sendToProfile, function(req, res) {
    res.render('index', { loggedin: false });
});

router.post("/getname", function(req, res) {
    userModel.findOne({ email: req.body.email }).then(function(e) {
        res.json(e)
    })
})

router.get('/timeline', isLoggedIn, function(req, res) {
    res.render('timeline', { loggedin: true });
});

router.get('/update', function(req, res) {
    res.render('update', { loggedin: true });
});

router.get('/profile', isLoggedIn, function(req, res) {
    postModel.find({ username: req.session.passport.user })
        .then(function(allHisPosts) {
            userModel.findOne({ username: req.session.passport.user })
                .then(function(userDets) {
                    // res.send(allHisPosts);
                    res.render('profile', { loggedin: true, userDets, allHisPosts });
                })
        })
});

router.get("/forget", function(req, res) {
    res.render("forget", { loggedin: false });
})

router.post("/forget", function(req, res) {
    crypto.randomBytes(30, function(err, data) {
        var token = data.toString('hex')

        userModel.findOne({ email: req.body.email }).then(function(userFound) {

            var time = Date.now() + 8640000;
            userFound.resetTime = time;
            userFound.resetToken = token;
            userFound.save().then(function(ee) {

                const tp = nm.createTransport({
                    service: "gmail",
                    auth: {
                        user: "mishramanisha925@gmail.com",
                        pass: "1472580369"
                    }
                })

                const mailOptions = {
                    from: "pksumitkumar0980@gmail.com",
                    to: req.body.email,
                    subject: "Testing the nodemailer",
                    text: " Reset yout password here by clicking on the like below " + '\n\n' + 'http://' + req.headers.host + "/reset/" + token
                }

                tp.sendMail(mailOptions, function(err) {
                    if (err) throw err;
                    else {
                        console.log('mail sent !')
                    }
                })





            })

        })



    })
    res.redirect("/forget")
})

router.get("/reset/:token", function(req, res) {
    res.render('resetpassword', { loggedin: false, token: req.params.token, j: " " });
})

router.post("/reset/:token", function(req, res) {

    userModel.findOne({ resetToken: req.params.token }).then(function(userFound) {

        var date = Date.now()

        if (userFound.resetTime > date) {

            if (req.params.token === userFound.resetToken) {
                var pass2 = req.body.password2;
                var pass1 = req.body.password;

                if (pass1 === pass2) {
                    userFound.setPassword(pass2, function() {
                        userFound.save().then(function(e) {
                            e.resetTime = undefined;
                            e.resetToken = undefined;
                            e.save().then(function(ee) {
                                req.logIn(ee, function() {
                                    res.redirect("/profile")

                                })
                            })


                        }).catch(function(err) {
                            res.send(err)
                        })



                    }).catch(function(err) {
                        res.send(err)
                    })
                } else {
                    res.render('resetpassword', { loggedin: false, token: req.params.token, j: "Password not matched" });

                }



            } else if (req.params.token === undefined) {
                res.send("kk")
            }

        } else {
            res.send("link expired")
        }


    })



})




router.get('/love/:id', function(req, res) {
    postModel.findOne({ _id: req.params.id })
        .then(function(post) {
            if (post.loves.indexOf(req.session.passport.user) === -1) {
                post.loves.push(req.session.passport.user);
                post.save().then(function(postSaved) {
                    res.redirect('/profile');
                });
            } else {
                var newUsers = post.loves.filter(function(user) {
                    return user !== req.session.passport.user
                })
                post.loves = newUsers;
                post.save().then(function(postSaved) {
                    res.redirect('/profile');
                });
            }
        })
})

router.get('/likes/:id', function(req, res) {
    postModel.findOne({ _id: req.params.id })
        .then(function(post) {
            if (post.likes.indexOf(req.session.passport.user) === -1) {
                post.likes.push(req.session.passport.user);
                post.save().then(function(postSaved) {
                    res.redirect('/profile');
                });
            } else {
                var newUsers = post.likes.filter(function(user) {
                    return user !== req.session.passport.user;
                });
                post.likes = newUsers;
                post.save().then(function(postSaved) {
                    res.redirect('/profile');
                })
            }
        })
})

router.get('/dislikes/:id', function(req, res) {
    postModel.findOne({ _id: req.params.id })
        .then(function(post) {
            if (post.dislikes.indexOf(req.session.passport.user) === -1) {
                post.dislikes.push(req.session.passport.user);
                post.save().then(function(postSaved) {
                    res.redirect('/profile');
                });
            } else {
                var newUsers = post.dislikes.filter(function(user) {
                    return user !== req.session.passport.user
                })
                post.dislikes = newUsers;
                post.save().then(function(postSaved) {
                    res.redirect('/profile');
                });
            }
        })
})

router.get('/register', sendToProfile, function(req, res) {
    res.render('register', { loggedin: false });
});

router.get('/logout', function(req, res) {
    req.logOut();
    res.redirect('/');
});

router.get('/login', sendToProfile, function(req, res) {
    res.render('login', { loggedin: false });
});

router.get('/search/:searcheduser', function(req, res) {

    postModel.find({ username: req.params.searcheduser })
        .then(function(allHisPosts) {
            userModel.findOne({ username: req.params.searcheduser })
                .then(function(userDets) {
                    // res.send(allHisPosts);
                    res.render('profile', { loggedin: false, userDets, allHisPosts });
                })
        })


})

// =====================
// post routes
// =====================

router.post("/profilepic", isLoggedIn, upload.single('file'), function(req, res) {

    postModel.find({ username: req.session.passport.user })
        .then(function(allHisPosts) {
            userModel.findOne({ username: req.session.passport.user })
                .then(function(userDets) {


                    if (userDets.profilepic === 'https://images.unsplash.com/photo-1525389999255-82bad487f23c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1868&q=80') {
                        userDets.profilepic = './images/uploads/' + req.file.filename;

                        console.log('if chala')
                    } else {

                        var currentprofilepic = userDets.profilepic;
                        var newcurrentprofilepic = currentprofilepic.slice(2, currentprofilepic.length);
                        newcurrentprofilepic = "./public/" + newcurrentprofilepic;

                        fs.unlinkSync(newcurrentprofilepic);

                        userDets.profilepic = "./images/uploads/" + req.file.filename;

                    }
                    userDets.save().then(function() {

                        res.render('profile', { loggedin: true, userDets, allHisPosts });
                    })

                })
        })




})



router.post('/search', function(req, res) {
    userModel.find({ username: new RegExp(req.body.username, 'i') })
        .then(function(users) {

            res.render('search', { loggedin: false, users })
        })
});

router.post('/post', isLoggedIn, function(req, res) {
    postModel.create({
        username: req.session.passport.user,
        postText: req.body.post
    }).then(function(newlyCreatedPost) {
        res.redirect("/profile")
    })
});


router.post('/register', function(req, res) {
    var rnum = Math.floor(Math.random() * 9)
    const luckyName = names[rnum];

    var detailsWithoutPassword = new userModel({
        email: req.body.email,
        username: req.body.username,
        name: luckyName
    });
    userModel.register(detailsWithoutPassword, req.body.password)
        .then(function() {
            passport.authenticate('local')(req, res, function() {
                res.redirect('/profile');
            });
        })
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/profile',
    failureRedirect: '/login'
}), function(req, res) {});


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    else res.redirect('/login');
}

function sendToProfile(req, res, next) {
    if (req.isAuthenticated()) {
        res.redirect('/profile');
    } else {
        return next();
    };
}

module.exports = router;