const PDFDocument = require("pdfkit");
const fs = require("fs");

function createPDF(formData) {
  return new Promise((resolve, reject) => {
    const { signature, ...rest } = formData;
    const doc = new PDFDocument();
    const fileName = "candidate_registration_form.pdf";
    const writeStream = fs.createWriteStream(fileName);
    let buffers = [];

    doc.pipe(writeStream);
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Add image/logo as header
    doc.image("./image/mainlogo.jpg", 50, 50, { width: 100, height: 100 });

    // Add title
    doc.fontSize(12).text("Candidate Registration Form", { align: "center" });
    doc.moveDown();

    // Add form response filled date
    const currentDate = new Date().toLocaleString();
    doc.fontSize(10).text(`Form Response Filled: ${currentDate}`, { align: "center" });
    doc.moveDown(2);

    // First table generation
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
      "Next Of Kin Name",
      "Relationship to you",
      "Next of Kin Address",
      "Emergency Tel No",
      "Highest Level of Qualification",
      "Position",
      "Tel",
      "ReferenceTitle",
      "Employment Start Date",
      "Employment End Date",
      "ReferenceEmail",
    ];
    const values = Object.values(rest);
    const firstArray = values.slice(0, labels.length);
    let startY = doc.y; // Starting Y position for the first label

    labels.forEach((label, index) => {
      // Check for end of page and add a new one if necessary
      if (startY >= doc.page.height - 50) {
        doc.addPage();
        startY = 50; // Reset Y coordinate at the top of the new page
      }
      row(doc, startY);
      textInRowFirst(doc, label, startY);
      textInRowSecond(doc, firstArray[index], startY);
      startY += 20; // Increment Y coordinate for next row
    });
    doc.addPage();
    let secondTableStart = 50; 

    const rowHeight = 20;
    const textHeight = rowHeight;

    // Prepare the second set of data
    const SecondLabels = [
      "If Hanson Recruitment are completing a new DBS for you, it will be Child and Adult Workforce. Do you need a new DBS or do you have one (child workforce/ child & adult workforce) on the update service?",
      "Please state, if applicable, any periods of residence outside of the UK within the last 5 years and any periods of more than 6 months at any time. E.g. Spain - 10 months - Jan 2018 to October 2018",
      "If Yes Required, which country?",
      "Signature",
    ];
    const secondArray = values.slice(labels.length);

    // Start the second table on a new page to avoid overflow
    // doc.addPage();
    // let secondTableStart = doc.y + 20; // Starting Y coordinate at the top of the new page

    SecondLabels.forEach((label, index) => {
      // Check if there's enough space for the row; if not, add a new page
      if (secondTableStart + textHeight > doc.page.height - 50) {
        doc.addPage();
        secondTableStart = 50; // Reset to the top of the new page
      }

      // Draw the row for the label
      row(doc, secondTableStart);
      textInRowFirst(doc, label, secondTableStart);

      // Draw the row for the corresponding value
      row(doc, secondTableStart + rowHeight);
      textInRowSecond(doc, secondArray[index], secondTableStart + rowHeight);

      // Increment the Y position for the next row, leaving space between rows
      secondTableStart += rowHeight * 2; // Double the row height for label and value
    });

    // Signature handling
    if (signature) {
      // Ensure there's enough space for signature, or add a new page
      if (secondTableStart >= doc.page.height - 50) {
        doc.addPage();
        secondTableStart = 50; // Reset Y coordinate at the top of the new page
      }
      const signatureImageBuffer = Buffer.from(signature.replace(/^data:image\/\w+;base64,/, ""), "base64");
      doc.image(signatureImageBuffer, 270, secondTableStart, { width: 100, height: 50 });
    }

    doc.end();

    writeStream.on("finish", () => resolve(fileName));
    writeStream.on("error", (error) => reject(error));
  });
}

function row(doc, height) {
  doc.lineWidth(1).strokeColor("#000").rect(50, height, 800, 20).stroke();
  doc.fillAndStroke("#fff", "#000");
}

function textInRowFirst(doc, text, height) {
  doc.fontSize(10).fillColor('black').text(text, 60, height + 6, { width: 200, align: "left" });
}

function textInRowSecond(doc, text, height) {
  doc.fontSize(10).fillColor('black').text(text, 280, height + 6, { width: 200, align: "left" });
}

module.exports = { createPDF };
