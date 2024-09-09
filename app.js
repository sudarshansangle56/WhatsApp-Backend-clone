const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const app = express();
//set view engine 
app.set("view engine", "ejs");
//middleware 
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

// Register a new user
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).send("All fields are required");
  }

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).send("User already exists");
    }

    // Save new user
    user = new User({ name, email, password });
    await user.save();
    res.status(201).send("User registered successfully");
  } catch (err) {
    res.status(500).send("Error registering user");
  }
});

// User login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid credentials");
    }

    res.status(200).send("Login successful");
  } catch (err) {
    res.status(500).send("Error logging in");
  }
});

// Send a message
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

// Get all messages
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
