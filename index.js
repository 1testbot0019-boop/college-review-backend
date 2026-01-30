const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const app = express();

app.use(cors());
app.use(express.json());

// 1. DB CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// 2. SCHEMA
const College = mongoose.model("College", new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  city: { type: String, default: "India" },
  state: String,
  website: String,
  rank: { type: Number, default: 999 },
  fees: { type: String, default: "₹ 2.5L - 5L" },
  package: { type: String, default: "8.5 LPA" }
}));

// 3. FIX: Paginated Route for 1 Lakh+ Colleges
app.get("/colleges", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    
    // Support for location filtering from sidebar
    let query = {};
    if (req.query.location) {
        query.city = { $regex: req.query.location, $options: "i" };
    }

    const colleges = await College.find(query).sort({ rank: 1 }).skip(skip).limit(limit);
    const total = await College.countDocuments(query);

    res.json({ colleges, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. IMPORT DATA (Visit /import-now after deploying)
app.get("/import-now", async (req, res) => {
  try {
    const response = await axios.get("http://universities.hipolabs.com/search?country=India");
    const ops = response.data.map((c, i) => ({
      updateOne: {
        filter: { name: c.name },
        update: { $set: { name: c.name, city: c["state-province"] || "India", website: c.web_pages[0], rank: i + 1 }},
        upsert: true
      }
    }));
    await College.bulkWrite(ops);
    res.send("<h1>Success!</h1><p>Data imported.</p>");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get("/", (req, res) => res.send("API is Live"));
app.listen(process.env.PORT || 3000);
