const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const app = express();

app.use(cors());
app.use(express.json());

// Connect with a 30-second timeout to prevent that buffering error
mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 30000 })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

const College = mongoose.model("College", new mongoose.Schema({
  name: String,
  city: { type: String, default: "India" },
  website: String
}));

app.get("/", (req, res) => res.send("Backend is Ready!"));

// Faster import route
app.get("/import-now", async (req, res) => {
  try {
    const response = await axios.get("https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json");
    const indianColleges = response.data.filter(c => c.country === "India").slice(0, 20); // Just 20 to start

    for (let c of indianColleges) {
      await College.updateOne({ name: c.name }, { name: c.name, city: "India", website: c.web_pages[0] }, { upsert: true });
    }
    res.send("<h1>🎉 Success!</h1><p>Initial colleges added. Check your site!</p>");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

app.listen(process.env.PORT || 3000);
