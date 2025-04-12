const moviedb = require("./tmdbApi");

async function addMovieDataToReviews(reviews) {
  return await Promise.all(
    reviews.map(async (eachReview) => {
      let details = await moviedb.movieInfo({
        id: eachReview.movieId,
        language: "es-ES",
      });

      return {
        ...eachReview.toObject(),
        moviePoster: details.poster_path,
        movieTitle: details.title,
      };
    })
  );
}

module.exports = addMovieDataToReviews;
