const request = require("supertest");

// Replace the database model, PDF generator and mailer with test doubles so
// the route can be tested without MongoDB, the filesystem or a Gmail account.
const mockSave = jest.fn();
jest.mock("../models/models", () =>
  jest.fn().mockImplementation((data) => ({ ...data, save: mockSave }))
);
jest.mock("../utils/pdfService", () => ({ createPDF: jest.fn() }));
jest.mock("../services/mailService", () => ({ sendEmail: jest.fn() }));

const Applicant = require("../models/models");
const { createPDF } = require("../utils/pdfService");
const { sendEmail } = require("../services/mailService");
const app = require("../app");

const applicant = {
  title: "Ms",
  firstName: "Ama",
  lastName: "Mensah",
  email: "ama.mensah@example.com",
  position: "Support Worker",
};

describe("POST /submit-form", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockSave.mockResolvedValue();
    createPDF.mockResolvedValue(Buffer.from("%PDF-1.3 test"));
    sendEmail.mockResolvedValue();
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("saves the applicant, generates the PDF and emails it", async () => {
    const res = await request(app).post("/submit-form").send(applicant);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain(applicant.email);

    expect(Applicant).toHaveBeenCalledWith(applicant);
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(createPDF).toHaveBeenCalledWith(applicant);

    const [attachments, formData] = sendEmail.mock.calls[0];
    expect(formData).toEqual(applicant);
    expect(attachments).toEqual([
      {
        filename: "Candidate_Registration_Form.pdf",
        content: Buffer.from("%PDF-1.3 test"),
      },
    ]);
  });

  it("returns 500 and sends nothing when the database save fails", async () => {
    mockSave.mockRejectedValue(new Error("connection refused"));

    const res = await request(app).post("/submit-form").send(applicant);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Error processing application");
    expect(createPDF).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("returns 500 and sends nothing when PDF generation fails", async () => {
    createPDF.mockRejectedValue(new Error("missing logo"));

    const res = await request(app).post("/submit-form").send(applicant);

    expect(res.status).toBe(500);
    expect(mockSave).toHaveBeenCalledTimes(1);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("returns 500 when the email cannot be sent", async () => {
    sendEmail.mockRejectedValue(new Error("SMTP auth failed"));

    const res = await request(app).post("/submit-form").send(applicant);

    expect(res.status).toBe(500);
  });

  it("rejects a malformed JSON body with 400", async () => {
    const res = await request(app)
      .post("/submit-form")
      .set("Content-Type", "application/json")
      .send('{"firstName": "Ama",');

    expect(res.status).toBe(400);
    expect(mockSave).not.toHaveBeenCalled();
  });

  it("allows cross-origin requests from the front end", async () => {
    const res = await request(app)
      .options("/submit-form")
      .set("Origin", "https://hanson-recruitment.vercel.app")
      .set("Access-Control-Request-Method", "POST");

    expect(res.status).toBe(204);
    expect(res.headers["access-control-allow-origin"]).toBe("*");
  });

  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/does-not-exist");

    expect(res.status).toBe(404);
  });
});
