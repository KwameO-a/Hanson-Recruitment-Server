const PDFDocument = require("pdfkit");
const fs = require("fs");

// Calculates the required text height for a given text block
function calculateTextHeight(doc, text, width, fontSize) {
  doc.fontSize(fontSize);
  doc.font('Helvetica-Bold');
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
     RoleApplyingFor:"What Role Are You Applying for?",
     TeachingID:"Teaching ID",
     nextofkinName:"Next of Kin Name", 
     relationship:"Relationship to you", 
     nextofkinaddress:"Next of Kin Address",
     nextofkincontact:"Emergency Tel No", 
     qualification:"Highest Level of Qualification",
     positionOfApplicant: "Position of Applicant",
     overseasCountries:"Please state, if applicable, any periods of residence outside of the UK within the last 5 years and any periods of more than 6 months at any time. E.g. Spain - 10 months - Jan 2018 to October 2018",
     forename:"Referee's Forename",
     surname:"Referee's  Surname",
     position:"Position Held at Previous Company",
     company: "Company Name",
      
     tel:"Referee's Contact", 
     Referencetitle: "Referee's Posistion Held in the Company",
     datesOfemployment:"Employment Start Date", 
     datesOfemploymentEnd: "Employment End Date",
     ReferenceEmail: "Reference Email",
     criminalDetails:"Do you have a Criminal Record?",
     criminalRecordDetails:"If yes, please provide detail",
     CriminalConsentGiven:"Consent To Criminal Records Given by Applicant",
     CriminalDate:"Criminal Consent Date",
     hasHealthIssue:"Do you have any health issues or disabilities relevant to the role you seek?",
     healthInfo: "If yes, Please provide health information",
     supportNeeds: "What level of support do you require in relation to this vacancy?" ,
     doctorLetterProvided: "Have you provided a letter from your GP confirming  that you are fit and able for the role?",
     HealthConsentGiven:"Consent  To Health Information Given by Applicant" ,
     HealthDeclarationDate: "Health Declaration Date" ,
     DisclosureConsentGiven:  "Candidate Declaration Consent",
     DisclosureConsentDate:   "Disclosure Consent Date",


     excludedCounties:"As part of our commitment to comply with GDPR, we require your consent to process your personal data. Please indicate your preferences below. Counties you do NOT wish your details to be shared with ",
     excludedProvisions:"Provisions you do NOT wish your details shared with",
     emailMarketing:"Do you wish to be sent email marketing information",
     mailMarketing:"Do you wish to be sent Mail marketing information",
     smsMarketing:"Do you wish to be sent SMS marketing information",
     consentGiven: "Consent to GDPR",
     GDPRdate:"GDPR Consent Date",

     question1:"1. Do you have any convictions or adult cautions that are unspent?",
     question1_detail:"If yes provide details",
     question2:"2. Do you have any other cautions or convictions that would not be filtered?",
     question2_detail:"If yes provide details",
     question3:"3. Are you included on the DBS children’s barred list?",
     question3_detail:"If yes provide details",
     question4: "4. (Teaching posts only) Are you, or have you ever been, prohibited from teaching by the TRA or sanctioned by the GTCE?",
     question4_detail: "If yes provide details",
     question5: "5. Have you been prohibited from management of an independent school (s128)?",
     question5_detail: "If yes provide details",
     question6: "6.Have you lived or worked outside the UK for more than 3 months in the last 5 years?",
     question6_detail: "If yes provide details",
     question7: "7. Are you subject to any sanctions relating to work with children in any country outside the UK? ?",
     question7_detail: "If yes provide details",
     question8: "8. The Disqualification under the Childcare Act 2006 Regulations (2018) state that anyone employed to care for children in early years (children under the age of 5) or later years (wrap-around care for children under the age of 8) is disqualified from that work if they meet certain criteria. These criteria include (this is not an exhaustive list): Certain serious criminal offences Court orders relating to the care of your own child Being prohibited from private fostering.Do you have any reason to believe you are disqualified from working in childcare?",
     question8_detail: "If yes, please contact us for more information on the Regulations",
     question9: "9. Are you aware of any current police investigation in the United Kingdom or any other country following allegations made against you by the police?",
     question9_detail:"If yes, please include the nature of the allegations made against you, and if known to you, any action to be taken against you by the police.",
     question10:"10. Are you aware of any current NHS Counter Fraud and Security Management Service Investigation following allegations made against you?",
     question10_detail:"If yes provide details",
     question11:"11. Have you ever been investigated by the Police, CFSMS or any other Investigatory Body resulting in a caution, conviction or dismissal from your employment? (Investigatory bodies include Local Authorities, Customs and Exercise, Immigration, Passport Agency, Inland Revenue, Department of Trade and Industry, Department of work and Pensions, DBS, Security Agencies, Financial Service Authority, Banks and Building Societies, General, Life Insurance Companies- This list is not exhaustive, and you must declare any investigation conducted by an Investigatory Body",
     question11_detail:"If yes, please include the nature of the allegations made against you, and if known to you, any action to be taken against you by the police/Investigatory body",
     question12:"12. Have you ever been dismissed by reason of misconduct from any employment, office or other position previously held by you?",
     question12_detail: "If yes provide details",
     question13: "13. Have you ever been disqualified from the practice of a profession or required to practice subject to specified limitations following fitness to practice proceedings by a regulatory or licencing body in the United Kingdom or any other country?",
     question13_detail:"If yes provide details",
     question14:"14. Are you currently the subject of any Investigation or fitness to practice proceedings by any licencing or regulatory body in the United Kingdom or in any other country?",
     question14_detail:"If yes provide details",
     question15:"15. Are you currently subject to any other prohibition, limitation, or restriction that means that means we are unable to consider you for the position which you are applying?",
     question15_detail:"If yes provide details",
     question16:"16. Have you ever been disqualified from a practise on grounds relating to the care of children (Including where an order is made in respect of a child under the person’s care) in the UK or in any other country?",
     question16_detail:"If yes provide details",
     question17:"17. Are or have your children ever been, the subject of a child protection order?",
     question17_detail: "If yes provide details",
     question18:"18. Has your children been taken into care?",
     question18_detail:"If yes provide details",
     question19:"19. Please read the Disqualification under the Childcare Act 2006 for a full list of relevant offences and ordered for disqualification under the Childcare Act. Are you disqualified on any of the grounds set up in the DfE guidance (not already mentioned in the questions above)?",
     question19_detail:"If yes provide details",
     question20:"20. If you have answered “yes” to any of the questions above, please use this space to provide details. Please clearly indicate the number or numbers of the question that you are answering?"















    // hasCriminalRecord:"Do you have a Criminal Record?",
    };

    // Additional labels for more detailed information
    const SecondLabels = {
      
      
      
       
      signature:"Signature", 
      
    };

    // Combine all labels for processing
    const allLabels = {...labelsMap, ...SecondLabels};
    // console.log(allLabels);

    rest.signature= `${rest.firstName} ${rest.middleName} ${rest.lastName}`;

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
