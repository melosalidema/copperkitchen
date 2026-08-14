import { Router } from 'express';
import { publicRouter } from './public.js';
import { adminRouter } from './admin/index.js';

export const apiRouter: Router = Router();

apiRouter.use(publicRouter);
apiRouter.use('/admin', adminRouter);
