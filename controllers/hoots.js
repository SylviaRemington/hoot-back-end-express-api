// controllers/hoots.js

const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Hoot = require("../models/hoot.js");
const router = express.Router();

// ADDING ROUTES HERE:
// Adding verifyToken directly to this route guarantees its protection, 
// independent of the order in which middleware is applied elsewhere in the application. 
// This approach is the recommended method for handling authentication when securing routes individually.
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

module.exports = router;





/*
Code the Controller Function - lines 12 and on

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