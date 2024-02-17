const express = require("express");
const movieModel = require("../model/movieModel.js");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
dotenv.config();

const movieRoute = express.Router();

const authenticated = (req, res, next) => {
  const token = req.headers.authentication;

  if (!token) {
    return res.status(401).json({ error: "unathenticated user" });
  }

  const decode = jwt.verify(token, process.env.SECRET_KEY);

  req.user = decode.user;

  next();
};

const roleCheck = (req, res, next) => {
  if (req.user.role != "CREATOR") {
    return res.status(401).json({ error: "unathenticated" });
  }
  next();
};

movieRoute.post("/", authenticated, roleCheck, async (req, res) => {
  try {
    const { title, director, language, rating, image } = req.body;

    const newMovie = {
      title,
      director,
      language,
      rating,
      image,
      userId: req.user._id,
    };

    const movie = new movieModel(newMovie);
    await movie.save();

    res.status(201).json({
      message: "movie created successfully",
      movie,
    });
  } catch (error) {
    res.status(500).json({ error: "something is wrong" });
  }
});

movieRoute.get("/", authenticated, async (req, res) => {
  try {
    let query = {};
    const { language, sort, page, limit, search } = req.query;
    const skip = (page - 1) * limit;
    if (language) {
      query.language = language;
    }
    let sortOption = { createdAt: -1 };

    if (sort === "asc") {
      sortOption = { createdAt: 1 };
    } else if (sort === "rating_asc") {
      sortOption = { rating: 1 };
    } else if (sort === "rating_desc") {
      sortOption = { rating: -1 };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { director: { $regex: search, $options: "i" } },
      ];
    }

    const movie = await movieModel
      .find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total_document = await movieModel.countDocuments(query);
    const totalPages = Math.ceil(total_document / limit);
    res.status(200).json({ movie, totalPages });
  } catch (error) {
    res.status(404).json({ error: "there is no data with this movie" });
  }
});

movieRoute.put("/:id", authenticated, roleCheck, async (req, res) => {
  try {
    const { title, director, language, rating, image } = req.body;
    const { id } = req.params;

    const updateMovie = await movieModel.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { title, director, language, rating, image },
      { new: true }
    );

    if (!updateMovie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    res
      .status(200)
      .json({ message: "Movie updated successfully", movie: updateMovie });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

movieRoute.delete("/:id", authenticated, roleCheck, async (req, res) => {
  try {
    const { id } = req.params;

    const deleteMovie = await movieModel.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!deleteMovie) {
      return res.status(404).json({ error: "movie not found" });
    }

    res
      .status(200)
      .json({ message: "movie deleted successfully", book: deleteMovie });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = movieRoute;
