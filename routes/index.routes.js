const express = require("express");
const router = express.Router();

// configuracion API
const moviedb = require("../utils/tmdbApi");

/* GET home page */
router.get("/", (req, res, next) => {
  console.log(req.session.activeUser);
  moviedb
    .movieNowPlaying({ language: "es-EN" })
    .then((movies) => {
      res.render("index.hbs", { movies: movies.results });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
