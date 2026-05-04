const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({

   idea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Idea",
      required: true
   },

   columns: [
      {
         title: String,

         tasks: [
            {
               title: String,
               description: String,
               assignedTo: {
                  type: mongoose.Schema.Types.ObjectId,
                  ref: "User"
               },
               status: String,
               dueDate: Date
            }
         ]
      }
   ]

}, { timestamps: true });

module.exports = mongoose.model("Board", boardSchema);