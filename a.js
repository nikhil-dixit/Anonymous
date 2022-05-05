const nm = require('nodemailer');

const tp = nm.createTransport({
    service: "gmail",
    auth: {
        user: "mishramanisha925@gmail.com",
        pass: "1472580369"
    }
});

const mailOptions = {
    from: "mishramanisha925@gmail.com",
    to: "siddhartharawat0901@gmail.com",
    subject: "Testing the nodemailer",
    text: "lab lab lab lab !"
}

tp.sendMail(mailOptions, function(err){
    if(err) throw err;
    else{
        console.log('mail sent !')
    }
})