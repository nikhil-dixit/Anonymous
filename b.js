const nm = require('nodemailer');

const transport = nm.createTransport({
    service: "gmail",
    auth: {
        user: "mishramanisha925@gmail.com",
        pass: "1472580369"
    }
})

const options = {
    to: "devchoubey5@gmail.com",
    text: 'hey !'
}

transport.sendMail(options, function(err) {
    if (err) throw err;
    else {
        console.log('mail is sent check the email !');
    }
})