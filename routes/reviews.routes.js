const express = require("express");
const router = express.Router();

const Review = require("../models/Review.model");

// aquí todas las rutas de reviews

// POST "/reviews/:movieId/create" => recibir la info de una review y crearla en la base de datos
router.post("/:movieId/create", (req, res, next) => {
  const movieId = req.params.movieId;
  const { rating, comment } = req.body;
  console.log(req.session.activeUser);

  // validaciones de servidor(backend)

  //* que todos los campos tengan información(comentario y rating)

  if (comment === "" || rating === undefined) {
    req.session.errorMessage =
      "Los campos de comentario y rating han de estar rellenos";
    res.redirect(`/movies/${movieId}`);
    return;
  }

  //* validacion de comentario
  const commentRegex = /^[a-zA-Z0-9À-ÿ.,!?'"()\-_\s]{5,500}$/;
  if (commentRegex.test(comment) === false) {
    req.session.errorMessage =
      "El comentario ha de tener más de 5 caracteres y menos de 500";
    res.redirect(`/movies/${movieId}`);
    return;
  }

  Review.create({
    rating,
    comment: comment.trim(),
    user: req.session.activeUser._id,
    movieId,
  })
    .then(() => {
      res.redirect(`/movies/${movieId}`);
    })
    .catch((err) => {
      next(err);
    });
});

// POST "/reviews/:reviewId/edit" => recibir la info de una review y actualizarla en la BD
router.post("/:reviewId/edit", async (req, res, next) => {
  console.log(req.body);

  const { rating, comment } = req.body;
  const reviewId = req.params.reviewId;

  try {
    const searchReview = await Review.findById(reviewId);
    const movieId = searchReview.movieId

    // validaciones  servidor (backend)
    if (comment === "" || rating === undefined) {
      req.session.errorMessage =
        "Los campos de comentario y rating han de estar rellenos";
      res.redirect(`/movies/${movieId}`);
      return;
    }

    //* validacion de comentario
    const commentRegex = /^[a-zA-Z0-9À-ÿ.,!?'"()\-_\s]{5,500}$/;
    if (commentRegex.test(comment) === false) {
      req.session.errorMessage =
        "El comentario ha de tener más de 5 caracteres y menos de 500";
      res.redirect(`/movies/${movieId}`);
      return;
    }

    const review = await Review.findByIdAndUpdate(
      reviewId,
      {
        rating,
        comment,
      },
      { new: true }
    );

    // console.log(req.session.activeUser);
    // console.log(review);

    // console.log(review);
    res.redirect(`/movies/${review.movieId}`);
  } catch (err) {
    next(err);
  }
});

// POST "/reviews/:reviewId/delete"
router.post("/:reviewId/delete", async (req, res, next) => {
  const reviewId = req.params.reviewId;

  try {
    const review = await Review.findByIdAndDelete(reviewId);
    console.log(review);
    res.redirect(`/movies/${review.movieId}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
