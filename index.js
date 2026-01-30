const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const app = express();

app.use(cors()); // This allows your website to talk to your backend
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// College Model
const College = mongoose.model("College", new mongoose.Schema({
  name: String,
  city: { type: String, default: "India" },
  website: String
}));

// 1. Home Route
app.get("/", (req, res) => res.send("Backend is Ready!"));

// 2. THE FIX: Route to show all colleges (Fixes your URL error)
app.get("/colleges", async (req, res) => {
  try {
    const allColleges = await College.find();
    res.json(allColleges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Route to get a single college by ID
app.get("/college/:id", async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    res.json({ college, reviews: [] }); // Sending empty reviews for now
  } catch (err) {
    res.status(404).json({ error: "College not found" });
  }
});

// 4. Import Route (Run this once to fill data)
app.get("/import-now", async (req, res) => {
  try {
    const response = await axios.get("https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json");
    const indianColleges = response.data.filter(c => c.country === "India").slice(0, 20);
    for (let c of indianColleges) {
      await College.updateOne({ name: c.name }, { name: c.name, city: "India", website: c.web_pages[0] }, { upsert: true });
    }
    res.send("<h1>Success!</h1><p>Data imported.</p>");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

app.listen(process.env.PORT || 3000);
