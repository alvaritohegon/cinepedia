const { Schema, model } = require("mongoose");

const listSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  movies: [
    {
      type: String,
      required: true,
    },
  ],
});

const List = model("List", listSchema);

module.exports = List;
