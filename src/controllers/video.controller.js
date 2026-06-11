import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js ';
import { Video } from '../models/video.model.js';
import { removeCloudImage } from '../utils/removeCloudImage.js';
import { removeCloudVideo } from '../utils/removeCloudVideo.js';
import mongoose from 'mongoose';

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = true,
    sortBy,
    sortType,
    owner,
  } = req.query;

  if (!(owner && sortBy && sortType)) {
    throw new apiError(
      400,
      'sortBy, sortType and userId are required field ... '
    );
  }

  const skip = (Number(page) - 1) * Number(limit);

  const allVideoDocument = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(owner),
        isPublished: Boolean(query),
      },
    },
    {
      $sort: {
        [sortBy]: sortType === 'asc' ? 1 : -1,
      },
    },
    {
      $skip: Number(skip),
    },
    {
      $limit: Number(limit),
    },
  ]);

  if (!allVideoDocument) {
    throw new apiError(404, 'not found this user..');
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, allVideoDocument, 'all video feteched successfully')
    );
});

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;

  if ([title, description].some((ele) => ele.trim() === '')) {
    throw new apiError(403, ' title and description field are required ');
  }

  const videoLocalPath = req.files?.video?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!(thumbnailLocalPath || videoLocalPath)) {
    throw new apiError(403, 'thumbnail and video file are required');
  }

  const video = await uploadOnCloudinary(videoLocalPath);

  if (!video) {
    throw new apiError(500, 'something went wrong while uploading video');
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnail) {
    throw new apiError(500, 'something went wrong while uploading thumbnail');
  }

  const ownerId = req?.user?._id;

  if (!ownerId) {
    throw new apiError(402, 'user logged in mandatory');
  }

  const videoDocument = await Video.create({
    videoFile: video.url,
    thumbnail: thumbnail.url,
    owner: ownerId,
    title,
    description,
    duration: video.duration,
    isPublished,
  });

  if (!videoDocument) {
    throw new apiError(
      500,
      'something went wrong while insert database video document'
    );
  }

  return res
    .status(201)
    .json(
      new apiResponse(200, videoDocument, 'video file inserted successfully..')
    );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new apiError(401, 'please required videoId..');
  }

  const videoDocument = await Video.findOne({ _id: videoId });

  if (!videoDocument) {
    throw new apiError(404, ' something went wrong while fetching video');
  }

  return res
    .status(200)
    .json(new apiResponse(200, videoDocument, 'video feteched successfully'));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description, isPublished } = req.body;
  const thumbnailLocalPath = req.file?.path;

  if (!videoId) {
    throw new apiError('404', 'please required video id..');
  }

  if (!(title.trim() && description.trim())) {
    throw new apiError(402, 'please required title and description');
  }

  const videoDocument = await Video.findOne({ _id: videoId });

  if (!videoDocument) {
    throw new apiError(404, 'please provide valid video Id');
  }

  async function updateImage(localPath) {
    if (!localPath) {
      return videoDocument.thumbnail;
    }
    await removeCloudImage(videoDocument.thumbnail);
    const thumbnailResponse = await uploadOnCloudinary(localPath);
    return thumbnailResponse.url;
  }

  const thumbnailUrl = await updateImage(thumbnailLocalPath);

  videoDocument.title = title;
  videoDocument.description = description;
  videoDocument.isPublished = isPublished;
  videoDocument.thumbnail = thumbnailUrl;

  const updatedVideoDocument = await videoDocument.save();

  return res
    .status(200)
    .json(
      new apiResponse(200, updatedVideoDocument, 'video updated successfully')
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new apiError(400, 'please required videoId');
  }

  const videoDocument = await Video.findById(videoId);

  if (!videoDocument) {
    throw new apiError(404, 'not found video document this id');
  }

  await removeCloudVideo(videoDocument.videoFile);
  await removeCloudImage(videoDocument.thumbnail);

  const result = await Video.deleteOne({ _id: videoId });

  if (!result) {
    throw new apiError(
      500,
      'something went wrong while deleting video document'
    );
  }

  return res
    .status(200)
    .json(new apiResponse(200, {}, 'video document deleted successfully'));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new apiError(400, 'please required videoId');
  }

  const isPublishedStatus = await Video.findById(videoId).select('isPublished');

  if (!isPublishedStatus) {
    throw new apiError(404, 'not found video document by thid id');
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        isPublishedStatus,
        'sccussesfull find out isPublicStatus'
      )
    );
});

export {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
