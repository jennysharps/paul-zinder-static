const nodemailer = require("nodemailer");
const log = require("./log");


let transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
       user: process.env.GMAIL_USER,
       pass: process.env.GMAIL_PASSWORD,
    }
});

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.sendEmail = async (req, res) => {
    const allowed_origins = ["http://localhost:4000", "http://paulzinder.com", "https://jennysharps.github.io"];
    const origin = req.get('origin');
    log.info({ origin });

    if (allowed_origins.includes(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
    }

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        res.status(204).send('');
        return;
    }
        
    // validate reCaptcha
    // get details off of request & send email
    log.info("Sending email...");

    const message = {
        from: 'jennylynnsharps@gmail.com',
        to: 'jsharps85@gmail.com',
        replyTo: req.body.email,
        subject: 'Test email cloudfn',
        text: `Name: ${req.body.name}\nEmail: ${req.body.email},\nMessage:\n${req.body.message}`
    };

    try {
        const info = await transport.sendMail(message);
        log.info({ info });
        res.status(204).send('');
    } catch (err) {
        log.info({ err });
        res.status(400).send({ status: "ERROR", error: err });    
    }
};
