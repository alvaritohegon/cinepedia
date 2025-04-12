const express = require("express");
const router = express.Router();

const User = require("../models/User.model");
const List = require("../models/List.model");
const Review = require("../models/Review.model");
const addMovieDataToReviews = require("../utils/addMovieDataToReviews");

const { isLoggedIn, isAdmin } = require("../middlewares/auth.middlewares");

router.use(isLoggedIn, isAdmin);

// Aquí todas las rutas de admin

// GET "/admin/users" => renderiza todos los usuarios registrados
router.get("/users", async (req, res, next) => {
  try {
    const users = await User.find({
      _id: { $ne: req.session.activeUser._id },
    }).sort({ createdAt: -1 });

    res.render("admin/users.hbs", { users });
  } catch (err) {
    next(err);
  }
});

// POST "/admin/users/:userId/ban" => banea a un usuario en específico
router.post("/users/:userId/ban", async (req, res, next) => {
  const userID = req.params.userId;
  try {
    const user = await User.findById(userID);
    if (user.isBanned) {
      await User.findByIdAndUpdate(userID, {
        isBanned: false,
      });
    } else {
      await User.findByIdAndUpdate(userID, {
        isBanned: true,
      });
    }
    res.redirect("/admin/users");
  } catch (err) {
    next(err);
  }
});

// POST "/admin/users/:userId/delete" => borra un usuario en específico
router.post("/users/:userId/delete", async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    await List.deleteMany({ user: req.params.userId });
    await Review.deleteMany({ user: req.params.userId });
    res.redirect("/admin/users");
  } catch (err) {
    next(err);
  }
});

// GET "/admin/users/:userId/reviews" => renderiza todas las reviews de un usuario en específico
router.get("/users/:userId/reviews", async (req, res, next) => {
  try {
    const reviews = await Review.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("user");

    const mappedReviews = await addMovieDataToReviews(reviews);

    res.render("admin/user-review-list.hbs", { mappedReviews });
  } catch (err) {
    next(err);
  }
});

// GET "/admin/reviews" => renderiza todas las reseñas de la app
router.get("/reviews", async (req, res, next) => {
  const search = req.query.search;

  try {
    if (search) {
      const users = await User.find({ username: new RegExp(search, "i") });
      const usersIds = users.map((e) => e._id);

      console.log("buscando algo papito lindo");
      const searchReviews = await Review.find({
        $or: [
          { user: { $in: usersIds } },
          { comment: new RegExp(search, "i") },
        ],
      })
        .populate("user")
        .sort({ createdAt: -1 });

      const reviews = await addMovieDataToReviews(searchReviews);

      res.render("admin/search-reviews.hbs", { reviews });
    } else {
      const lastReviews = await Review.find()
        .populate("user")
        .sort({ createdAt: -1 })
        .limit(10);
      console.log(lastReviews);

      const reviews = await addMovieDataToReviews(lastReviews);

      res.render("admin/search-reviews.hbs", { reviews });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
