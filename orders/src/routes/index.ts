import { currentUser, requireAuth } from '@ticketing_common/common';
import express, { Request, Response } from 'express';
import { Order } from '../models/Order';

const router = express.Router();

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
  //populate fetch the ticket data from ticket property
  const orders = await Order.find({ userId: req.currentUser!.id }).populate(
    'ticket'
  );

  res.send(orders);
});

export { router as indexOrderRouter };
