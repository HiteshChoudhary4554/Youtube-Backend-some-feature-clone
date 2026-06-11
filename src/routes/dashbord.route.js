import { Router } from 'express';
import {
  getChannelVideos,
  getChannelVideoStatus,
} from '../controllers/dashbord.controller.js';

const dashbordRouter = Router();

dashbordRouter
  .route('/get-channel-video-status/:channelId')
  .get(getChannelVideoStatus);
dashbordRouter.route('/get-channel-video/:channelId').get(getChannelVideos);

export { dashbordRouter };
