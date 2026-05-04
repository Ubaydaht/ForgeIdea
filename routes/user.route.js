const express = require("express");
const router = express.Router();

const { postSignup, postSignin, getDashboard, postIdea, getAllIdeas, getSingleIdea, upvoteIdea, addComment, getNotifications, getBoard, addTask} = require("../controllers/user.controller");

router.post("/register", postSignup);
router.post("/login", postSignin);
router.get("/dashboard", getDashboard);
router.post("/ideas", postIdea);
router.get('/ideas', getAllIdeas);
router.get('/ideas/:id', getSingleIdea);
router.put('/ideas/upvote', upvoteIdea);
router.put("/ideas/comment", addComment);
router.get("/notifications/:userId", getNotifications);
router.get("/board/:ideaId", getBoard);
router.post("/board/task", addTask);

module.exports = router;