import {
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
} from '@ticketing_common/common';
import express, { Request, Response } from 'express';
import { Order, OrderStatus } from '../models/Order';
import { OrderCancelledPublisher } from '../publisher/OrderCancelledPublisher';
import { NatsWrapper } from '../NatsWrapper';

const router = express.Router();

router.delete(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('ticket');
    if (!order) {
      throw new NotFoundError();
    }
    if (order.userId != req.currentUser!.id) {
      throw new NotAuthorizedError();
    }
    order.status = OrderStatus.Cancelled;
    await order.save();
    new OrderCancelledPublisher(NatsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });
    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
