const express = require("express");
const router = express.Router();

const Review = require("../models/Review.model");
const moviedb = require("../utils/tmdbApi");

// aquí todas las rutas de movies

// GET "/movies/:id" => renderiza los detalles de una película y sus reseñas
router.get("/:id", async (req, res, next) => {
  const movieId = req.params.id;

  try {  
    
    const details = await moviedb.movieInfo({ id: movieId, language: "es-ES" });
    const reviews = await Review.find({ movieId }).sort({createdAt: -1}).populate("user");

    console.log(details);

    // console.log(reviews);

    // lógica para mostrar o no mostrar botones de editar/borrar
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

    // console.log(mappedArr);

    

    const errorMessage = req.session.errorMessage
    req.session.errorMessage = null

    res.render("movies/details.hbs", { details, mappedArr, errorMessage });
  } catch (err) {
    
    next(err);
  }
});

module.exports = router;
