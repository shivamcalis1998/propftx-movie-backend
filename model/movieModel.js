const mongoose = require("mongoose");

const movieSchema = mongoose.Schema({
  title: { type: String, required: true },
  director: { type: String, required: true },
  language: { type: String, required: true },
  rating: { type: Number, required: true },
  image: { type: String, required: true },
  createdAt: { type: String, default: Date.now },
});

const movieModel = mongoose.model("moviesA", movieSchema);

module.exports = movieModel;
