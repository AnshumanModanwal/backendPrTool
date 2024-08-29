const { v1beta2 } = require("@google-ai/generativelanguage");
const { TextServiceClient } = v1beta2;
const Razorpay = require('razorpay');
const { GoogleAuth } = require("google-auth-library");
const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware for parsing JSON bodies
app.use(bodyParser.json());
// Use the cors package to handle CORS
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from this origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Specify allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
    optionsSuccessStatus: 200, // Set success status for preflight OPTIONS requests
  })
);

// Ensure CORS pre-flight requests are handled properly
// Ensure OPTIONS requests return a 200 status for all routes
app.options('*', (req, res) => {
  res.sendStatus(200);
});

// Google AI API setup
const MODEL_NAME = "models/text-bison-001";
const API_KEY = process.env.GOOGLE_API_KEY;

const client = new TextServiceClient({
  authClient: new GoogleAuth().fromAPIKey(API_KEY),
});

// Endpoint to generate business names based on user input
app.post("/prGenerator", async (req, res) => {
  try {
    const { input } = req.body;
    const prompt = `Generate a unique Press release with proper format on the topic ${input}`;

    const response = await client.generateText({
      model: MODEL_NAME,
      prompt: { text: prompt },
    });

    let output = response[0].candidates[0].output;
    res.json(output);
  } catch (error) {
    console.error("Error generating business names:", error);
    res.status(500).json({ error: "An error occurred while generating business names." });
  }
});

// Razorpay Orders endpoint
app.post("/Orders", async (req, res) => {
  const razorpay = new Razorpay({
    key_id: process.env.RZR_KEY,
    key_secret: process.env.KEY_SECRET,
  });
  
  const { amount, currency } = req.body;

  const options = {
    amount: amount,
    currency: currency,
    receipt: "receipt#1",
    payment_capture: 1
  };

  try {
    const response = await razorpay.orders.create(options);
    res.json({
      order_id: response.id,
      currency: response.currency,
      amount: response.amount
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to create Razorpay order." });
  }
});

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to Tools and Payment API");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
