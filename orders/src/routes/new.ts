import express, { Request, Response } from 'express';
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from '@ticketing_common/common';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import { Ticket } from '../models/Ticket';
import { Order } from '../models/Order';
import { OrderCreatedPublisher } from '../publisher/OrderCreatedPublisher';
import { NatsWrapper } from '../NatsWrapper';

const EXPIRATION_WINDOW_SECONDS = 1 * 60;
const router = express.Router();

router.post(
  '/api/orders',
  requireAuth,
  [
    body('ticketId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('TicketId must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    //Find the ticket in db
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    //Make sure the ticket is not reserved yet
    //run query to look at all orders. Find an order where the ticket
    //is the same we just found #and# the order status is #not# cancelled
    //If we find an order like this it means the ticket is reserved already
    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved');
    }
    //calculate the expiration date for order
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);
    //Build the order and save it to the database
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      ticket,
    });
    await order.save();
    //Publish an event
    new OrderCreatedPublisher(NatsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      version: order.version,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });
    res.status(201).send(order);
  }
);

export { router as createOrderRouter };
