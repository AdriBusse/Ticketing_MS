import { OrderCreatedEvent, OrderStatus } from '@ticketing_common/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/Order';
import { natsWrapper } from '../../../NatsWrapper';
import { OrderCreatedListener } from '../OrderCreatedListener';

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: 'jdsfsdkf',
    userId: 'dfjks',
    status: OrderStatus.Created,
    ticket: {
      id: 'jidfs',
      price: 10,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('saves the order info', async () => {
  const { listener, msg, data } = await setup();

  await listener.onMessage(data, msg);

  const order = await Order.findById(data.id);
  expect(order!.price).toEqual(data.ticket.price);
});
it('ack the message', async () => {
  const { listener, msg, data } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
