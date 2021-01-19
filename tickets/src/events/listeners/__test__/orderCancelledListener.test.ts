import { OrderCancelledEvent, OrderStatus } from '@ticketing_common/common';
import { Ticket } from '../../../models/Ticket';
import { natsWrapper } from '../../../NatsWrapper';
import mongoose from 'mongoose';
import { OrderCancelledListener } from '../OrderCancelledListener';

const setup = async () => {
  //instance of Listener
  const listener = new OrderCancelledListener(natsWrapper.client);
  //create and save a Ticket
  const orderId = mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: 'asdf',
  });
  ticket.set({ orderId });
  await ticket.save();

  //create fake data event
  const data: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  //mock Message type
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it('updated the ticket, publish a event and ack the message', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).not.toBeDefined();

  expect(msg.ack).toHaveBeenCalled();

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
