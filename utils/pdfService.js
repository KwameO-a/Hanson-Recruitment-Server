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
    const { signature, ...rest } = formData;
    // console.log(formData, "formdata")
    // console.log(signature);
    const doc = new PDFDocument();
    const fileName = "candidate_registration_form.pdf";
    let buffers = [];
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
    doc.fontSize(10).text(`Form Response Filled: ${currentDate}`, {
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
    const SecondLabels = [
      "If Hanson Recruitment are completing a new DBS for you, it will be Child and Adult Workforce. Do you need a new DBS or do you have one (child workforce/ child & adult workforce) on the update service?",
      "Please state, if applicable, any periods of residence outside of the UK within the last 5 years and any periods of more than 6 months at any time. E.g. Spain - 10 months - Jan 2018 to October 2018",
      "If Yes Required, which country?",
      "Signature",
    ];

    for (let i = 0; i < labels.length; i++) {
      row(doc, 180 + i * 20); // Draw row
      textInRowFirst(doc, labels[i], 190 + i * 20); // Fill first column with labels
    }

    // Fill second column with values from formData
    const values = Object.values(rest);
    const firstArray = values.slice(0, 26);
    const secondArray = values.slice(26);
    console.log(secondArray);
    for (let i = 0; i < firstArray.length; i++) {
      textInRowSecond(doc, firstArray[i].toUpperCase(), 190 + i * 20); // Fill second column with values
    }

    doc.addPage(); // Add a new page
    // // doc.lineCap("butt").moveTo(270, 180).lineTo(270, 700).stroke(); // Draws a vertical line at x-coordinate 270

    // // Page 2
    // // Add content to the second page here
    // // doc.fontSize(24).text("Second Page Content", { align: "center" });
    if (formData.signature) {
      const signatureImageData = formData.signature.replace(
        /^data:image\/\w+;base64,/,
        ""
      );
      const signatureImageBuffer = Buffer.from(signatureImageData, "base64");

      // Adjust the positioning of the signature as necessary
      let signaturePositionY = 100; // Example position, adjust based on your document layout

      

      // doc.image(signatureImageBuffer, 50, signaturePositionY, {
      //   width: 100,
      //   height: 50,
      // });
      row(doc, 200); // Draw row
      textInRowFirst(doc, "Signature", 190 + 20);
      imageInRowSecond(doc, signatureImageBuffer, 190 + 20);
    }

    
    for (let i = 0; i < SecondLabels.length; i++) {
      row(doc, 190 + i * 500); // Draw row
      textInRowFirst(doc, SecondLabels[i], 190 + i * 100); // Fill first column with labels
    }

    // Fill second column with values from formData
    // const values = Object.values(formData);
    for (let i = 26; i < secondArray.length; i++) {
      textInRowSecond(doc, secondArray[i].toUpperCase(), 190 + i * 100); // Fill second column with values
    }

    doc.end();

    writeStream.on("finish", function () {
      resolve(fileName);
      console.log("PDF created successfully.");
    });

    writeStream.on("error", function (error) {
      reject(error);
      console.error("Error creating PDF:", error);
    });
  });
}

function textInRowFirst(doc, text, height) {
  doc.y = height;
  doc.x = 30;
  doc.fillColor("grey");
  doc.text(text, {
    paragraphGap: 5,
    indent: 5,
    align: "left",
    columns: 2,
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
function imageInRowSecond(doc, image, height) {

  doc.y = height;
  doc.x = 270; // Start from the middle line to fill the second column
  doc.fillColor("black");
  doc.image(image, 50, 100, {
    width: 100,
    height: 50,
  });
}

function row(doc, height) {
  doc.fillColor("grey").lineJoin("miter").rect(20, height, 550, 20).stroke();
}

module.exports = { createPDF };
