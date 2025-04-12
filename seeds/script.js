// este archivo inizializará mi base de datos con una data inicial
// este proceso solo ocurre una vez
// este código no se conecta con el servidor

// requerimos nuestros modelos
const User = require("../models/User.model");
const Review = require("../models/Review.model");
// requerimos la libreria fakerES para generar datos falsos
const { fakerES } = require("@faker-js/faker");

// debemos conectar con la base datos
const mongoose = require("mongoose");
require("../db/index");

async function seedDatabase() {
  try {
    // Eliminar datos previos para evitar duplicados
    await User.deleteMany();
    await Review.deleteMany();

    console.log("Usuarios y reseñas eliminados. Creando nuevos datos...");

    // Crear 5 usuarios falsos
    const users = [];

    for (let i = 0; i < 5; i++) {
      const characters =
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let token = "";
      for (let i = 0; i < 25; i++) {
        token += characters[Math.floor(Math.random() * characters.length)];
      }
      const newUser = await User.create({
        username: fakerES.internet.username(),
        email: fakerES.internet.email(),
        password: fakerES.internet.password(10), // No necesitas encriptar en los seeds
        perfilImage: fakerES.image.avatar(),
        confirmationCode: token,
      });
      users.push(newUser);
    }

    console.log("Usuarios creados:", users);

    // Crear reseñas para películas
    const movieIds = [
      "950396",
      "1126166",
      "1084199",
      "823219",
      "822119",
      "549509",
      "1064213",
      "1160956",
      "933260",
      "402431",
      "774370",
      "974576",
      "1064486",
      "1249289",
      "1201012",
      "1294203",
      "1184918",
      "696506",
      "426063",
      "516729",
    ]; // Puedes añadir o cambiar los IDs de las películas manualmente

    const reviews = [];

    // aqui podrias modificar los comentarios
    const movieReviews = [
      "Una película increíble, me mantuvo enganchado todo el tiempo.",
      "El guion es un poco flojo, pero las actuaciones son brillantes.",
      "La cinematografía es espectacular, cada escena parece una obra de arte.",
      "No me esperaba ese giro en la trama, me dejó sin palabras.",
      "Podría haber sido mejor, pero en general es entretenida.",
      "Si eres fan del género, esta película no te decepcionará.",
      "No la volvería a ver, pero tiene algunos momentos rescatables.",
      "La banda sonora es simplemente impresionante, añade mucha emoción a la historia.",
    ];
    for (let i = 0; i < 30; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomMovie = movieIds[Math.floor(Math.random() * movieIds.length)];

      const newReview = await Review.create({
        rating: fakerES.number.int({ min: 1, max: 5 }),
        comment: fakerES.helpers.arrayElement(movieReviews),
        user: randomUser._id,
        movieId: randomMovie,
      });

      reviews.push(newReview);
    }

    console.log("Reseñas creadas:", reviews);
    return mongoose.disconnect();
  } catch (err) {
    console.log(err);
  }
}

seedDatabase();
