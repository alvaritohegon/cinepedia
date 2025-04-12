const express = require("express");
const router = express.Router();

const List = require("../models/List.model");
const moviedb = require("../utils/tmdbApi");

const { isLoggedIn, isBanned } = require("../middlewares/auth.middlewares");
const capitalize = require("../utils/capitalize");

// GET "/lists" => renderiza todas las listas del usuario.
router.get("/", isLoggedIn, isBanned, async (req, res, next) => {
  const userID = req.session.activeUser._id;
  try {
    const lists = await List.find({ user: userID });

    console.log(lists);

    res.render("lists/all.hbs", { lists });
  } catch (err) {
    next(err);
  }
});

// POST "/create" => crea una nueva lista en la BD
router.post("/create", isLoggedIn, isBanned, async (req, res, next) => {
  try {
    if (req.body.name.length < 4 || req.body.name.length > 20) {
      res.render("lists/all.hbs", {
        errorMessage:
          "El nombre tiene que tener más de 4 y menos de 20 caracteres",
        lists: await List.find({ user: req.session.activeUser._id }),
      });
      return;
    }

    const foundList = await List.findOne({
      name: capitalize(req.body.name),
      user: req.session.activeUser._id,
    });

    if (foundList !== null) {
      res.render("lists/all.hbs", {
        errorMessage: "Ya existe una lista con ese nombre",
        lists: await List.find({ user: req.session.activeUser._id }),
      });
      return;
    }

    await List.create({
      name: capitalize(req.body.name),
      user: req.session.activeUser._id,
      movies: [],
    });

    res.redirect("/lists");
  } catch (err) {
    next(err);
  }
});

// GET "/lists/:listId" => renderiza todas las películas de una lista en específico
router.get("/:listId", isLoggedIn, isBanned, async (req, res, next) => {
  const listID = req.params.listId;

  try {
    const moviesIDs = await List.findById(listID);
    console.log(moviesIDs);

    const movies = await Promise.all(
      moviesIDs.movies.map(
        async (id) => await moviedb.movieInfo({ id, language: "es-ES" })
      )
    );

    res.render("lists/details.hbs", { movies, moviesIDs });
  } catch (err) {
    next(err);
  }
});

// POST "/lists/add/:movieId" => añade una película en específico a una lista en específico
router.post("/add/:movieId", isLoggedIn, isBanned, async (req, res, next) => {
  const { list } = req.body;
  const movieID = req.params.movieId;

  try {
    await List.findByIdAndUpdate(list, {
      $addToSet: { movies: movieID },
    });

    res.redirect(`/movies/${movieID}`);
  } catch (err) {
    next(err);
  }
});

// POST "/lists/:listId/remove/:movieId" => elimina una película en específico de una lista en específico
router.post(
  "/:listId/remove/:movieId",
  isLoggedIn,
  isBanned,
  async (req, res, next) => {
    const movieID = req.params.movieId;
    const listID = req.params.listId;

    try {
      await List.findByIdAndUpdate(listID, {
        $pull: { movies: movieID },
      });
      res.redirect(`/lists/${listID}`);
    } catch (err) {
      next(err);
    }
  }
);

// POST "/lists/:listId/edit" =>edita una lista en específico
router.post("/:listId/edit", isLoggedIn, isBanned, async (req, res, next) => {
  const { name } = req.body;

  if (req.body.name.length < 4 || req.body.name.length > 20) {
    console.log("el nombre tiene que cumplir con lo establecido");
    res.render("lists/all.hbs", {
      errorMessage:
        "El nombre tiene que tener más de 4y menos de 20 caracteres",
      lists: await List.find({ user: req.session.activeUser._id }),
    });
    return;
  }

  try {
    await List.findByIdAndUpdate(req.params.listId, { name });
    res.redirect("/lists");
  } catch (err) {
    next(err);
  }
});

// POST "/lists/:listId/delete" => elimina una lista en específico
router.post("/:listId/delete", isLoggedIn, isBanned, async (req, res, next) => {
  const listID = req.params.listId;
  try {
    await List.findByIdAndDelete(listID);
    res.redirect("/lists");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
