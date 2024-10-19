const mongoose = require("mongoose");

const healthcareSchema = new mongoose.Schema({
  servicename: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
});

const Healthcare = mongoose.model("Healthcare", healthcareSchema);

module.exports = Healthcare;
