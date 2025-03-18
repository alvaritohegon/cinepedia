const express = require("express");
const router = express.Router();

// configuracion API
const moviedb = require("../utils/tmdbApi");

/* GET home page */
router.get("/", (req, res, next) => {
  moviedb
    .movieNowPlaying({ language: "es-EN" })
    .then((movies) => {
      // const map = movies.results.map((elem) => {
      //   return elem.id.toString()
      // })

      // console.log(map);

      res.render("index.hbs", { movies: movies.results });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
