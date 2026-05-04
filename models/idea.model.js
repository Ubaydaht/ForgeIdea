const mongoose = require("mongoose")


let ideasSchema = mongoose.Schema({
  title: {type: String, required: true},
  category: {type: String, required: true},
  shortDescription: {type: String, required: true},
  fullIdeaDetails: {type: String, required: true},
  tag1: {type: String, required: true},
  tag2: {type: String, required: false},
  requiredRole1: {type: String, required: false},
  requiredRole2: {type: String, required: false},
  requiredRole3: {type: String, required: false},
  requiredRole4: {type: String, required: false},
  createdBy: {type: mongoose.Schema.Types.ObjectId, ref: "User",   required: true},
  upvotes: [ { type: mongoose.Schema.Types.ObjectId, ref: "User"  }],
  comments: [
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        text: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
]

})

const Idea = mongoose.model('Ideas', ideasSchema);
module.exports = Idea;

