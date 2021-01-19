import {
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from '@ticketing_common/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/Ticket';
import { natsWrapper } from '../../NatsWrapper';
import { TicketUpdatedPublisher } from '../publisher/TicketUpdatedPublisher';
import { queueGroupName } from '../QueueGroupName';

//receive an event. Process it and then publish a new Event
export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(
    data: {
      id: string;
      status: OrderStatus;
      userId: string;
      expiresAt: string;
      version: number;
      ticket: { id: string; price: number };
    },
    msg: Message
  ) {
    //find the ticket that the order is reserved
    const ticket = await Ticket.findById(data.ticket.id);
    //if no ticket throw a error
    if (!ticket) {
      throw new Error('Ticket for reserving not found');
    }
    //Mark ticket as reserved by setting orderId prop
    ticket.set({ orderId: data.id });
    //save to db
    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      price: ticket.price,
      title: ticket.title,
      userId: ticket.userId,
      orderId: ticket.orderId,
      version: ticket.version,
    });

    //ack
    msg.ack();
  }
}
