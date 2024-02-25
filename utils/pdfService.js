// const PDFDocument = require("pdfkit");
// // const getStream = require('get-stream');
const PDFDocument = require("pdfkit");
const fs = require("fs");

function createPDFMain(formData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      let pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Add content to the PDF
    doc.text(`First Name: ${formData.firstName}`, 10, 10);
    // Continue with other form data
    doc.end();
  });
}



function createPDFs(formData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const fileName = "candidate_registration_form.pdf";
    const stream = fs.createWriteStream(fileName);

    doc.pipe(stream);

    // Add image/logo as header
    doc.image("./image/logo.jpg", 50, 50, { width: 100 }); // Adjust path and dimensions as needed

    // Text underneath the image
    doc.fontSize(16).text("Candidate Registration Form", { align: "center" });
    doc.moveDown();

    // Current date and time
    const currentDate = new Date().toLocaleString();
    doc.fontSize(12).text(`Date: ${currentDate}`, { align: "right" });
    doc.moveDown();

    // Create table headers with borders
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("Question", 50, doc.y, { width: 200, align: "left" })
      .text("Response", 300, doc.y, { width: 200, align: "left" });

    // Draw borders around the table
    //   doc.rect(50, doc.y, 450, Object.keys(formData).length * 20 + 40).stroke();

    //   doc.moveDown();

    // Populate table with form data
    Object.entries(formData).forEach(([key, value]) => {
      doc.font("Helvetica").text(key, 50, doc.y, { width: 200, align: "left" });
      doc.text(value, 300, doc.y, { width: 200, align: "left" });
      doc.moveDown();
    });

    doc.end();

    stream.on("finish", () => {
      resolve(fileName);
    });

    stream.on("error", (err) => {
      reject(err);
    });
  });
}

function createPDF(formData) {
  return new Promise((resolve, reject) => {
  const doc = new PDFDocument();
  const fileName = "candidate_registration_form.pdf";
  let buffers = []
  const writeStream = fs.createWriteStream(fileName);
  doc.pipe(writeStream);
  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", () => {
    let pdfData = Buffer.concat(buffers);
    resolve(pdfData);
  });
  // Add image/logo as header
  doc.image("./image/mainlogo.jpg", 50, 50, { width: 100, height: 100 });

  // Add title
  doc
    .fontSize(12)
    .text("Candidate Registration Form", { align: "center", height: 40 });
  doc.moveDown();

  // Add form response filled date
  const currentDate = new Date().toLocaleString();
  doc
    .fontSize(10)
    .text(`Form Response Filled: ${currentDate}`, {
      align: "center",
      height: 40,
    });
  doc.moveDown();

  doc.lineCap("butt").moveTo(270, 180).lineTo(270, 700).stroke(); // Draws a vertical line at x-coordinate 270

  // Draw the table
  const labels = [
    "Title",
    "Legal First Name",
    "Legal Middle Name",
    "Legal Surname",
    "Known As",
    "Previous Names",
    "Address",
    "PostCode",
    "Phone Number",
    "Email",
    "Date of Birth",
    "Town of Birth",
    "Nationality",
    "National Insurance Number",
    "Gender",
    "If Hanson Recruitment are completing a new DBS for you, it will be Child and Adult Workforce. Do you need a new DBS or do you have one (child workforce/ child & adult workforce) on the update service?",
    "Next Of Kin Name",
    "Relationship to you",
    "Next of Kin Address",
    "Contact Number",
    "Highest Level of Qualification",
    "Please state, if applicable, any periods of residence outside of the UK within the last 5 years and any periods of more than 6 months at any time. E.g. Spain - 10 months - Jan 2018 to October 2018",
    "If Yes Required, which country?",
    "Position",
    "Tel",
    "Dates of Employment/Studies",
  ];
  for (let i = 0; i < labels.length; i++) {
    row(doc, 180 + i * 20); // Draw row
    textInRowFirst(doc, labels[i], 190 + i * 20); // Fill first column with labels
  }

  // Fill second column with values from formData
  const values = Object.values(formData);
  for (let i = 0; i < values.length; i++) {
    textInRowSecond(doc, values[i].toUpperCase(), 190 + i * 20); // Fill second column with values
  }
  
  doc.end();

  writeStream.on("finish", function () {
    resolve(fileName)
    console.log("PDF created successfully.");
  });

  writeStream.on("error", function (error) {
    reject(error)
    console.error("Error creating PDF:", error);
  });
})
}

function textInRowFirst(doc, text, height) {
  doc.y = height;
  doc.x = 30;
  doc.fillColor("grey");
  doc.text(text, {
    paragraphGap: 5,
    indent: 5,
    align: "justify",
    columns: 1,
  });
}

function textInRowSecond(doc, text, height) {
  doc.y = height;
  doc.x = 270; // Start from the middle line to fill the second column
  doc.fillColor("black");
  doc.text(text, {
    paragraphGap: 5,
    indent: 5,
    align: "justify",
    columns: 1,
  });
}

function row(doc, height) {
  doc.fillColor("grey").lineJoin("miter").rect(30, height, 500, 20).stroke();
}

module.exports = { createPDF };
