const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { postSignup, postSignin, getDashboard, postIdea, getAllIdeas, getSingleIdea, upvoteIdea, addComment, getNotifications, getBoard, addTask, getTask, deleteTask, updateTaskStatus, searchIdeas, uploadProfilePicture, getProfilePicture } = require("../controllers/user.controller");

router.post("/register", upload.single("image"), postSignup);
router.post("/login", postSignin);
router.get("/dashboard", getDashboard);
router.post("/ideas", postIdea);
router.get('/ideas', getAllIdeas);
router.get('/ideas/:id', getSingleIdea);
router.put('/ideas/upvote', upvoteIdea);
router.put("/ideas/comment", addComment);
router.get("/notifications/:userId", getNotifications);
router.get("/board/:ideaId", getBoard);
router.post("/board/tasks", addTask);
router.get("/tasks/:ideaId", getTask);
router.delete("/tasks/:taskId", deleteTask);
router.put("/tasks/status/:taskId", updateTaskStatus);
router.get("/search", searchIdeas);
router.put("/upload-profile/:id", uploadProfilePicture)
router.get("/users/:id", getProfilePicture)

module.exports = router;