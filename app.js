const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const app = express();

app.set("view engine", "ejs");
app.use(express.json());

// Connect to MongoDB
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

// Message Schema
const messageSchema = new mongoose.Schema({
  text: { type: String, required: true },
  sender: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

// User Schema with password hashing
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

// Hash password before saving the user
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('User', userSchema);

// Routes
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

// Start server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
