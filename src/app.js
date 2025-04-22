require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const depositRoutes = require("./Routes/deposit.routes");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Server is running");
});
app.use("/api/notifications", depositRoutes);

// Start the server
const PORT = process.env.PORT ?? 8000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
