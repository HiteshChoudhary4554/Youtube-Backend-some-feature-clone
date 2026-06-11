import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { Subscription } from '../models/subscription.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose, { mongo } from 'mongoose';

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channel } = req.params;
  console.log('channel => ', channel);

  if (!channel) {
    throw new apiError(402, ' channel ID is manadatory...');
  }

  const channelSubscribed = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channel),
      },
    },
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(req?.user?._id),
      },
    },
    {
      $limit: 1,
    },
  ]);

  console.log('docs', channelSubscribed);

  const isSubscribed = channelSubscribed.length ? true : false;

  return res
    .status(200)
    .json(
      new apiResponse(200, { isSubscribed }, 'fetch toggle subscription status')
    );
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channel } = req.params;

  if (!channel) {
    throw new apiError(402, 'channel id is important');
  }

  const channelSubscriber = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channel),
      },
    },
  ]);

  return res
    .status(200)
    .json(new apiResponse(200, channelSubscriber, 'fetch all subscriber...'));
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channel } = req.params;

  if (!channel) {
    throw new apiError(402, 'required subscriber id...');
  }

  const toSubscribedChannel = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(channel),
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        toSubscribedChannel,
        'to channel subscribed fetched successfully...'
      )
    );
});

const addSubscription = asyncHandler(async (req, res) => {
  const { channel } = req.params;

  if (!channel.trim()) {
    throw new apiError(402, 'channel and subscriber are mendatory...');
  }

  const subscriptionDoc = await Subscription.create({
    subscriber: req?.user?._id,
    channel,
  });

  if (!subscriptionDoc) {
    throw new apiError(
      500,
      'something went wrong while crate subscription model...'
    );
  }

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        subscriptionDoc,
        'successful created subscription method'
      )
    );
});

const unSubscribedChannel = asyncHandler(async (req, res) => {
  // get subscibe channel by param
  // check channel value empty or not
  // get user id
  // find channel and user id in channel
  // output doc remove in the database
  const { channel } = req.params;

  if (!channel) {
    throw new apiError(402, ' channel id is mendatory');
  }

  const unSubscribe = await Subscription.findOneAndDelete({
    channel,
    subscriber: req?.user?._id,
  });

  if (!unSubscribe) {
    return res
      .status(200)
      .json(new apiResponse(200, { unSubscribe }, 'already user unSubscribe'));
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, unSubscribe, ' user unSubscribed successfully...')
    );
});

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
  addSubscription,
  unSubscribedChannel,
};
