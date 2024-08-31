const express = require("express");
const mongoose = require("mongoose");
const app = express();


app.set("view engine", "ejs");

app.use(express.json());

mongoose.connect("mongodb://localhost:27017/whatsapp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("Connected successfully");
  })
  .catch((err) => {
    console.log("Connection error", err);
  });

const messageSchema = new mongoose.Schema({
  text: String,
  sender: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model("Message", messageSchema);

app.get("/", (req, res) => {
  res.send("Welcome to WhatsApp backend!");
});

app.post("/sendMessage", async (req, res) => {
  const { text, sender } = req.body;
  
  if (!text || !sender) {
    return res.status(400).send("Text and sender are required.");
  }
  
  try {
    const newMessage = new Message({ text, sender });
    await newMessage.save();
    res.status(201).send("Message sent successfully!");
  } catch (err) {
    res.status(500).send("Error sending message");
  }
});


app.get("/getMessages", async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (err) {
    res.status(500).send("Error retrieving messages");
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
