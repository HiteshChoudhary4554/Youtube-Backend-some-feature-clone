import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { Playlist } from '../models/playlist.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { mongoose } from 'mongoose';

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  console.log(`name : ${name} description : ${description}`);

  if (!(name.trim() && description.trim())) {
    throw new apiError(402, 'playlist name and description are mendatory..');
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req?.user?._id,
  });

  if (!playlist) {
    throw new apiError(500, 'something went wrong while uploading playlist..');
  }

  return res
    .status(200)
    .json(new apiResponse(200, playlist, 'playlist created successfully'));
});

const getUserPlaylist = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  console.log('channel Id => ', channelId);

  if (!channelId.trim()) {
    throw new apiError(402, 'channelId is mendatory...');
  }

  const channelPlaylists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(channelId),
      },
    },
  ]);

  if (!channelPlaylists.length)
    return res
      .status(200)
      .json(
        new apiResponse(200, channelPlaylists, 'does not find any playlists')
      );

  return res
    .status(200)
    .json(
      new apiResponse(200, channelPlaylists, 'playlist fetched successfully')
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId.trim()) {
    throw new apiError(402, 'playlistId is mendatory..');
  }

  const playlists = await Playlist.findById(playlistId);

  if (!playlists) {
    new apiResponse(
      200,
      playlists,
      'playlist does not exist this user account'
    );
  }

  return res
    .status(200)
    .json(new apiResponse(200, playlists, 'playlist access successfully..'));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.query;

  if (!(playlistId.trim() && videoId.trim())) {
    throw new apiError(402, 'playlistId and videoId are mandatory field..');
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: { videos: videoId },
    },
    {
      new: true,
    }
  );

  if (!updatedPlaylist) {
    throw new apiError(404, 'provide valid playlistId...');
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        updatedPlaylist,
        'playlist is updated successfully..'
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.query;

  if (!(playlistId.trim() && videoId.trim())) {
    throw new apiError(402, 'playlistId and videoId are mandatory field..');
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId },
    },
    {
      new: true,
    }
  );

  if (!updatedPlaylist) {
    throw new apiError(400, 'provide valid playlistid and videoid..');
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        updatedPlaylist,
        'playlist updated/video remove successfully..'
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId.trim()) {
    throw new apiError(403, 'playlistId is mendatory...');
  }

  const removePlaylist = await Playlist.findByIdAndDelete(playlistId);

  if (!removePlaylist) {
    throw new apiError(403, 'provide valid playlist id..');
  }

  return res
    .status(200)
    .json(new apiResponse(200, removePlaylist, 'playlist remove very easy..'));
});

const updatePlaylistInfo = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      name,
      description,
    },
    {
      new: true,
    }
  );

  if (!updatedPlaylist) {
    throw new apiError(403, 'provide valid playlist id');
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, updatedPlaylist, 'playlist is updated successfully')
    );
});

export {
  createPlaylist,
  getUserPlaylist,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylistInfo,
};
