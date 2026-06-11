import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { mongoose } from 'mongoose';
import { Video } from '../models/video.model.js';

const getChannelVideoStatus = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId.trim()) {
    throw new apiError(403, 'provide valid channel id...');
  }

  const channelVideoInfo = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $group: {
        _id: null,
        totalVideo: { $sum: 1 },
        totalView: { $sum: 'view' },
      },
    },
  ]);

  if (!channelVideoInfo) {
    throw new apiError(
      500,
      'something went wrong while fetching video data...'
    );
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        channelVideoInfo[0],
        'successfully video data fetching..'
      )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId.trim()) {
    throw new apiError(403, 'provide valid channel id...');
  }

  const allVideo = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
  ]);

  if (!allVideo) {
    throw new apiError(
      500,
      'something went wrong while fetching all particular channel video'
    );
  }

  return res
    .status(200)
    .json(new apiResponse(200, allVideo, 'all video fetched successfully..'));
});

export { getChannelVideoStatus, getChannelVideos };
