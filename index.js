const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const app = express();

app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// College Data Model
const College = mongoose.model("College", new mongoose.Schema({
  name: String,
  city: { type: String, default: "India" },
  website: String
}));

// Home page
app.get("/", (req, res) => res.send("Server is running!"));

// THE FIX: This route handles the /import-now request
app.get("/import-now", async (req, res) => {
  try {
    const response = await axios.get("https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json");
    const indianColleges = response.data.filter(c => c.country === "India").slice(0, 50);

    for (let c of indianColleges) {
      await College.updateOne(
        { name: c.name },
        { $set: { name: c.name, city: "India", website: c.web_pages[0] } },
        { upsert: true }
      );
    }
    res.send("<h1>Success!</h1><p>50 Colleges added to your database.</p>");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server Active"));
