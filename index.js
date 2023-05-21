require("dotenv").config();

const openAI = require("openai");
const { Configuration, OpenAIApi } = openAI;
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const PORT = process.env.PORT || 3001;
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Connect to MongoDB using Mongoose
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Define a schema for storing question and response data
const dataSchema = new mongoose.Schema({
  question: String,
  response: String,
});

// Create a model based on the schema
const Data = mongoose.model("Data", dataSchema);

// openai api key and organization config
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORGANIZATION,
});

const openai = new OpenAIApi(config);

app.post("/", async (req, res) => {
  const { message } = req.body;
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `You were developed and created by tushar a self taught developer. Pretend to be a personal tutor name Deep. give answer as teacher teach her students. 
      Answer: ${message}?`,
    max_tokens: 1000,
    temperature: 0.5,
  });

  console.log(response.data);
  if (response.data.choices[0].text) {
    const responseData = response.data.choices[0].text;

    // Create a new data document and save it to the database
    const newData = new Data({
      question: message,
      response: responseData,
    });
    await newData.save();

    res.json({ message: responseData });
  }
});

app.listen(PORT, () => {
  console.log(`post is running on port http://localhost:${PORT}`);
});
