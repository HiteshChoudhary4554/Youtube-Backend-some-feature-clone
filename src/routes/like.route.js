import { Router } from 'express';
import { verifyJwt } from '../middlewares/auth.middleware.js';
import {
  getLikedVideos,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from '../controllers/like.controller.js';

const likeRouter = Router();

likeRouter.route('/toggle-video-like/:videoId').post(verifyJwt, toggleVideoLike);
likeRouter.route('/toggle-comment-like/:commentId').post(verifyJwt, toggleCommentLike);
likeRouter.route('/toggle-tweet-like/:tweetId').post(verifyJwt, toggleTweetLike);
likeRouter.route('/get-liked-video').get(verifyJwt, getLikedVideos);
export { likeRouter };
