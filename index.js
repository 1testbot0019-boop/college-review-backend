const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// 1. DATABASE CONNECTION
// We use process.env.MONGO_URI so your password stays safe in Render's Environment settings.
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Successfully connected to MongoDB"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

// 2. DATA MODELS (SCHEMAS)
const CollegeSchema = new mongoose.Schema({
  name: String,
  city: { type: String, default: "India" },
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

const ReviewSchema = new mongoose.Schema({
  collegeId: String,
  rating: Number,
  course: String,
  year: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});
const Review = mongoose.model("Review", ReviewSchema);

// 3. API ROUTES

// Home Route
app.get("/", (req, res) => {
  res.send("College Review API is Live and Running!");
});

// Get all colleges from your database
app.get("/colleges", async (req, res) => {
  try {
    const colleges = await College.find();
    res.json(colleges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single college and its reviews
app.get("/college/:id", async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    const reviews = await Review.find({ collegeId: req.params.id });
    res.json({ college, reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit a new review
app.post("/review", async (req, res) => {
  try {
    const { collegeId, rating, course, year, text } = req.body;
    
    // Save the review
    const review = new Review({ collegeId, rating, course, year, text });
    await review.save();

    // Update college star counts and total reviews
    const college = await College.findById(collegeId);
    college.totalReviews += 1;
    
    const starKeys = { 1: "one", 2: "two", 3: "three", 4: "four", 5: "five" };
    college.stars[starKeys[rating]] += 1;
    
    await college.save();
    res.json({ message: "Review added successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. THE AUTO-IMPORT ROUTE
// Visit https://your-app-name.onrender.com/import-now in your browser to fill your DB.
app.get("/import-now", async (req, res) => {
  try {
    // Fetching free college data from a public API
    const response = await axios.get("https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json");
    const indianColleges = response.data.filter(c => c.country === "India").slice(0, 100);

    for (let c of indianColleges) {
      // Use findOneAndUpdate to avoid creating duplicates if you run this twice
      await College.findOneAndUpdate(
        { name: c.name },
        { 
          name: c.name, 
          city: "India", 
          website: c.web_pages[0] || "N/A" 
        },
        { upsert: true, new: true }
      );
    }
    res.send(`🎉 Success! ${indianColleges.length} Indian colleges have been added to your database.`);
  } catch (err) {
    res.status(500).send("Import Error: " + err.message);
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
