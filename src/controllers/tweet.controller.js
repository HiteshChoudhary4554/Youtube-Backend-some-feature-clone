import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { Tweet } from '../models/tweet.model.js';
import { apiResponse } from '../utils/apiResponse.js';
import { User } from '../models/user.model.js';
import mongoose from 'mongoose';

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content.trim()) {
    throw new apiError(402, 'required content...');
  }

  const tweet = await Tweet.create({
    owner: req?.user?._id,
    content,
  });

  if (!tweet) {
    throw new apiError(500, 'something went wrong while saving tweet..');
  }

  return res
    .status(200)
    .json(new apiResponse(200, tweet, 'tweet created successfully..'));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username.trim()) {
    throw new apiError(402, 'username is required..');
  }

  const ownerId = await User.findOne({ username }).select('_id');
  const tweets = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(ownerId._id),
      },
    },
  ]);

  if (!tweets) {
    throw new apiError(500, 'something went wrong while fetch tweets..');
  }

  return res
    .status(200)
    .json(new apiResponse(200, tweets, 'tweets fetched successfully'));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;  

  if (!content.trim()) {
    throw new apiError(402, 'required content...');
  }

  const tweet = await Tweet.findOneAndUpdate(
    {owner : req?.user?._id},
    {
      content,
    },
    {
      new: true,
    }
  );

  if (!tweet) {
    throw new apiError(500, 'something went wrong while updating tweet..');
  }

  return res
    .status(200)
    .json(new apiResponse(200, tweet, 'updated successfully'));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const {commentId} = req.params;

  const tweetDelete = await Tweet.findByIdAndDelete(commentId);

  if (!tweetDelete) {
    throw new apiError(500, 'something went wrong while deleting tweet');
  }

  return res
    .status(200)
    .json(new apiResponse(200, {}, 'tweet deleted successfully'));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
