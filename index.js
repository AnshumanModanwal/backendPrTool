const { v1beta2 } = require("@google-ai/generativelanguage");
const { TextServiceClient } = v1beta2;
const Razorpay=require('razorpay');

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
// const corsOptions = {
//   origin: 'https://www.bizzowl.com',
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
//  };

app.use(
  cors({
    origin: "*", // Adjust this to your needs, '*' allows all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Specify the methods you want to allow
    allowedHeaders: ["Content-Type", "Authorization"], // Specify the headers you want to allow
    optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);

// cors
app.options("*", cors()); // Enable CORS pre-flight for all routes

// // Custom CORS middleware
// const allowCrossDomain = (req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "https://www.bizzowl.com");
//   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
//   res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   if (req.method === 'OPTIONS') {
//      // Preflight request. Reply successfully:
//      return res.status(200).end();
//   }
//   next();
//  };
 
 // Use the custom CORS middleware
//  app.use(allowCrossDomain);

const MODEL_NAME = "models/text-bison-001";
const API_KEY = process.env.GOOGLE_API_KEY;

const client = new TextServiceClient({
  authClient: new GoogleAuth().fromAPIKey(API_KEY),
});

// Endpoint to generate business names based on user input
app.post("/prGenerator", async (req, res) => {
  try {
    const { input } = req.body;

    // console.log("Sending data to API:", {
    //   category: category,
    //   keywords: keywords,
    //   length: length,
    // });

    // Construct prompt based on user input
    const prompt = `Generate a unique Press release with proper format on the topic ${input}`;

    // Call Google AI Platform Text-to-Text Generation API
    const response = await client.generateText({
      model: MODEL_NAME,
      prompt: {
        text: prompt,
      },
    });
console.log("response", response)
    // console.log("API Response: ", JSON.stringify(response, null, 2));
    let output = response[0].candidates[0].output;
    console.log(output);

    // // Assuming the names are separated by commas
    // const generatedNames = output.split("\n");

    // // Remove special characters from each name
    // const cleanedNames = generatedNames.map((name) =>
    //   name.replace(/[^a-zA-Z0-9 ]/g, "").trim()
    // );

    // // Remove any empty strings from the array
    // const filteredNames = cleanedNames.filter((name) => name !== "");

    // Send cleaned names array to frontend
    res.json(response[0].candidates[0].output);
  } catch (error) {
    console.error("Error generating business names:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating business names." });
  }
});

// const { createOrder, verifyPayment } = require('./razorpayFunctions');

// // Export the functions
// exports.createOrder = createOrder;
// exports.verifyPayment = verifyPayment;

app.post("/Orders",async(req,res)=>{
    const razorpay = new Razorpay({key_id:"rzp_test_tWEJGdo8KsLT7E",key_secret:"ZoooQA2XWr7LRSbC2uKPPMUp"});
    const {amount,currency}=req.body;

    const options={
        amount:amount,
        currency:currency,
        receipt:"receipt#1",
        payment_capture:1
    }

    try{
        const response = await razorpay.orders.create(options);
        console.log(response)
        res.json({order_id:response.id,currency:response.currency,amount:response.amount})

    }catch(error){
        console.log(error)
    }
})



// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.get("/",(req,res)=>{
  res.send("Welcome to Tools and payment Api");
})