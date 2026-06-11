import { Router } from 'express';
import { verifyJwt } from '../middlewares/auth.middleware.js';
import {
  addSubscription,
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
  unSubscribedChannel,
} from '../controllers/subscription.controller.js';

const subscriptionRouter = Router();
subscriptionRouter.use(verifyJwt);

subscriptionRouter.route('/subscribe-toggle/:channel').get(toggleSubscription);
subscriptionRouter
  .route('/get-user-channel-subscriber/:channel')
  .get(getUserChannelSubscribers);
subscriptionRouter
  .route('/subscribed-channel/:channel')
  .get(getSubscribedChannels);
subscriptionRouter.route('/add-subscription/:channel').get(addSubscription);
subscriptionRouter.route('/un-subscribe-channel/:channel').delete(unSubscribedChannel);

export { subscriptionRouter };
