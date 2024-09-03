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
    origin: "https://www.bizzowl.com", // Allow requests from this origin
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
    console.log("Received body:", req.body);
    const { prType,details,tone,companyName,companyDesc, adQuotes} = req.body;
   

const prompt = `
Act as a seasoned Public Relations professional with 25 years of experience in the Indian market. The objective is to help me write a press release with a human-like touch that passes AI detection tests. 

The reason we are writing this press release is ${prType}. 

Here is an overview of details I have got to manage, rest you need to manage this professionally: ${details}. 

This is the ${tone} tone you need to use throughout this press release. 

The company for which we are writing this press release is ${companyName}. 

Here is a brief description of the company, including the value proposition and key details: ${companyDesc}. 

Here is what the C-level executive of that company has to say: ${adQuotes}. 

The output requirement is as follows:
- Word Count: Between 500-1000 words.
- Writing Style: Ensure the press release reads naturally, follows professional press release standards, and feels human-written.

Now generate a professional press release based on the provided details and ensure it meets the specified requirements, including tone and word count.
`;



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
