import { Router } from 'express';
import { verifyJwt } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from '../controllers/tweet.controller.js';

const tweetRouter = Router();

tweetRouter.route('/create-tweet').post(verifyJwt, upload.none(), createTweet);
tweetRouter.route('/get-user-tweets/:username').get(getUserTweets);
tweetRouter.route('/update-tweet').patch(verifyJwt, upload.none(), updateTweet);
tweetRouter.route('/delete-tweet/:commentId').delete(verifyJwt, deleteTweet);

export default tweetRouter;
