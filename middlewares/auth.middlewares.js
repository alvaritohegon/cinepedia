const User = require("../models/User.model");

function isLoggedIn(req, res, next) {
  // middlewares para proteger rutas privadas.
  // solo se ejecuta en rutas que queremos que sean privadas.
  if (req.session.activeUser === undefined) {
    // el usuario no tiene sesión activa
    res.redirect("/");
  } else {
    next(); // continua con la ruta
  }
}

function updateLocals(req, res, next) {
  // esta funcion crea una variable accesible en HBS para visualizar enlaces dependiendode si el usuario está activo o no
  // se ejecuta en todas las llamadas

  res.locals.patata = "probando una nueva variable local";

  if (req.session.activeUser === undefined) {
    res.locals.isUserActive = false;
    res.locals.activeUser = null;
    res.locals.isAdmin = false;
  } else {
    res.locals.isUserActive = true;
    res.locals.activeUser = req.session.activeUser;
    res.locals.isAdmin = req.session.activeUser.role === "admin";
  }

  next();
}

function isAdmin(req, res, next) {
  if (req.session.activeUser.role === "admin") {
    next(); // continua con la ruta
  } else {
    res.redirect("/"); // no tienes acceso
  }
}

async function isBanned(req, res, next) {
  const sessionUser = req.session.activeUser;

  if (!sessionUser) {
    res.redirect("/");
    return;
  }

  const user = await User.findById(sessionUser._id);

  if (!user) {
    // Por si el usuario fue borrado o no se encuentra en la base de datos
    return res.redirect("/");
  }

  if (user.isBanned === false) {
    next();
  } else {
    // esta línea borra la sesión activa del usuario
    req.session.destroy(() => {
      res.redirect("/");
    });
  }
}

module.exports = {
  isLoggedIn,
  updateLocals,
  isAdmin,
  isBanned,
};
