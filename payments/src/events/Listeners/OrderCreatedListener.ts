import {
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from '@ticketing_common/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/Order';
import { queueGroupName } from './QueueGroupname';

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
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      version: data.version,
      userId: data.userId,
      status: data.status,
    });
    await order.save();

    await msg.ack();
  }
}
