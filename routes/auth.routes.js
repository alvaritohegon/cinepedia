const express = require("express");
const router = express.Router();

const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const transporter = require("../utils/nodemailer");

// Aquí todas las rutas de autenticación

// GET "/auth/signup" => renderizar un formulario de registro
router.get("/signup", (req, res, next) => {
  res.render("auth/signup.hbs");
});

// POST "/auth/signup" => recibir la info del usuario y crearlo en la BD
router.post("/signup", async (req, res, next) => {
  console.log(req.body);
  // Validaciones de servidor (backend)
  const { username, email, password } = req.body;

  // Que todos los campos no estén vacíos
  if (username === "" || email === "" || password === "") {
    res.render("auth/signup.hbs", {
      errorMessage: "Todos los campos son obligatorios",
      previusValues: req.body,
    });
    return; // Cuando esto ocurra deten la ejecución de la ruta para que no siga ejecutando código
  }

  // Validacion de contraseñas
  const regexPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;

  if (regexPattern.test(password) === false) {
    res.render("auth/signup.hbs", {
      errorMessage: "La contraseña no es lo suficientemente fuerte",
      previusValues: req.body,
    });
    return;
  }

  // validacion de email
  const regexPatternEmail =
    /^[a-zA-Z0-9][a-z0-9!#$%&'*+/=?^_`{|}~-]*(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.[a-z]{2,}$/;

  if (regexPatternEmail.test(email) === false) {
    res.render("auth/signup.hbs", {
      errorMessage: "El email no tiene un formato válido",
      previusValues: req.body,
    });
    return;
  }

  // validacion de usuario
  const usernameRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9_]{3,20}$/;
  if (usernameRegex.test(username) === false) {
    res.render("auth/signup.hbs", {
      errorMessage: "El usuario no tiene un formato válido",
      previusValues: req.body,
    });
  }

  try {
    // que no existan usuarios con el mismo correo electrónico o usuario
    const foundUser = await User.findOne({ $or: [{ username }, { email }] });

    if (foundUser !== null) {
      let errorMessage = "";

      if (foundUser.email === email) {
        errorMessage = "Ya existe un usuario con ese email";
      } else if (foundUser.username === username) {
        errorMessage = "Ya existe un usuario con ese nombre de usuario";
      }
      res.render("auth/signup.hbs", {
        errorMessage,
        previusValues: req.body,
      });
      return;
    }

    // vamos a encriptar la contraseña
    const salt = await bcrypt.genSalt(12);
    const hashPassword = await bcrypt.hash(password, salt);

    console.log(hashPassword);

    // crear código de confirmación
    const characters =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let token = "";
    for (let i = 0; i < 25; i++) {
      token += characters[Math.floor(Math.random() * characters.length)];
    }

    const newUser = await User.create({
      username,
      email,
      password: hashPassword,
      confirmationCode: token,
    });

    await transporter.sendMail({
      from: `"Cinepedia 📽️" <${process.env.EMAIL}>`,
      to: newUser.email,
      subject: "Confirma tu cuenta de Cinepedia",
      html: `<p>Haz clic en el siguiente enlace para activar tu cuenta:</p>
             <a href="${process.env.BASE_URL}/confirm/${newUser.confirmationCode}">Confirmar cuenta</a>`,
    });

    // TEST
    res.redirect("/auth/login");

    // vamos a encriptar la contraseña
  } catch (err) {
    next(err);
  }
});

// GET "/auth/confirm/:confirmCode" => ruta para confirmar el correo
router.get("/confirm/:confirmCode", async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { confirmationCode: req.params.confirmCode },
      {
        status: "Active",
      }
    );

    if (!user) {
      return res.render("auth/confirmation.hbs", { error: true });
    }

    res.render("auth/confirmation.hbs", { user });
  } catch (err) {
    next(err);
  }
});

// GET "/auth/login" => renderizar el formulario de acceso a la página
router.get("/login", (req, res, next) => {
  res.render("auth/login.hbs");
});

// POST "/auth/login" => recibir las credenciales del usuario y validar su identidad(aquí finalizaría el proceso de autenticación)
router.post("/login", async (req, res, next) => {
  console.log(req.body);
  const { identifier, password } = req.body;

  // validacion que todos los campos estén llenos
  if (identifier === "" || password === "") {
    res.render("auth/login.hbs", {
      errorMessage: "Todos los campos son obligatorios",
    });
    return;
  }

  try {
    // validación que el usuario existe en la base de datos
    const foundUser = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });
    console.log(foundUser);

    // comprobar si el usuario está baneado o no
    if (foundUser.isBanned) {
      res.render("auth/login.hbs", {
        errorMessage: "Usuario BANEADO",
      });
      return;
    }

    if (foundUser === null) {
      res.render("auth/login.hbs", {
        errorMessage: "Usuario o correo no registrado",
      });
      return;
    }

    // validar que la contraseña sea la correcta
    const response = await bcrypt.compare(password, foundUser.password);

    if (response === false) {
      res.render("auth/login.hbs", {
        errorMessage: "La contraseña no coincide",
      });
      return;
    }

    if (foundUser.status !== "Active") {
      // console.log("el usuario está sin confirmar");
      res.render("auth/login.hbs", {
        errorMessage:
          "El usuario no ha verificado su correo todavía para Iniciar Sesión",
      });
      return;
    }

    // a partir de este punta ya hemos autenticado al usuario
    // 1. Crear una sesión activa del usuario
    // 2. constantemente verificar en las rutas privadas que el usuario tenga dicha sesión activa

    // CREAR LA SESIÓN
    req.session.activeUser = foundUser; // se crea la sesión,
    // A partir de este momento tendremos acceso a req.session.activeUser para saber quien está haciendo las llamadas al servidor

    req.session.save(() => {
      // despues de que la sesión se crea correctamente, entonces redirije a otra página
      res.redirect("/");
    });
  } catch (err) {
    next(err);
  }
});

// GET "/auth/logout" => cerrar (destruir) la sesión activa
router.get("/logout", (req, res, next) => {
  // esta línea borra la sesión activa del usuario
  req.session.destroy(() => {
    // que ocurre luego de borrar la sesión
    res.redirect("/");
  });
});

module.exports = router;
