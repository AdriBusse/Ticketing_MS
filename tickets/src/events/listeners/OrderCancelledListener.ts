import {
  Listener,
  OrderCancelledEvent,
  Subjects,
} from '@ticketing_common/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/Ticket';
import { TicketUpdatedPublisher } from '../publisher/TicketUpdatedPublisher';
import { queueGroupName } from '../QueueGroupName';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;
  async onMessage(
    data: { id: string; version: number; ticket: { id: string } },
    msg: Message
  ) {
    const ticket = await Ticket.findById(data.ticket.id);

    if (!ticket) {
      throw new Error('Ticket for Order Canceled Event not found');
    }
    ticket.set({ orderId: undefined });
    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      orderId: ticket.orderId,
      userId: ticket.userId,
      price: ticket.price,
      title: ticket.title,
      version: ticket.version,
    });
    msg.ack();
  }
}
