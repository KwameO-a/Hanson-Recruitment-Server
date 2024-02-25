// models.js
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const applicantSchema = new Schema(
  {
    // Define the structure according to your form fields
    title: String,
    firstName: String,
    middleName: String,
    lastName: String,
    gender: String,
    position: String,
    email: String,

    // ... other fields ...
  },
  { timestamps: true }
);

const Applicant = mongoose.model("Applicant", applicantSchema);

module.exports = Applicant;
