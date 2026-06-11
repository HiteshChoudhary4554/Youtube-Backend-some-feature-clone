import { Router } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetail,
  updateUserAvatar,
  updateCoverImage,
  getWatchHistory,
  getUserChannelProfile,
} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJwt } from '../middlewares/auth.middleware.js';
import { refreshAccessToken } from '../controllers/user.controller.js';

const userRrouter = Router();

userRrouter.route('/register').post(
  upload.fields([
    {
      name: 'avatar',
      maxCount: 1,
    },
    {
      name: 'coverImage',
      maxCount: 1,
    },
  ]),
  registerUser
);
userRrouter.route('/login').post(upload.none(), loginUser);
userRrouter.route('/logout').post(verifyJwt, logoutUser);
userRrouter.route('/refresh-token').post(verifyJwt, refreshAccessToken);
userRrouter
  .route('/update-password')
  .post(verifyJwt, upload.none(), changeCurrentPassword);
userRrouter.route('/current-user').get(verifyJwt, getCurrentUser); 
userRrouter
  .route('/update-account')
  .patch(verifyJwt, upload.none(), updateAccountDetail);
userRrouter
  .route('/avatar')
  .patch(verifyJwt, upload.single("avatar"), updateUserAvatar);
userRrouter
  .route('/cover-image')
  .patch(verifyJwt, upload.single("coverImage"), updateCoverImage);
userRrouter.route('/channel/:username').get(getUserChannelProfile); // correction
userRrouter.route('/watch-history').get(verifyJwt, getWatchHistory)

export default userRrouter;
 