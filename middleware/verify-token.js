const jwt = require('jsonwebtoken');


function verifyToken(req, res, next) {
  try {

    // you're checking the token here:
    const token = req.headers.authorization.split(' ')[1];
    console.log("The token from auth header is:", token); //to check if working


    // decoding here:
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded is:", decoded); //to check if decoding is working


    // assigning decoded payload to req.user
    req.user = decoded.payload;
    console.log("req.user is:", req.user);
    
    
    next();
  } catch (err) {
    // If any errors, send back a 401 status and an 'Invalid token.' error message
    res.status(401).json({ err: 'Invalid token.' });
  }
}

module.exports = verifyToken;
