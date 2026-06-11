import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import {
  deleteVideo,
  getAllVideos,
  getVideoById,
  publishVideo,
  togglePublishStatus,
  updateVideo,
} from '../controllers/video.controller.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';

const videoRouter = Router();

videoRouter.use(verifyJwt);

videoRouter.route('/publish-video').post(
  upload.fields([
    {
      name: 'thumbnail',
      maxCount: 1,
    },
    {
      name: 'video',
      maxCount: 1,
    },
  ]),
  publishVideo
);
videoRouter.route('/get-all-video').get(getAllVideos);
videoRouter.route('/video/:videoId').get(getVideoById);
videoRouter
  .route('/update-video/:videoId')
  .post(upload.single('thumbnail'), updateVideo);
videoRouter.route('/delete-video/:videoId').get(deleteVideo);
videoRouter.route('/ispublished-status/:videoId').get(togglePublishStatus);

export default videoRouter;
