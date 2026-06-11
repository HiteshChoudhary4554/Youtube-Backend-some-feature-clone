import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { Like } from '../models/like.model.js';
import { mongoose } from 'mongoose';

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId.trim()) {
    throw new apiError(403, 'videoId is mandatory');
  }

  const videoLike = await Like.create({
    video: videoId,
    likedBy: req?.user?._id,
  });

  if (!videoLike) {
    throw new Error(500, 'something went wrong while video like model create');
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, videoLike, 'video like model updated successfully')
    );
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId.trim()) {
    throw new apiError(403, 'videoId is mandatory');
  }

  const commentLike = await Like.create({
    comment: commentId,
    likedBy: req?.user?._id,
  });

  if (!commentLike) {
    throw new Error(
      500,
      'something went wrong while comment like model create'
    );
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        commentLike,
        'comment like model updated successfully'
      )
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId.trim()) {
    throw new apiError(403, 'videoId is mandatory');
  }

  const tweetLike = await Like.create({
    tweet: tweetId,
    likedBy: req?.user?._id,
  });

  if (!tweetLike) {
    throw new Error(500, 'something went wrong while tweet like model create');
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, tweetLike, 'tweet like model updated successfully')
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const allLikedVideo = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req?.user?._id),
      },
    },
    {
      $project: {
        video: 1,
        likedBy: 1,
      },
    },
  ]);

  if (!allLikedVideo.length) {
    throw new apiError(
      500,
      'something went wrong while fetching allLikedVideo'
    );
  }

  const likedVideo = allLikedVideo.filter((ele) => ele.video);

  return res
    .status(200)
    .json(
      new apiResponse(200, likedVideo, 'liked video fetching successfully')
    );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
