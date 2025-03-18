// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");
// Register the location for handlebars partials here:
hbs.registerPartials(__dirname + "/views/partials");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// default value for title local
const capitalize = require("./utils/capitalize");
const projectName = "cinepedia";

app.locals.appTitle = `${capitalize(projectName)} created with IronLauncher`;

// quiero que en todas las rutas se actualice la variable local isUserActive
const { updateLocals } = require("./middlewares/auth.middlewares");

app.use(updateLocals);

// 👇 Start handling routes here
const indexRoutes = require("./routes/index.routes");
const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const moviesRoutes = require("./routes/movies.routes");
const reviewsRoutes = require("./routes/reviews.routes");
app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/movies", moviesRoutes);
app.use("/reviews", reviewsRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
