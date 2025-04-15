const express = require("express");
const router = express.Router();

const User = require("../models/User.model");
const Review = require("../models/Review.model");
const uploader = require("../middlewares/uploader");
const addMovieDataToReviews = require("../utils/addMovieDataToReviews");

const { isLoggedIn, isBanned } = require("../middlewares/auth.middlewares");

// Aquí van a ir las rutas de usuario, que son privadas (solo accesible a usuarios)

// GET "/profile" => renderiza el PERFIL de usuario
router.get("/", isLoggedIn, isBanned, (req, res, next) => {
  console.log("quien me hace la llamada", req.session.activeUser);

  User.findById(req.session.activeUser._id)
    .then((user) => {
      res.render("profile/user-dashboard.hbs", { user });
    })
    .catch((err) => {
      next(err);
    });
});

// POST "/profile/edit" => actualiza la imagen de perfil
router.post(
  "/edit",
  isLoggedIn,
  isBanned,
  uploader.single("perfilImage"),
  (req, res, next) => {
    console.log(req.body);
    console.log(req.file);

    const { currentPerfilImage } = req.body;

    let updatedCoverImage = currentPerfilImage;

    if (req.file) {
      // Si se sube una nueva imagen, usa esa imagen
      updatedCoverImage = req.file.path;
    }

    User.findByIdAndUpdate(
      req.session.activeUser._id,
      {
        perfilImage: updatedCoverImage,
      },
      { new: true }
    )
      .then((user) => {
        res.redirect("/profile");
      })
      .catch((err) => {
        next(err);
      });
  }
);

// GET "/profile/reviews" => renderiza una página para listar todas las reseñas del usuario
router.get("/reviews", isLoggedIn, isBanned, async (req, res, next) => {
  const userId = req.session.activeUser._id;
  try {
    const reviews = await Review.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user");

    const mappedReviews = await addMovieDataToReviews(reviews);

    res.render("profile/review-list.hbs", { mappedReviews });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
