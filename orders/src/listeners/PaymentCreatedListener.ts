import {
  Listener,
  OrderStatus,
  PaymentCreatedEvent,
  Subjects,
} from '@ticketing_common/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../models/Order';
import { QueueGroupName } from './QueueGroupNames';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  readonly queueGroupName = QueueGroupName;
  async onMessage(
    data: { id: string; orderId: string; stripeId: string },
    msg: Message
  ) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error('Order not found');
    }
    order.set({
      status: OrderStatus.Complete,
    });

    await order.save();

    msg.ack();
  }
}
