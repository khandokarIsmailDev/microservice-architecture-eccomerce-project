import nodemailer from "nodemailer"

export const transporter = nodemailer.createTransport({
    host:process.env.SMTP_HOST || 'smtp.mailgun.org',
    port:parseInt(process.env.SMTP_PORT || '2525'),

})

export const defaultSender = process.env.DEFAULT_SENDER || 'admin@example.com'