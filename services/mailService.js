// mailService.js
const nodemailer = require("nodemailer");
require('dotenv').config()
// Set up your SMTP server settings
// const transporter = nodemailer.createTransport({
//   host: 'smtp.example.com', // Your SMTP server host
//   port: 587,                // Your SMTP server port; 587 is common for non-SSL connections
//   secure: false,            // True for 465 (SSL), false for other ports
//   auth: {
//     user: 'hubertamarfio@gmail.com', // Your email address
//     pass: 'AmArFiO123456',          // Your email password
//   },
// });
let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAILER_ADDRESS,
    pass: process.env.MAILER_PASSWORD,
  },
  tls: {
    secureProtocol: "TLSv1_2_method",
  },
});
/**
 * Send an email with a PDF attachment.
 * @param {Buffer} pdfBuffer - The PDF file as a Buffer.
 * @param {string} recipientEmail - The recipient's email address.
 * @param {Function} callback - A callback function to handle the response.
 */
async function sendEmail(attachments, formData, callback) {
  const mailOptions = {
    from: "noreply@example.com", // Sender address
    to: formData?.email, // List of recipients
    subject: `Job Application: ${formData.title} ${formData.lastName} ${formData.firstName} - ${formData.positionOfApplicant}`, // Subject line
    text: `Please find attached my application for the ${formData.positionOfApplicant} position at Hanson Recruitment. The attached PDF contains all the necessary details regarding my qualifications and experiences.`, // Plain text body
    attachments: attachments
  };

  transporter.sendMail(mailOptions, callback);
}

module.exports = { sendEmail };