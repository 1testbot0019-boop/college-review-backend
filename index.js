const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const app = express();

app.use(cors());
app.use(express.json());

// 1. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// 2. COLLEGE SCHEMA (Designed for Scale)
const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  city: { type: String, default: "India" },
  state: String,
  website: String,
  rank: { type: Number, default: 999 },
  fees: { type: String, default: "₹ 1.5L - 4L" },
  package: { type: String, default: "6.5 LPA" }
});

const College = mongoose.model("College", collegeSchema);

// 3. PAGINATED API (Fetches 20 colleges at a time)
app.get("/colleges", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const colleges = await College.find()
      .sort({ rank: 1 }) 
      .skip(skip)
      .limit(limit);

    const total = await College.countDocuments();

    res.json({
      colleges,
      totalCount: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. MASSIVE DATA IMPORT (Pulls thousands of Indian Colleges)
app.get("/import-now", async (req, res) => {
  try {
    const response = await axios.get("http://universities.hipolabs.com/search?country=India");
    const collegesData = response.data;

    const ops = collegesData.map((c, index) => ({
      updateOne: {
        filter: { name: c.name },
        update: { 
          $set: { 
            name: c.name, 
            city: c["state-province"] || "India", 
            website: c.web_pages[0],
            rank: index + 1
          } 
        },
        upsert: true
      }
    }));

    await College.bulkWrite(ops); // Efficiently saves thousands of records
    res.send(`<h1>Success!</h1><p>Imported ${collegesData.length} colleges.</p>`);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

app.get("/", (req, res) => res.send("College API is Live"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
