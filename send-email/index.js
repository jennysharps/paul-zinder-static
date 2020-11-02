const axios = require('axios');
const mask = require("@moneytree/mask-pii");
const nodemailer = require("nodemailer");
const logger = require("./logging");

['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'EMAIL_TO_ADDRESS', 'RECAPTCHA_SECRET'].forEach((requiredConfigKey) => {
    if (!process.env[requiredConfigKey]) {
        throw new Error(`missing config: ${requiredConfigKey} is required`);
    }
});

let transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST, // smtp.gmail.com, mail.paulzinder.com
    port: process.env.SMTP_PORT, // 465 SSL, 587 no SSL
    auth: {
       user: process.env.SMTP_USER,
       pass: process.env.SMTP_PASSWORD,
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
        "https://www.paulzinder.com",
        "https://jennysharps.github.io",
    ];
    const origin = req.get('origin');
    logger.info(`Origin: ${origin}`);

    if (allowed_origins.includes(origin)) {
        res.set('Access-Control-Allow-Origin', origin);
    }

    if (req.method === 'OPTIONS') {
        // Send response to OPTIONS requests
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Max-Age', '3600');
        return res.status(204).send('');
    }

    if (req.method !== 'POST') {
        return res.status(405).send({
            status: "ERROR",
            error: {
                code: "METHOD_NOT_ALLOWED",
                message: `\`${req.method}\` requests are not supported`
            }
        });
    }

    ["email", "name", "message"].forEach(fieldName => {
        if (!req.body[fieldName]) {
            return res.status(422).send({
                status: "ERROR",
                error: {
                    code: "UNPROCESSABLE_ENTITY",
                    message: `\`${fieldName}\` is a required field`
                }
            });
        }
    });

    if (!req.body['g-recaptcha-response']) {
        return res.status(401).send({
            status: "ERROR",
            error: {
                code: "UNAUTHORIZED",
                message: "`g-recaptcha-response` is required"
            }
        });
    }

    try {
        const captchaVerifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${req.body['g-recaptcha-response']}&remoteip=${req.connection.remoteAddress}`;
        const { data: { success, ...rest } } = await axios.post(captchaVerifyUrl);

         if(!success) {
            logger.info("Error codes", JSON.stringify(rest['error-codes']));
            return res.status(401).send({
                status: "ERROR",
                error: {
                    code: "UNAUTHORIZED",
                    message: "`g-recaptcha-response` could not be verified"
                }
            });
        }
        logger.info("Captcha passed verification");

        const message = {
            from: process.env.SMTP_USER,
            to: process.env.EMAIL_TO_ADDRESS,
            replyTo: req.body.email,
            subject: `[Web Contact]: Message via ${origin}`,
            text: `Name: ${req.body.name}\nEmail: ${req.body.email},\nMessage:\n${req.body.message}`
        };

        await transport.sendMail(message);
        logger.info(`Email sent: replyTo=${mask.email(message.replyTo)}`);
        
        return res.status(204).send('');
    } catch (err) {
        logger.error("Error sending message:", { err });
        return res.status(500).send({ status: "ERROR", error: { code: "INTERNAL_ERROR", message: "Email could not be sent" }});  
    }
};
