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
    res.locals.activeUser = null
  } else {
    res.locals.isUserActive = true;
    res.locals.activeUser = req.session.activeUser
  }

  next();
}

function isAdmin (req,res,next) {
  if (req.session.ativeUser.role === "admin") {
    next() // continua con la ruta
  } else {
    res.redirect("/") // no tienes acceso
  }
}

module.exports = {
  isLoggedIn,
  updateLocals,
  isAdmin
};
