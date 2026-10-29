const fs = require("fs");
const { Writable } = require("stream");

const { createPDF } = require("../utils/pdfService");

// 1x1 transparent PNG, in the data-URL format the front end's signature pad sends
const SIGNATURE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

describe("createPDF", () => {
  beforeEach(() => {
    // Discard the copy createPDF writes to disk so tests leave no files behind
    jest
      .spyOn(fs, "createWriteStream")
      .mockImplementation(() => new Writable({ write: (chunk, enc, cb) => cb() }));
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns a PDF document as a Buffer", async () => {
    const pdf = await createPDF({ firstName: "Ama", lastName: "Mensah" });

    expect(Buffer.isBuffer(pdf)).toBe(true);
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.subarray(-6).toString()).toContain("%%EOF");
  });

  it("handles a form with no fields filled in", async () => {
    const pdf = await createPDF({});

    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
  });

  it("embeds a base64 signature image", async () => {
    const unsigned = await createPDF({ firstName: "Ama" });
    const signed = await createPDF({ firstName: "Ama", signature: SIGNATURE });

    expect(signed.length).toBeGreaterThan(unsigned.length);
  });

  it("adds pages when the answers run past one page", async () => {
    const longAnswer = "Lived and worked abroad. ".repeat(80);
    const pdf = await createPDF({
      criminalRecordDetails: longAnswer,
      criminalDetails: longAnswer,
    });

    const pageCount = (pdf.toString("latin1").match(/\/Type \/Page\b/g) || [])
      .length;
    expect(pageCount).toBeGreaterThan(1);
  });

  it("rejects an invalid signature image", async () => {
    await expect(
      createPDF({ signature: "data:image/png;base64,bm90LWFuLWltYWdl" })
    ).rejects.toThrow();
  });
});
