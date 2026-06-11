import { Router } from 'express';
import { verifyJwt } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getPlaylistById,
  getUserPlaylist,
  removeVideoFromPlaylist,
  updatePlaylistInfo,
} from '../controllers/playlist.controller.js';

const playlistRouter = Router();

playlistRouter
  .route('/create-playlist')
  .post(verifyJwt, upload.none(), createPlaylist);
playlistRouter.route('/get-user-playlist/:channelId').get(getUserPlaylist);
playlistRouter.route('/get-playlist-by-id/:playlistId').get(getPlaylistById);
playlistRouter
  .route('/add-video-to-playlist')
  .patch(verifyJwt, addVideoToPlaylist);
playlistRouter
  .route('/remove-video-from-playlist')
  .patch(verifyJwt, removeVideoFromPlaylist);
playlistRouter.route('/delete-playlist/:playlistId').delete(verifyJwt, deletePlaylist);
playlistRouter
  .route('/update-playlist-info/:playlistId')
  .patch(verifyJwt, upload.none(), updatePlaylistInfo);

export { playlistRouter };
