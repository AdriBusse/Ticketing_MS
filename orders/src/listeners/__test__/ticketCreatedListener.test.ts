import { TicketCreatedListener } from '../TicketCreatedListener';
import { NatsWrapper } from '../../NatsWrapper';
import { TicketCreatedEvent } from '@ticketing_common/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/Ticket';
const setup = async () => {
  //create an instance of the listener
  const listener = new TicketCreatedListener(NatsWrapper.client);
  //create a fake data event
  const data: TicketCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: 'concert',
    price: 20,
    userId: new mongoose.Types.ObjectId().toHexString(),
  };
  //create fake msg obj
  //that you dont need to mock/impl all methods of Message
  // @ts-ignore
  const msg: Message = {
    // real function but just mock function
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('CListener create and save a ticket', async () => {
  const { listener, data, msg } = await setup();

  // call the onMessage function with object and message obj
  await listener.onMessage(data, msg);
  //write assertion to check if ticket is created

  const ticket = await Ticket.findById(data.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual(data.title);
  expect(ticket!.price).toEqual(data.price);
});

it('C ack the message', async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage function with object and message obj
  await listener.onMessage(data, msg);

  //write assertin to check ack
  expect(msg.ack).toHaveBeenCalled();
});
