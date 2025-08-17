// models/hoot.js

// importing mongoose library - Before we're able to define our model and schema, we must first import mongoose library.
const mongoose = require('mongoose');


/*
Our hootSchema will consist of a title property, a text property, and a category property, 
all required, with a type of String. The category property will differ slightly from the others, 
here we will use enum to limit its allowed values to the following:

['News', 'Sports', 'Games', 'Movies', 'Music', 'Television']

The hootSchema will also have an author property, which will act as a reference to the 
User who created the hoot.
*/

// Be sure to place the commentSchema above hootSchema as it will be referenced inside that object:
// We don’t need to compile the commentSchema into a model, or export it, as it is 
// embedded inside the parent hootSchema. As a result, any functionality related to 
// the comments resource will need to go through the Hoot first.

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);


const hootSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['News', 'Sports', 'Games', 'Movies', 'Music', 'Television'],
    },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comments: [commentSchema],
  },
  { timestamps: true }
);

/*
💡 Notice this inclusion of { timestamps: true } above. This will give our hoot documents createdAt and 
updatedAt properties. We can use the createdAt property when we want to display the date a 
hoot post was made.
*/


// Register the model with Mongoose
const Hoot = mongoose.model('Hoot', hootSchema);

// Export so other files can require it
module.exports = Hoot;

// Or you could do the following that combines line 47 and line 50:
// module.exports = mongoose.model("Hoot", hootSchema);

// ----------------
// REMINDER:
// Schema = rules
// Model = tool (function with methods)
// Document = the saved record ({...})