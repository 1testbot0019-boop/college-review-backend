const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

const College = mongoose.model("College", new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  city: { type: String, default: "India" },
  state: String,
  course: { type: String, default: "B.Tech" },
  rank: { type: Number, default: 999 },
  fees: { type: String, default: "₹ 1.5L - 3L" },
  package: { type: String, default: "7 LPA" }
}));

// API for your Web App
app.get("/colleges", async (req, res) => {
  try {
    const { page = 1, course, search } = req.query;
    let query = {};
    if (course && course !== "All") query.course = course;
    if (search) query.name = { $regex: search, $options: "i" };

    const colleges = await College.find(query)
      .sort({ rank: 1 })
      .skip((page - 1) * 15)
      .limit(15);
      
    res.json({ colleges });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// IMPORT DATA FROM GITHUB REPO
app.get("/import-now", async (req, res) => {
  try {
    // Getting data from the Clueless-Community repo
    const url = "https://raw.githubusercontent.com/Clueless-Community/collegeAPI/main/index.json";
    const response = await axios.get(url);
    const rawData = response.data; // This is an array of college objects

    const courses = ["B.Tech", "MBA", "MBBS", "BCA", "B.Com", "B.Sc"];

    const ops = rawData.map((c, i) => ({
      updateOne: {
        filter: { name: c.name },
        update: { $set: { 
            name: c.name, 
            city: c.city || "India", 
            state: c.state || "",
            rank: i + 1,
            course: courses[Math.floor(Math.random() * courses.length)] // Adding random course for filter
        }},
        upsert: true
      }
    }));

    await College.bulkWrite(ops);
    res.send(`<h1>Success!</h1><p>Imported ${rawData.length} colleges from GitHub API.</p>`);
  } catch (err) {
    res.status(500).send("Import Failed: " + err.message);
  }
});

app.listen(process.env.PORT || 3000);
