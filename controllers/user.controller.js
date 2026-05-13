const Idea = require("../models/idea.model");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");
const Board = require("../models/board.model");
const Task = require("../models/task.model");
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const JWT = require('jsonwebtoken')
const dotenv = require('dotenv');   
dotenv.config();
const JWT_Secret = process.env.jwtSECRET

const upload = require("../middleware/upload");


const postSignup = (req, res) => {
    console.log(req.file);
    try {

        let salt = bcrypt.genSaltSync(10);
        let hashedPassword = bcrypt.hashSync(req.body.password, salt);

        req.body.password = hashedPassword;

        req.body.image = req.file ? req.file.path : "";


        const newPoster = new User(req.body);

        newPoster.save()
            .then((user) => {

                res.status(201).json({
                    message: "sign up successful",
                    user: {
                        id: user._id,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        email: user.email,
                        image: user.image
                    }
                });

                // EMAIL runs AFTER response (safe)
                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.PASS
                    }
                });

                let mailOptions = {
                    from: process.env.EMAIL,
                    to: user.email,
                    subject: 'Hi, Welcome to IdeaForge',
                    html: `<h1>Welcome</h1>`
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) console.log("EMAIL ERROR:", error);
                    else console.log("Email sent:", info.response);
                });

            })
            .catch((err) => {
                console.log("DB ERROR:", err);
                return res.status(500).json({ message: err.message });
            });

    } catch (err) {
        console.log("SERVER ERROR:", err);
        return res.status(500).json({ message: err.message });
    }

};



const postSignin = (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email }) // Corrected from Customer.findOne
        .then((foundUsers) => {
            if (!foundUsers) {
                console.log("Invalid email");
                return res.status(400).json({message: "Invalid email "})
            } 

            const isMatch = bcrypt.compareSync(password, foundUsers.password);

            if (!isMatch){
                console.log("Invalid password")
                return res.status(400).json({message:"Invalid password"})
            }
            // if (foundCustomers.password !== password) {
            //     console.log("Invalid Password");
            //     return res.status(400).json({ message: "Invalid email or password"});
            // }
            const token = JWT.sign({email:req.body.email}, JWT_Secret, {expiresIn: "1h"})
            console.log("Generated Token:", token);

            return res.json({
                message: "Login Successful",
                user: {
                    id: foundUsers._id,
                    email: foundUsers.email,
                    firstname: foundUsers.firstname,
                    image:foundUsers.image,
                    token: token
                }
            })
            // res.redirect("/user/dashboard");
            
        })
        .catch((err) => {
            console.error("Error during signin:", err);
            res.status(500).send("Internal server error");
        });
}

const getDashboard = (req, res) => {
    let token = req.headers.authorization.split(" ")[1]; // Assuming token is sent as "Bearer <token>"
    
    JWT.verify(token, JWT_Secret, (err, decoded) => { // Using the globally defined JWT_Secret
        if (err) {
            return res.status(401).json({ message: "Invalid or expired token" });
        } else {
            console.log("Decoded token data:", decoded);
            let userEmail = decoded.email;
            
            User.findOne({ email: userEmail }) // Corrected from Customer.findOne
                .then((user) => {
                    if (!user) {
                        return res.status(404).json({ message: "User not found" });
                    }
                    console.log("User found:", user);
                    res.json({ message: "Dashboard accessed successfully", user: { email: user.email, firstName: user.firstName } });
                })
                .catch((err) => {
                    console.error("Error fetching user:", err);
                    res.status(500).json({ message: "Internal server error" });
                });
        }
    });
}



const postIdea = async (req, res) => {

    try {

        const ideaData = req.body;

        const newIdea = new Idea(ideaData);

        const idea = await newIdea.save();

        // CREATE BOARD AUTOMATICALLY
        await Board.create({

            idea: idea._id,

            columns: [
                { title: "To Do", tasks: [] },
                { title: "In Progress", tasks: [] },
                { title: "Done", tasks: [] }
            ]
        });

        console.log("Idea saved:", idea);

        res.status(201).json({
            message: "Idea created successfully",

            idea: {
                id: idea._id,
                title: idea.title,
                category: idea.category,
                shortDescription: idea.shortDescription,
                fullIdeaDetails: idea.fullIdeaDetails,
                tag1: idea.tag1,
                tag2: idea.tag2,
                requiredRole1: idea.requiredRole1,
                requiredRole2: idea.requiredRole2,
                requiredRole3: idea.requiredRole3,
                requiredRole4: idea.requiredRole4,
                createdBy: idea.createdBy
            }
        });

    } catch (err) {

        console.error("Error creating idea:", err);

        res.status(500).json({
            message: "Internal server error"
        });
    }
};


const getBoard = async (req, res) => {

   try {

      const board = await Board.findOne({
         idea: req.params.ideaId
      }).populate("columns.tasks.assignedTo");

      res.json(board);

   } catch (error) {

      res.status(500).json(error);
   }
};

const getAllIdeas = (req, res) => {
    Idea.find()
        .populate("createdBy")
        .then((ideas) => {
            res.status(200).json({
                message: "All ideas retrieved successfully",
                ideas
            });
        })
        .catch((err) => {
            console.error("Error fetching ideas:", err);
            res.status(500).json({
                message: err.message,
                error: err
            });
        });
};
   
const getSingleIdea = async (req, res) => {
    try {
        const idea = await Idea.findById(req.params.id)
            .populate("createdBy")
            .populate("comments.user");

        if (!idea) {
            return res.status(404).json({
                message: "Idea not found"
            });
        }

        res.status(200).json({
            idea
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: err.message
        });
    }
};

const upvoteIdea = async (req, res) => {
    try {

        const { ideaId, userId } = req.body;

        const idea = await Idea.findById(ideaId);

        if (!idea) {
            return res.status(404).json({
                message: "Idea not found"
            });
        }

        const alreadyUpvoted = idea.upvotes.includes(userId);

        if (alreadyUpvoted) {

            // remove vote
            idea.upvotes = idea.upvotes.filter(
                (id) => id.toString() !== userId
            );

        } else {

            // add vote
            idea.upvotes.push(userId);

            // CREATE NOTIFICATION
            if (idea.createdBy.toString() !== userId) {

                await Notification.create({
                    recipient: idea.createdBy,
                    sender: userId,
                    idea: idea._id,
                    type: "upvote",
                    message: "Someone upvoted your idea"
                });
            }
        }

        await idea.save();

        res.status(200).json({
            message: "Vote updated",
            upvotes: idea.upvotes.length
        });

    } catch (err) {

        console.log(err);

        res.status(500).json({
            message: err.message
        });
    }
};

const addComment = async (req, res) => {
    try {

        const { ideaId, userId, text } = req.body;

        const idea = await Idea.findById(ideaId);

        if (!idea) {
            return res.status(404).json({
                message: "Idea not found"
            });
        }

        const comment = {
            user: userId,
            text
        };

        idea.comments.push(comment);

        await idea.save();

        // populate comment users
        await idea.populate("comments.user");

        // CREATE NOTIFICATION
        if (idea.createdBy.toString() !== userId) {

            await Notification.create({
                recipient: idea.createdBy,
                sender: userId,
                idea: idea._id,
                type: "comment",
                message: "Someone commented on your idea"
            });
        }

        res.status(200).json({
            message: "Comment added successfully",
            comments: idea.comments
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};

const getNotifications = async (req, res) => {
   try {

      const notifications = await Notification.find({
         recipient: req.params.userId
      })
      .populate("sender")
      .sort({ createdAt: -1 });

      res.json(notifications);

   } catch (error) {
      res.status(500).json(error);
   }
};



const addTask = async (req, res) => {

    try {

      const { idea, title, description } = req.body;

      const newTask = new Task({
         idea,
         title,
         description
      });

      await newTask.save();

      res.status(201).json(newTask);

   } catch (error) {

      res.status(500).json({
         message: error.message
      });

   }

};
const getTask = async (req, res) => {
      try {

      const tasks = await Task.find({
         idea: req.params.ideaId
      });

      res.json(tasks);

   } catch (error) {

      res.status(500).json({
         message: error.message
      });

   }
}

const deleteTask = async (req, res) => {
  try {

    await Task.findByIdAndDelete(req.params.taskId);

    res.json({ message: "Task deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateTaskStatus = async (req, res) => {
  try {

    const { status } = req.body;

    const updated = await Task.findByIdAndUpdate(
      req.params.taskId,
      { status },
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const searchIdeas = async (req, res) => {
try {

    const q = req.query.q || "";

    const ideas = await Idea.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ]
    }).populate("createdBy");

    res.json({ ideas });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
}

const uploadProfilePicture = async (req, res) => {
     try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      user.profilePicture = req.file.path;

      await user.save();

      res.status(200).json({
        message: "Profile picture uploaded",
        user,
      });
    } catch (error) {
      res.status(500).json(error);
    }
}

const getProfilePicture = async (req, res) => {
     try {
    const user = await User.findById(req.params.id);

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json(error);
  }
}

module.exports = { postSignup, postSignin, getDashboard, postIdea, getAllIdeas, getSingleIdea, upvoteIdea, addComment, getNotifications, getBoard, addTask, getTask, deleteTask, updateTaskStatus, searchIdeas, uploadProfilePicture, getProfilePicture };