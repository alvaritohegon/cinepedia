const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending Confirmation", "Active"], // los únicos posibles valores
      default: "Pending Confirmation",
    },
    confirmationCode: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    perfilImage: {
      type: String,
      default: "https://i.imgur.com/6VBx3io.png", // url de imagen por defecto
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"], // los únicos posibles valores
      default: "user",
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
