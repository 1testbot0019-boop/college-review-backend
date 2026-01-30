const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// College Data Schema
const College = mongoose.model("College", new mongoose.Schema({
  name: String,
  city: { type: String, default: "India" },
  website: String
}));

// Route 1: Home
app.get("/", (req, res) => res.send("Backend is Ready!"));

// Route 2: THE ONE YOU ARE TESTING (Fixes "Cannot GET /colleges")
app.get("/colleges", async (req, res) => {
  try {
    const data = await College.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route 3: Import data (Run this first!)
app.get("/import-now", async (req, res) => {
  try {
    const response = await axios.get("https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json");
    const indianColleges = response.data.filter(c => c.country === "India").slice(0, 20);
    for (let c of indianColleges) {
      await College.updateOne({ name: c.name }, { name: c.name, city: "India", website: c.web_pages[0] }, { upsert: true });
    }
    res.send("<h1>Success!</h1><p>Data imported. Now check /colleges</p>");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server Active"));
