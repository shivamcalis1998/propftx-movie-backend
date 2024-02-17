const mongoose = require("mongoose");

const authSchema = mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["ADMIN", "VIEW_ALL"], default: "VIEW_ALL" },
});

const authModel = mongoose.model("newuserA", authSchema);

module.exports = authModel;
