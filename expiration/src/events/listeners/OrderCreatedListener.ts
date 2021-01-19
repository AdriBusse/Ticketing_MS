import {
  Listener,
  OrderCreatedEvent,
  OrderStatus,
  Subjects,
} from '@ticketing_common/common';
import { Message } from 'node-nats-streaming';
import { expirationQueue } from '../../queues/expirationQueue';
import { queueGroupName } from './QueueGroupName';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    //time when ticket expired - aktual time ~ 15min
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log(`waiting for ${delay} seconds to process the ticket`);

    await expirationQueue.add(
      {
        orderId: data.id,
      },
      { delay }
    );
    msg.ack();
  }
}
