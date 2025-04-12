const express = require("express");
const router = express.Router();

const Review = require("../models/Review.model");
const List = require("../models/List.model");
const moviedb = require("../utils/tmdbApi");

// Aquí todas las rutas de movies

// GET "/movies/search" => mostrar todas las películas asociadas a ese nombre
router.get("/search", async (req, res, next) => {
  console.log(req.query.filmName);
  const filmName = req.query.filmName;

  try {
    const searchResults = await moviedb.searchMovie({
      query: filmName,
      language: "es-ES",
    });
    console.log(searchResults);

    if (!searchResults.results.length) {
      res.render("movies/search-results", {
        errorMessage: "No se ha encontrado nada, prueba con otro nombre",
      });
      return;
    }

    res.render("movies/search-results", {
      movies: searchResults.results,
      filmName,
    });
  } catch (err) {
    next(err);
  }
});

// GET "/movies/:id" => renderiza los detalles de una película y sus reseñas
router.get("/:id", async (req, res, next) => {
  const movieId = req.params.id;

  try {
    const details = await moviedb.movieInfo({ id: movieId, language: "es-ES" });
    const reviews = await Review.find({ movieId })
      .sort({ createdAt: -1 })
      .populate("user");

    let lists = [];
    if (res.locals.isUserActive) {
      const allLists = await List.find({ user: req.session.activeUser._id });
      lists = allLists.filter((list) => {
        return !list.movies.includes(movieId);
      });
    }

    console.log(details);

    // Lógica para mostrar o no mostrar botones de editar/borrar
    const mappedArr = reviews.map(({ _id, movieId, rating, comment, user }) => {
      let isOwner = false; // Por defecto, nadie es dueño de la reseña

      if (req.session.activeUser) {
        // Convertimos ambos IDs a String para que la comparación sea válida
        if (req.session.activeUser._id === user._id.toString()) {
          isOwner = true;
        }
      }
      return {
        _id,
        movieId,
        rating,
        comment,
        user,
        isOwner,
      };
    });

    const errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;

    res.render("movies/details.hbs", {
      details,
      mappedArr,
      lists,
      errorMessage,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
