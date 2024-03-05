const PDFDocument = require("pdfkit");
const fs = require("fs");

// Calculates the required text height for a given text block
function calculateTextHeight(doc, text, width, fontSize) {
  doc.fontSize(fontSize);
  return doc.heightOfString(text, { width: width, align: 'left' }) + 10; // Adding a margin for padding
}

function createPDF(formData) {
  return new Promise((resolve, reject) => {
    const { signature, ...rest } = formData;
    const doc = new PDFDocument({ margin: 50 });
    const fileName = "candidate_registration_form.pdf";
    const writeStream = fs.createWriteStream(fileName);
    let buffers = [];

    doc.pipe(writeStream);
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    // Document setup (images, title, etc.)
    doc.image("./image/mainlogo.jpg", 50, 50, { width: 100 });
    doc.fontSize(12).text("Candidate Registration Form", 150, 160, { align: "center" });
    const currentDate = new Date().toLocaleString();
    doc.fontSize(10).text(`Form Response Filled: ${currentDate}`, 150, 200, { align: "center" });

    let startY = 250; // Starting Y position after header, title, and date

    // Labels for the form fields
    const labelsMap ={
     title: "Title", 
     firstName: "Legal First Name", 
     middleName: "Legal Middle Name", 
     lastName: "Legal Surname",
     knownAs: "Known As", 
     previousNames:"Previous Names",
     address:"Address", 
     postCode:"Post Code", 
     phoneNumber:"Phone Number", 
     email:"Email",
     dateOfBirth: "Date of Birth",
     townofBirth: "Town of Birth",
     nationality: "Nationality",
     nationalInsuaranceNumber:"National Insurance Number", 
     gender:"Gender", 
     needNewDBS:"If Hanson Recruitment are completing a new DBS for you, it will be Child and Adult Workforce. Do you need a new DBS or do you have one (child workforce/ child & adult workforce) on the update service?",
     nextofkinName:"Next of Kin Name", 
     relationship:"Relationship to you", 
     nextofkinaddress:"Next of Kin Address",
     nextofkincontact:"Emergency Tel No", 
     qualification:"Highest Level of Qualification",
     positionOfApplicant: "Position of Applicant",
     overseasCountries:"Please state, if applicable, any periods of residence outside of the UK within the last 5 years and any periods of more than 6 months at any time. E.g. Spain - 10 months - Jan 2018 to October 2018",
     forename:"Reference Fore Name",
     surname:"Reference Surname",
     position:"Position Held at Reference",
     company: "Company Name",
      
     tel:"Reference Contact", 
     Referencetitle: "Reference Title",
     datesOfemployment:"Employment Start Date", 
     datesOfemploymentEnd: "Employment End Date",
     ReferenceEmail: "Reference Email",
     criminalDetails:"Do you have a Criminal Record?",
     criminalRecordDetails:"If yes, please provide detail",
     consentGiven:"Consent To Criminal Records Given by Applicant",
     hasHealthIssue:"Do you have any health issues or disabilities relevant to the role you seek?",
     healthInfo: "If yes, Please provide health information",
     supportNeeds: "What level of support do you require in relation to this vacancy?" ,
     doctorLetterProvided: "Have you provided a letter from your GP confirming  that you are fit and able for the role?",

    // hasCriminalRecord:"Do you have a Criminal Record?",
    };

    // Additional labels for more detailed information
    const SecondLabels = {
      
      
      
       
      signature:"Signature", 
      
    };

    // Combine all labels for processing
    const allLabels = {...labelsMap, ...SecondLabels};
    console.log(allLabels);

    rest.signature= `\n ${rest.firstName} ${rest.middleName} ${rest.lastName}`;

    // Draw rows for each label and value, adjusting for dynamic content
    for (const [index, label] of Object.entries(allLabels))  {
      if (index === labelsMap.length) {
         // Check if starting on second set of labels
        doc.addPage(); // Add a new page for the second set of labels
        startY = 50; // Reset startY position for the new page
      }

      const textValue = rest[index] || "N/A"; // Retrieve the value or default to "N/A"
      const rowHeight = calculateTextHeight(doc, `${label}: ${textValue}`, 400, 10);

      // Ensure new page is added if content exceeds page length
      if (startY + rowHeight > doc.page.height - 50) {
        doc.addPage();
        startY = 50; // Reset startY for the new page
      }

      // Draw the label and value, then adjust startY based on the content height
      doc.fontSize(10).fillColor('black').text(`${label}: ${textValue}`, 60, startY, { width: 400, align: "left" });
      startY += rowHeight + 10; // Increment startY for the next row
    };

    // Handle the signature if present
    if (signature) {
      if (startY + 100 > doc.page.height - 50) { // Check space for signature
        doc.addPage();
        startY = 50;
      }
      const signatureImageBuffer = Buffer.from(signature.replace(/^data:image\/\w+;base64,/, ""), "base64");
      doc.image(signatureImageBuffer, 250, startY, { width: 100, height: 50 });
    }

    doc.end();
    writeStream.on("finish", () => resolve(fileName));
    writeStream.on("error", reject);
  });
}

module.exports = { createPDF };
