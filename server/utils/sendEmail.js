const nodemailer = require("nodemailer");

const sendEmail = async (send_from, send_to, reply_to, subject, message) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.forwardemail.net",
        port: 465,
        auth: {
            user: "vstsdesigner77@gmail.com",
            pass: "jayaKrishna@143"
        },
        tls: {
            rejectUnauthorized: false
        }
    })

    const options = {
        from: send_from,
        to: send_to,
        replyTo:reply_to,
        subject: subject,
        // text: message,
        html: message
    }

    // const info = await transporter.sendMail(options)
    await transporter.sendMail(options, function(err, info){
        if(err) console.log(err);
        console.log(info)
    });
}

module.exports = sendEmail;