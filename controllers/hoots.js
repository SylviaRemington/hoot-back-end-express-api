// controllers/hoots.js

const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Hoot = require("../models/hoot.js");
const router = express.Router();

// ADDING ROUTES HERE:
// Adding verifyToken directly to this route guarantees its protection, 
// independent of the order in which middleware is applied elsewhere in the application. 
// This approach is the recommended method for handling authentication when securing routes individually.

// CREATE HOOT - This is a POST ROUTE - URL ends with /hoots
router.post("/", verifyToken, async (req, res) => {
    // new route
    try {
        req.body.author = req.user._id;
        const hoot = await Hoot.create(req.body);
        hoot._doc.author = req.user;
        res.status(201).json(hoot);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// -----------------------------------------------------------------

// VIEW HOOTS - This is a GET route - URL also ends in /hoots ???
router.get("/", verifyToken, async (req, res) => {
    // new route
    try {
        const hoots = await Hoot.find({})
            .populate("author")
            .sort({ createdAt: "desc" });
        res.status(200).json(hoots);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// FOR ABOVE GET ROUTE:
// A user needs to be logged in to view a list of hoots, so be sure to include 
// the verifyToken middleware.
// Restricting access to the index and show functionality will reduce the amount of 
// conditional rendering we need to implement in our React app.

// -----------------------------------------------------------------

// VIEW HOOT / Like a Showpage when we did express and EJS - 
// This is a GET route - URL ends in the following /hoots/:hootId

// OLDER SHOWPAGE BEFORE ADDED COMMENTS SECTION:
// router.get("/:hootId", verifyToken, async (req, res) => {
//     try {
//         const hoot = await Hoot.findById(req.params.hootId).populate("author");
//         res.status(200).json(hoot);
//     } catch (err) {
//         res.status(500).json({ err: err.message });
//     }
// });

// NEWER SHOWPAGE AFTER COMMENTS SECTION ADDED:
router.get('/:hootId', verifyToken, async (req, res) => {
    try {
        // populate author of hoot and comments
        const hoot = await Hoot.findById(req.params.hootId).populate([
            'author',
            'comments.author',
        ]);
        res.status(200).json(hoot);
    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// -----------------------------------------------------------------

// UPDATE HOOT - This is a PUT route - URL ends in this format /hoots/:hootId

router.put("/:hootId", verifyToken, async (req, res) => {
    // add route
    try {
        // Find the hoot:
        const hoot = await Hoot.findById(req.params.hootId);

        // Check permissions:
        if (!hoot.author.equals(req.user._id)) {
            return res.status(403).send("You're not allowed to do that!");
        }

        // Update hoot:
        const updatedHoot = await Hoot.findByIdAndUpdate(
            req.params.hootId,
            req.body,
            { new: true }
        );

        // Append req.user to the author property:
        updatedHoot._doc.author = req.user;

        // Issue JSON response:
        res.status(200).json(updatedHoot);

    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// As an extra layer of protection, we’ll use conditional rendering in our React app 
// to limit access to this functionality so that only the author of a hoot can view the 
// UI elements that allow editing.

// -----------------------------------------------------------------

// DELETE HOOT - This is a DELETE route - URL ends in /hoots/:hootId - also make sure put an actual id in POSTMAN for the web url too
router.delete("/:hootId", verifyToken, async (req, res) => {
    // add route
    try {
        const hoot = await Hoot.findById(req.params.hootId);

        if (!hoot.author.equals(req.user._id)) {
            return res.status(403).send("You're not allowed to do that!");
        }

        const deletedHoot = await Hoot.findByIdAndDelete(req.params.hootId);
        res.status(200).json(deletedHoot);

    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// -----------------------------------------------------------------
// -----------------------------------------------------------------

// COMMENTS SECTION:

// CREATE NEW COMMENT - This is a POST route - /hoots/:hootId/comments
router.post("/:hootId/comments", verifyToken, async (req, res) => {
    // add route
    try {
        req.body.author = req.user._id;
        const hoot = await Hoot.findById(req.params.hootId);
        hoot.comments.push(req.body);
        await hoot.save();

        // Find the newly created comment:
        const newComment = hoot.comments[hoot.comments.length - 1];

        newComment._doc.author = req.user;

        // Respond with the newComment:
        res.status(201).json(newComment);

    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// UPDATED COMMENT - This is a PUT route - /hoots/:hootId/comments/:commentId
router.put("/:hootId/comments/:commentId", verifyToken, async (req, res) => {
    // add route
    try {
        const hoot = await Hoot.findById(req.params.hootId);
        const comment = hoot.comments.id(req.params.commentId);

        // ensures the current user is the author of the comment
        if (comment.author.toString() !== req.user._id) {
            return res
                .status(403)
                .json({ message: "You are not authorized to edit this comment" });
        }

        comment.text = req.body.text;
        await hoot.save();
        res.status(200).json({ message: "Comment updated successfully" });

    } catch (err) {
        res.status(500).json({ err: err.message });
    }
});

// DELETED COMMENT - This is a DELETE route - /hoots/:hootId/comments/:commentId
router.delete("/:hootId/comments/:commentId", verifyToken, async (req, res) => {
    // add route
    try {
        const hoot = await Hoot.findById(req.params.hootId);
        const comment = hoot.comments.id(req.params.commentId);

        // ensures the current user is the author of the comment
        if (comment.author.toString() !== req.user._id) {
            return res
                .status(403)
                .json({ message: "You are not authorized to edit this comment" });
        }

        hoot.comments.remove({ _id: req.params.commentId });
        await hoot.save();
        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (err) {
        res.status(500).json({ err: err.message });
    }

});

// -----------------------------------------------------------------

module.exports = router;




// -----------------------------------------------------------------
/*
Code the Controller Function - lines 12 and on FOR CREATE ROUTE BELOW:

Let’s break down what we’ll do inside the controller function step by step:

1. Add the logged-in user as the author
Before creating a new hoot, we’ll add the logged-in user’s ID (req.user._id)
to the req.body.author. This ensures that the logged-in user is recorded as
the author of the hoot.

2. Create the hoot
We’ll use the create() method from the Hoot model, passing in req.body.
This method will create a new hoot document.

-At first, the author property in this document will only have the user’s ID (an ObjectId).
-To include the full user information, we’ll add the complete user object (already available in req) to the new hoot.
***This step is important so that the new hoot can immediately display the author’s details
on the client side.

3. Send the response
After creating the new hoot, we’ll send it back as a JSON response.
This way, the client can immediately show the new hoot with all its information.
*/

/*
When we use Mongoose’s create() method, the new hoot is not just a regular JavaScript object—
it’s a Mongoose document. This document includes an extra _doc property, which holds the actual
data retrieved from MongoDB. Normally, we don’t need to worry about this, but since we’re updating
the author property before sending the response, we’ll need to access the hoot._doc property to
work with the actual data.
*/

// -----------------------------------------------------------------

/*
FOR THE GET ROUTE - LINE 28 AND BELOW:
Code the controller function
Let’s breakdown what we’ll accomplish inside our controller function.

We’ll call upon the find({}) method of our Hoot model, retrieving all hoots from the database. When we call upon find({}), we’ll chain two additional methods to the end.

The first is the populate() method. We’ll use this to populate the author property of each hoot with a user object.

The second is the sort() method. We’ll use this to sort hoots in descending order, meaning the most recent entries will be at the at the top.

Once the new hoots are retrieved, we’ll send a JSON response containing the hoots array.
*/

// -----------------------------------------------------------------