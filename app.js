const express = require("express");
const app = express();
const spreadsheetRouter = require("./data");

app.use(express.json());
app.use("/spreadsheet", spreadsheetRouter);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`app running on port 8080`);
});
