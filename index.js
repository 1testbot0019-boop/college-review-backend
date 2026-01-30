const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios"); // Added for the import feature
const app = express();

app.use(cors());
app.use(express.json());

// 1. CONNECTION (Uses the variable you set in Render)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => cconst express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios"); // Added for the import feature
const app = express();

app.use(cors());
app.use(express.json());

// 1. CONNECTION (Uses the variable you set in Render)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ Connection Error:", err));

// 2. COLLEGE SCHEMA
const CollegeSchema = new mongoose.Schema({
  name: String,
  city: String,
  website: String,
  totalReviews: { type: Number, default: 0 },
  stars: {
    one: { type: Number, default: 0 },
    two: { type: Number, default: 0 },
    three: { type: Number, default: 0 },
    four: { type: Number, default: 0 },
    five: { type: Number, default: 0 }
  }
});
const College = mongoose.model("College", CollegeSchema);

// 3. REVIEW SCHEMA
const ReviewSchema = new mongoose.Schema({
  collegeId: String,
  rating: Number,
  course: String,
  year: String,
  text: String
});
const Review = mongoose.model("Review", ReviewSchema);

// --- ROUTES ---

app.get("/", (req, res) => res.send("College API is Running!"));

// Get all colleges
app.get("/colleges", async (req, res) => {
  const colleges = await College.find();
  res.json(colleges);
});

// Add a single college
app.post("/add-college", async (req, res) => {
  const college = new College(req.body);
  await college.save();
  res.json({ message: "College added" });
});

// Submit a review
app.post("/review", async (req, res) => {
  const { collegeId, rating, course, year, text } = req.body;
  const review = new Review({ collegeId, rating, course, year, text });
  await review.save();

  const college = await College.findById(collegeId);
  college.totalReviews += 1;
  const starMap = { 1: "one", 2: "two", 3: "three", 4: "four", 5: "five" };
  college.stars[starMap[rating]] += 1;
  await college.save();
  res.json({ message: "Review added" });
});

// --- THE "MAGIC" IMPORT ROUTE ---
// Visit YOUR_URL/import-now in your browser to fill your database!
app.get("/import-now", async (req, res) => {
  try {
    const response = await axios.get("https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json");
    const indianColleges = response.data.filter(c => c.country === "India").slice(0, 100); // Takes first 100 for speed

    for (let c of indianColleges) {
      await College.create({
        name: c.name,
        city: "India",
        website: c.web_pages[0]
      });
    }
    res.send(`Successfully imported ${indianColleges.length} colleges!`);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server active"));onsole.log("❌ Connection Error:", err));

// 2. COLLEGE SCHEMA
const CollegeSchema = new mongoose.Schema({
  name: String,
  city: String,
  website: String,
  totalReviews: { type: Number, default: 0 },
  stars: {
    one: { type: Number, default: 0 },
    two: { type: Number, default: 0 },
    three: { type: Number, default: 0 },
    four: { type: Number, default: 0 },
    five: { type: Number, default: 0 }
  }
});
const College = mongoose.model("College", CollegeSchema);

// 3. REVIEW SCHEMA
const ReviewSchema = new mongoose.Schema({
  collegeId: String,
  rating: Number,
  course: String,
  year: String,
  text: String
});
const Review = mongoose.model("Review", ReviewSchema);

// --- ROUTES ---

app.get("/", (req, res) => res.send("College API is Running!"));

// Get all colleges
app.get("/colleges", async (req, res) => {
  const colleges = await College.find();
  res.json(colleges);
});

// Add a single college
app.post("/add-college", async (req, res) => {
  const college = new College(req.body);
  await college.save();
  res.json({ message: "College added" });
});

// Submit a review
app.post("/review", async (req, res) => {
  const { collegeId, rating, course, year, text } = req.body;
  const review = new Review({ collegeId, rating, course, year, text });
  await review.save();

  const college = await College.findById(collegeId);
  college.totalReviews += 1;
  const starMap = { 1: "one", 2: "two", 3: "three", 4: "four", 5: "five" };
  college.stars[starMap[rating]] += 1;
  await college.save();
  res.json({ message: "Review added" });
});

// --- THE "MAGIC" IMPORT ROUTE ---
// Visit YOUR_URL/import-now in your browser to fill your database!
app.get("/import-now", async (req, res) => {
  try {
    const response = await axios.get("https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json");
    const indianColleges = response.data.filter(c => c.country === "India").slice(0, 100); // Takes first 100 for speed

    for (let c of indianColleges) {
      await College.create({
        name: c.name,
        city: "India",
        website: c.web_pages[0]
      });
    }
    res.send(`Successfully imported ${indianColleges.length} colleges!`);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server active"));

