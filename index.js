require("dotenv").config();
const mongoose = require("mongoose");

const app = require("./app");

mongoose.connect(process.env.DATABASE_URL);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
