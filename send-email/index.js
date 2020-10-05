const mask = require("@moneytree/mask-pii");
const nodemailer = require("nodemailer");
const request = require('request');
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
    const allowed_origins = [
        "http://localhost:4000",
        "http://paulzinder.com",
        "https://jennysharps.github.io",
    ];
    const origin = req.get('origin');
    log.info(`Origin: ${origin}`);

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

    ["g-recaptcha-response", "email", "name", "message"].forEach(fieldName => {
        if (!req.body[fieldName]) {
            res.status(422).send({
                status: "ERROR",
                error: {
                    code: "UNPROCESSABLE_ENTITY",
                    message: `\`${fieldName}\` is a required field`
                }
            });
        }
    });

    const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + process.env.RECAPTCHA_SECRET + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
    request(verificationURL, (_error, _response, body) => {
        body = JSON.parse(body);

        if(!body.success) {
            res.status(422).send({
                status: "ERROR",
                error: {
                    code: "UNPROCESSABLE_ENTITY",
                    message: "`g-recaptcha-response` could not be validated"
                }
            });
        }
        log.info("Captcha passed validation");
    });

    try {
        const message = {
            from: 'jennylynnsharps@gmail.com',
            to: 'jsharps85@gmail.com',
            replyTo: req.body.email,
            subject: 'Test email cloudfn',
            text: `Name: ${req.body.name}\nEmail: ${req.body.email},\nMessage:\n${req.body.message}`
        };

        await transport.sendMail(message);
        log.info(`Email sent: replyTo=${mask.email(message.replyTo)}`);
        res.status(204).send('');
    } catch (err) {
        log.info("Error sending message:", { err });
        res.status(500).send({ status: "ERROR", error: { code: "INTERNAL_ERROR", message: "Email could not be sent" }});    
    }
};
