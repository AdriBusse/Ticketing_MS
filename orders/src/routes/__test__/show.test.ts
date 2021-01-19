import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/Ticket';
import mongoose from 'mongoose';

it('fetch the order', async () => {
  const user = global.signin();
  //create a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();
  //make request to build the order with the ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  //make request to fetch the order
  const res = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send({})
    .expect(200);

  expect(res.body).toEqual(order);
});

it('dont show order details from differerent users', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  //make request to build the order with the ticket
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  //make request to fetch the order
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.signin())
    .send({})
    .expect(401);
});
