import { Router } from 'express';
import { verifyJwt } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import {
  addComment,
  deleteComment,
  getVideoComment,
  updateComment,
} from '../controllers/comment.controller.js';

const commentRouter = Router();

commentRouter
  .route('/add-comment/:video')
  .post(verifyJwt, upload.none(), addComment);
commentRouter.route('/get-video-comments/:video').get(getVideoComment);
commentRouter
  .route('/update-comment/:comment')
  .patch(verifyJwt, upload.none(), updateComment);
commentRouter
  .route('/delete-comment/:comment')
  .delete(verifyJwt, deleteComment);

export default commentRouter;
