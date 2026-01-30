const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const app = express();

app.use(cors());
app.use(express.json());

// Fixed connection settings to prevent buffering timeouts
mongoose.connect(process.env.MONGO_URI, { 
    serverSelectionTimeoutMS: 30000 // Gives MongoDB 30 seconds to respond
})
.then(() => console.log("✅ MongoDB Connected Successfully"))
.catch(err => console.log("❌ Connection Error:", err.message));

const College = mongoose.model("College", new mongoose.Schema({
  name: String,
  city: { type: String, default: "India" },
  website: String
}));

app.get("/", (req, res) => res.send("Backend is Ready!"));

// The route that will fill your site with data
app.get("/import-now", async (req, res) => {
  try {
    const response = await axios.get("https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json");
    const indianColleges = response.data.filter(c => c.country === "India").slice(0, 20);

    for (let c of indianColleges) {
      await College.updateOne(
        { name: c.name },
        { $set: { name: c.name, city: "India", website: c.web_pages[0] } },
        { upsert: true }
      );
    }
    res.send("<h1>🎉 Success!</h1><p>20 Indian colleges added to your database.</p>");
  } catch (err) {
    res.status(500).send("Import Error: " + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
