'use server'

import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  retweetOf: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tweet', 
    default: null 
  }, // Reference to the original tweet if this is a retweet
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  parentId: {
    type: String,
  },
  children: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tweet",
    },
  ],
  likes: {
    type: Number,
    default: 0,
  },
});

const Tweet = mongoose.models.Tweet || mongoose.model("Tweet", tweetSchema);

export default Tweet;
