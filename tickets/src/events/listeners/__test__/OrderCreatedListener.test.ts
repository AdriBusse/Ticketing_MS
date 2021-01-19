import { OrderCreatedEvent, OrderStatus } from '@ticketing_common/common';
import { Mongoose } from 'mongoose';
import { Ticket } from '../../../models/Ticket';
import { natsWrapper } from '../../../NatsWrapper';
import { OrderCreatedListener } from '../OrderCreatedListener';

const setup = async () => {
  //instance of Listener
  const listener = new OrderCreatedListener(natsWrapper.client);
  //create and save a Ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: 'asdf',
  });
  await ticket.save();

  //create ffake data event
  const data: OrderCreatedEvent['data'] = {
    id: 'asdf',
    status: OrderStatus.Created,
    userId: 'asdf123',
    expiresAt: 'asdfgh',
    version: 0,
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  //mock Message type
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it('sets the userId from ticket', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});
it('acks the message', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes a tickt updated event', async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  //that TS know this is a Mock function
  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
