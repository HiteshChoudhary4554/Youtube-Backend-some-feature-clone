import { Router } from 'express';
import { healthcheck } from '../controllers/healthcheck.controller.js';

const healthcheckRouter = Router();
healthcheckRouter.route('/health-check-path').get(healthcheck);

export { healthcheckRouter };
