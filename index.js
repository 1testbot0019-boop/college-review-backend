const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB using the variable we just set in Render
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// Database Model
const College = mongoose.model("College", new mongoose.Schema({
  name: String,
  city: { type: String, default: "India" },
  website: String,
  totalReviews: { type: Number, default: 0 },
  stars: { one: 0, two: 0, three: 0, four: 0, five: 0 }
}));

// Routes
app.get("/", (req, res) => res.send("API is Live!"));

// This is the route you were trying to visit
app.get("/import-now", async (req, res) => {
  try {
    const response = await axios.get("https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json");
    const indianColleges = response.data.filter(c => c.country === "India").slice(0, 100);

    for (let c of indianColleges) {
      await College.updateOne(
        { name: c.name },
        { $set: { name: c.name, city: "India", website: c.web_pages[0] } },
        { upsert: true }
      );
    }
    res.send("🎉 Success! 100 Colleges added to your database.");
  } catch (err) {
    res.status(500).send("Import Error: " + err.message);
  }
});

app.get("/colleges", async (req, res) => {
  const colleges = await College.find();
  res.json(colleges);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
