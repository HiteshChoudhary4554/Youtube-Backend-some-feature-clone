import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { apiResponse } from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';
import { removeCloudImage } from '../utils/removeCloudImage.js';
import mongoose from 'mongoose';

// generate Access and Refresh Token
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      'something went wrong while generating refresh and access token'
    );
  }
};

// register user
const registerUser = asyncHandler(async (req, res) => {
  // get data from user
  // check the data is prefect
  // check user is existed or not
  // use multer then access all file
  // file are exist
  // upload on cloudinary
  // check file is uploded successfully
  // then data store in db
  // check data store in db is successfully
  // remove password and refresh token from return value
  // after value return in frontend request.

  const { username, email, fullName, password } = req.body;

  if (
    [username, email, fullName, password].some(
      (element) => element?.trim() === ''
    )
  ) {
    throw new apiError(401, 'Required all field...');
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new apiError(409, 'user email or username already exist ..');
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new apiError(400, 'Avatar file is required');
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new apiError(404, 'avatar field is required');
  }

  const userData = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage.url || '',
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(userData._id).select(
    '-password -refreshToken'
  );

  if (!createdUser) {
    throw new apiError(500, ' something went wrong while user register..');
  }

  return res
    .status(201)
    .json(new apiResponse(200, createdUser, 'user registered successfully...'));
});

// login user
const loginUser = asyncHandler(async (req, res) => {
  // get data from user
  // check data is empty or not
  // check user existance
  // check the password
  // sucessfull login
  // generate access token
  // generate refresh token
  // set cookie
  // start session

  const { username, email, password } = req.body;

  if (!username && !email) {
    throw new apiError(400, 'please rquired username or email..');
  }

  if (!password) {
    throw new apiError(400, 'require password... ');
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!existedUser) {
    throw new apiError(401, 'user not found please register now..');
  }

  const isPasswordValid = await existedUser.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new apiError(401, 'Please fill correct password..');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    existedUser._id
  );
  const loggedInUser = await User.findById(existedUser._id).select(
    '-password -refreshToken'
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        'user logged in sucessfully'
      )
    );
});

// logout user
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },

      // $unset : {
      //   refreshToken : 1 this remove the field from document
      // }
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new apiResponse(200, {}, 'user Logged out'));
});

// refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new apiError(401, ' unauthorized request ');
  }
  const encodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  const user = await User.findById(encodedToken?._id);

  if (!user) {
    throw new apiError(401, 'Invalid Refresh Token ');
  }

  if (incomingRefreshToken !== user?.refreshToken) {
    throw new apiError(401, 'Refreshed token is expired or used');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          accessToken,
          refreshToken,
        },
        'Access token refreshed'
      )
    );
});

// change password
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const currentUser = await User.findById(req.user._id);

  const isPasswordCorrect = await currentUser.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new apiError(401, 'old password is incorrect...');
  }

  if (!newPassword) {
    throw new apiError(401, 'Please Enter new password..');
  }

  currentUser.password = newPassword;
  await currentUser.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new apiResponse(200, {}, 'password updated successfully...'));
});

// current user
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponse(200, req.user, 'current user fetched successfully'));
});

// update Account
const updateAccountDetail = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!(fullName && email)) {
    throw new apiError(401, 'fullName and email are required');
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      fullName,
      email,
    },
    {
      new: true,
    }
  ).select('-password -refreshToken');

  if (!user) {
    throw new apiError(
      500,
      ' something went wrong while update account detail..'
    );
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, user, 'fullName and email are upadated successfully')
    );
});

// update avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new apiError(400, 'Avatar file is missing');
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new apiError(500, 'Error while uploading avatar');
  }

  await removeCloudImage(req.user.avatar);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select('-password -refreshToken');

  if (!user) {
    throw new apiError(500, 'Error while updating');
  }

  return res
    .status(200)
    .json(new apiResponse(200, user, 'profile picture updated successfully'));
});

// update Cover Image
const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new apiError(401, 'provide cover image file');
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new apiError(500, 'something went wrong while uploading coverImage');
  }

  await removeCloudImage(req.user.coverImage);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select('-password -refreshToken');

  return res
    .status(200)
    .json(new apiResponse(200, user, 'cover Image uploaded successfully'));
});

//get user channel profile
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username.trim()) {
    throw new apiError(402, 'please enter required username..');
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'channel',
        as: 'Subscribers',
      },
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'subscriber',
        as: 'SubscribedTo',
      },
    },
    {
      $addFields: {
        SubscriberCount: {
          size: '$Subscriber',
        },
        channelCount: {
          size: '$SubscribedTo',
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, '$Subscribers.subscriber'] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        SubscriberCount: 1,
        channelCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new apiError(404, 'channel does not exist');
  }

  return res
    .status(200)
    .json(new apiResponse(200, channel, 'channel fetched successfully..'));
});

//get user post history
const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: 'videos',
        localField: 'watchHistory',
        foreignField: '_id',
        as: 'watchHistory',
        pipeline: [
          {
            $lookup: {
              from: 'users',
              localField: 'owner',
              foreignField: '_id',
              as: 'owner',
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: '$owner',
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        user[0].watchHistory,
        'watchHistory fetched successfully...'
      )
    );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetail,
  updateUserAvatar,
  updateCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
