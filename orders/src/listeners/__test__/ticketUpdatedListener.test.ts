import { TicketUpdatedListener } from '../TicketUpdatedListener';
import { NatsWrapper } from '../../NatsWrapper';
import { TicketUpdatedEvent } from '@ticketing_common/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/Ticket';
const setup = async () => {
  //create an instance of the listener
  const listener = new TicketUpdatedListener(NatsWrapper.client);
  //save a ticket to DB which will be modified
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  //create a fake data event
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'Karate Andi concert',
    price: 25,
    userId: 'asdf1234',
  };
  //create fake msg obj
  //that you dont need to mock/impl all methods of Message
  // @ts-ignore
  const msg: Message = {
    // real function but just mock function
    ack: jest.fn(),
  };

  return { listener, data, msg, ticket };
};

it('UListener find and update the ticket', async () => {
  const { listener, data, msg, ticket } = await setup();

  // call the onMessage function with object and message obj
  await listener.onMessage(data, msg);
  //write assertion to check if ticket is created

  const ticketInDB = await Ticket.findById(ticket.id);

  expect(ticketInDB).toBeDefined();
  expect(ticketInDB!.title).toEqual(data.title);
  expect(ticketInDB!.price).toEqual(data.price);
});

it('Uack the message', async () => {
  const { listener, data, msg } = await setup();
  // call the onMessage function with object and message obj
  await listener.onMessage(data, msg);

  //write assertin to check ack
  expect(msg.ack).toHaveBeenCalled();
});

it('UListener didnt hit ack if the event is out of order', async () => {
  const { listener, data, msg, ticket } = await setup();
  //invalid order of versions
  data.version = 5;
  // call the onMessage function with object and message obj
  //wrap it because the thrown error whould chrash test suite
  //do with all thrown errors
  try {
    await listener.onMessage(data, msg);
  } catch (err) {}
  //write assertion to check if ticket is created

  const ticketInDB = await Ticket.findById(ticket.id);

  expect(msg.ack).not.toHaveBeenCalled();
});
