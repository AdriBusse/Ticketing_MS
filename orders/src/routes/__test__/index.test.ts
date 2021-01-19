import supertest from 'supertest';
import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket, TicketDoc } from '../../../src/models/Ticket';
import { Order, OrderStatus } from '../../models/Order';

it('returns the orders for a particular user', async () => {
  //create 3 tickets
  const tickets = [];
  tickets[0] = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert 1',
    price: 22,
  });
  await tickets[0].save();
  tickets[1] = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert 2',
    price: 33,
  });
  await tickets[1].save();
  tickets[2] = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert 3',
    price: 44,
  });
  await tickets[2].save();

  //create one order for user 1
  const users1 = global.signin();
  const users2 = global.signin();

  //extract body out of response and safe it as orderOne
  const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', users1)
    .send({ ticketId: tickets[0].id })
    .expect(201);

  //create 2 orders for user 2
  const { body: orderTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', users2)
    .send({ ticketId: tickets[1].id })
    .expect(201);
  const { body: orderThree } = await request(app)
    .post('/api/orders')
    .set('Cookie', users2)
    .send({ ticketId: tickets[2].id })
    .expect(201);
  //make request to get orders for user 2
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', users2)
    .send({})
    .expect(200);

  expect(response.body.length).toEqual(2);
  expect(response.body[0]).toEqual(orderTwo);
  expect(response.body[1]).toEqual(orderThree);
});
