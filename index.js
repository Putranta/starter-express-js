const express = require("express");
const cors = require("cors");

// Load .env
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Health Check
app.get("/api/health", (req, res) => {
  res.send("Tess Backend is running");
});

app.use("/api/user", require("./routes/auth"));

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
