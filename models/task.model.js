const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
   idea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Idea"
   },

   title: {
      type: String,
      required: true
   },

   description: {
      type: String
   },

   status: {
      type: String,
      default: "todo"
   }

}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);