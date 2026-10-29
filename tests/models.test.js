const Applicant = require("../models/models");

// These tests check the schema in memory; no database connection is opened.
describe("Applicant model", () => {
  it("keeps the fields defined in the schema", () => {
    const applicant = new Applicant({
      title: "Mr",
      firstName: "Kofi",
      middleName: "Yaw",
      lastName: "Boateng",
      gender: "Male",
      position: "Care Assistant",
      email: "kofi.boateng@example.com",
    });

    expect(applicant.validateSync()).toBeUndefined();
    expect(applicant.firstName).toBe("Kofi");
    expect(applicant.position).toBe("Care Assistant");
  });

  it("drops fields that are not part of the schema", () => {
    const applicant = new Applicant({
      firstName: "Kofi",
      isAdmin: true,
    });

    expect(applicant.toObject()).not.toHaveProperty("isAdmin");
  });

  it("casts non-string values to strings", () => {
    const applicant = new Applicant({ firstName: 12345 });

    expect(applicant.firstName).toBe("12345");
  });

  it("records createdAt and updatedAt timestamps", () => {
    expect(Applicant.schema.options.timestamps).toBe(true);
    expect(Applicant.schema.path("createdAt")).toBeDefined();
    expect(Applicant.schema.path("updatedAt")).toBeDefined();
  });
});
