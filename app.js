const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const Applicant = require("./models/models");
const { createPDF } = require("./utils/pdfService");
const { sendEmail } = require("./services/mailService");

// The Express app is defined here without connecting to MongoDB or listening
// on a port, so it can be exercised directly by the test suite.
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/submit-form", async (req, res) => {
  try {
    // Save applicant data to the database
    const applicantData = req.body;
    const applicant = new Applicant(applicantData);
    await applicant.save();

    // Generate the PDF from form data
    const pdfBuffer = await createPDF(applicantData);

    const attachments = [
      {
        filename: "Candidate_Registration_Form.pdf",
        content: pdfBuffer,
      },
    ];

    // Send the email with the PDF attachment
    await sendEmail(attachments, req.body, (err, succ) => {
      return console.log(err, succ, "errorrrrr");
    });

    res.status(200).json({
      message: `Application submitted and email sent successfully to ${req.body.email}`,
    });
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({ message: "Error processing application", error });
  }
});

module.exports = app;
