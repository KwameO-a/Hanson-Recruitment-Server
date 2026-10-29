# Hanson Recruitment Server

![Tests](https://github.com/Kwameo-a/Hanson-Recruitment-Server/actions/workflows/test.yml/badge.svg)

The REST API behind the [Hanson Recruitment](https://hanson-recruitment.vercel.app) candidate registration form. It receives an application, stores it in MongoDB, renders it as a PDF (including the candidate's drawn signature) and emails the PDF to the candidate.

## Stack

- **Node.js / Express** – REST API
- **MongoDB / Mongoose** – applicant records, with automatic `createdAt` / `updatedAt` timestamps
- **PDFKit** – server-side PDF generation
- **Nodemailer** – email delivery over Gmail SMTP (TLS)
- **Jest / Supertest** – automated tests, run on every push by GitHub Actions

## Structure

```
app.js                  Express app and routes (no DB connection, so it can be tested)
index.js                Entry point: loads config, connects to MongoDB, starts the server
models/models.js        Applicant schema
utils/pdfService.js     Builds the registration form PDF
services/mailService.js Sends the PDF by email
tests/                  Jest test suites
```

## API

### `POST /submit-form`

Accepts the registration form as JSON.

| Response | When |
| --- | --- |
| `200` | Applicant saved, PDF generated and email sent |
| `400` | The request body is not valid JSON |
| `500` | Saving, PDF generation or sending the email failed |

## Running locally

Create a `.env` file (it is git-ignored) with:

```
DATABASE_URL=<MongoDB connection string>
MAILER_ADDRESS=<Gmail address>
MAILER_PASSWORD=<Gmail app password>
```

Then:

```bash
npm install
npm start
```

The server listens on `PORT` (default `3002`).

## Tests

```bash
npm test
npm test -- --coverage
```

The tests replace MongoDB, the PDF writer and the mailer with test doubles, so they need no database, credentials or network access. They cover:

- **The `/submit-form` route:** the happy path, failure at each stage (database, PDF, email), malformed JSON, CORS pre-flight and unknown routes
- **The Applicant schema:** field casting, removal of unknown fields and timestamps
- **PDF generation:** valid PDF output, empty forms, embedded signatures, multi-page answers and invalid signature images
