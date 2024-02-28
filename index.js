const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const Applicant = require("./models/models"); // Adjust the path as necessary
const { createPDF, createPDFMain } = require("./utils/pdfService"); // Adjust the path as necessary
const { sendEmail } = require("./services/mailService"); // Adjust the path as necessary
const app = express();
app.use(cors());
app.use(bodyParser.json());
require("dotenv").config();

// Make sure to replace 'your-mongodb-connection-string' with your actual MongoDB connection string.
mongoose.connect(process.env.DATABASE_URL);

app.post("/submit-form", async (req, res) => {
  try {
    // Save applicant data to the database
    const applicantData = req.body;
    const applicant = new Applicant(applicantData);
    await applicant.save();

    // Generate the PDF from form data
    // Assuming createPDF function now properly returns a Buffer or Stream
    const pdfBuffer = await createPDF(applicantData); // Adjust this based on your implementation

    // Convert PDF buffer/stream to a format suitable for nodemailer attachments
    const attachments = [
      {
        filename: "Candidate_Registration_Form.pdf",
        content: pdfBuffer,
      },
    ];

    // Specify the recipient's email address dynamically or use a fixed address for testing
    // Replace with actual recipient email address

    // Send the email with the PDF attachment
    await sendEmail(attachments, req.body, (err, succ) => {
      return console.log(err, succ, "errorrrrr");
    });

    res
      .status(200)
      .json({
        message: `Application submitted and email sent successfully to ${req.body.email}`,
      });
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({ message: "Error processing application", error });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
