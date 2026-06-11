import { asyncHandler } from '../utils/asyncHandler.js';
import { Comment } from '../models/comment.model.js';
import { apiResponse } from '../utils/apiResponse.js';
import { apiError } from '../utils/apiError.js';
import mongoose from 'mongoose';

const getVideoComment = asyncHandler(async (req, res) => {
  const { video } = req.params;

  if (!video.trim()) {
    throw new apiError(402, 'video id is mendatory...');
  }

  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(video),
      },
    },
  ]);

  if (!comments.length) {
    throw new apiError('please provide valid video id ...');
  }

  return res
    .status(200)
    .json(new apiResponse(200, comments, 'comment fetched successfully..'));
});

const addComment = asyncHandler(async (req, res) => {
  const { video } = req.params;
  const { content } = req.body;

  if ([content, video].some((ele) => ele.trim() === '')) {
    throw new apiError('Content, OwnerId, VideoId are mendatory..');
  }

  const comment = await Comment.create({
    content,
    video,
    owner: req?.user?._id,
  });

  if (!comment) {
    throw new apiError(500, 'something went wrong while uploading comment...');
  }

  return res
    .status(200)
    .json(new apiResponse(200, comment, 'comment uploading successfully..'));
});

const updateComment = asyncHandler(async (req, res) => {
  const { comment } = req.params;
  const { content } = req.body;

  if (!(content.trim() && comment.trim())) {
    throw new apiError(402, 'content commentId are mendatory...');
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    comment,
    {
      content,
    },
    {
      new: true,
    }
  );

  if (!updatedComment) {
    throw new apiError(402, 'please provide valid commentId...');
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, updatedComment, 'comment updated successfully...')
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { comment } = req.params;

  if (!comment.trim()) {
    throw new apiError(403, 'please provide commentId ...');
  }

  const deletedComment = await Comment.deleteOne({ _id: comment });

  if (!deletedComment) {
    throw new apiError(402, 'please provide valid commentId');
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, deletedComment, 'comment deleted successfully..')
    );
});

export { getVideoComment, addComment, updateComment, deleteComment };
