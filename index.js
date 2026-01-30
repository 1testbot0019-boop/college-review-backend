const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// College schema
const collegeSchema = new mongoose.Schema({
  name: String,
  city: String,
  state: String,
  totalReviews: {
    type: Number,
    default: 0
  },
  stars: {
    one: { type: Number, default: 0 },
    two: { type: Number, default: 0 },
    three: { type: Number, default: 0 },
    four: { type: Number, default: 0 },
    five: { type: Number, default: 0 }
  }
});


// Review schema
const ReviewSchema = new mongoose.Schema({
  collegeId: String,
  rating: Number,
  course: String,
  year: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const Review = mongoose.model("Review", ReviewSchema);

// Add college (one-time use)
app.post("/add-college", async (req, res) => {
  const college = new College(req.body);
  await college.save();
  res.json({ message: "College added" });
});

// Get all colleges
app.get("/colleges", async (req, res) => {
  const colleges = await College.find();
  res.json(colleges);
});

// Get single college + reviews
app.get("/college/:id", async (req, res) => {
  const college = await College.findById(req.params.id);
  const reviews = await Review.find({ collegeId: req.params.id });
  res.json({ college, reviews });
});

// Submit review
app.post("/review", async (req, res) => {
  const { collegeId, rating, course, year, text } = req.body;

  const review = new Review({ collegeId, rating, course, year, text });
  await review.save();

  const college = await College.findById(collegeId);
  college.totalReviews += 1;

  if (rating === 1) college.stars.one++;
  if (rating === 2) college.stars.two++;
  if (rating === 3) college.stars.three++;
  if (rating === 4) college.stars.four++;
  if (rating === 5) college.stars.five++;

  await college.save();
  res.json({ message: "Review added" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));

// Api
import fetch from "node-fetch"; // add at top if not present

app.get("/import-colleges", async (req, res) => {
  let page = Number(req.query.page || 1);
  let limit = 100;

  const apiUrl = `https://colleges-api.onrender.com/colleges?limit=${limit}&page=${page}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    let added = 0;

    for (let c of data.colleges) {
      const exists = await College.findOne({ name: c.Name });
      if (!exists) {
        await College.create({
          name: c.Name,
          city: c.City || "Unknown",
          state: c.State || "Unknown"
        });
        added++;
      }
    }

    res.json({
      message: "Import completed",
      page: page,
      collegesAdded: added
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// BULK ADD COLLEGES (For Final Stage)
app.post("/bulk-add-colleges", async (req, res) => {
  try {
    const colleges = req.body; // Expecting an array of college objects
    await College.insertMany(colleges);
    res.json({ message: `${colleges.length} Colleges added successfully!` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


