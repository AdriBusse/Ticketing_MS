import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../../src/models/Ticket';
import { Order, OrderStatus } from '../../models/Order';
import { NatsWrapper } from '../../NatsWrapper';

it('has a rout that listen to /api/orders for post requests', async () => {
  const res = await request(app).post('/api/orders').send({});
  expect(res.status).not.toEqual(404);
});
it('if not logged in return notAuth', async () => {
  await request(app).post('/api/orders').expect(401);
});
it('if logged it return not 401 but return 400 because no ticket id provided', async () => {
  const res = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({});
  expect(res.status).not.toEqual(401);
  expect(res.status).toEqual(400);
});
it('if ticket cannot be found return 404 (invalid ticketId)', async () => {
  const res = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: new mongoose.Types.ObjectId().toHexString(),
    });
  expect(res.status).toEqual(404);
});

it('can order ticket if it is not reserved', async () => {
  const ticket = await Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 30,
  });
  await ticket.save();
  const res = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id,
    });
  expect(res.status).toEqual(201);

  const savedOrder = await Order.find({});
  expect(savedOrder.length).toEqual(1);
  expect(savedOrder[0].ticket).toEqual(ticket._id);
});

it('fails with 400 if ticket is already reserved(used in other order)', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'newconcert',
    price: 30,
  });
  await ticket.save();
  const order = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket._id,
    })
    .expect(201);

  //order again the same ticket
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket._id,
    })
    .expect(400);
});

it('dont fail if order with same ticked got cancelled', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'newconcert',
    price: 30,
  });
  await ticket.save();

  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + 15 * 60);
  const firstOrder = Order.build({
    userId: 'jhasdiufhdjs',
    status: OrderStatus.Cancelled,
    expiresAt: expiration,
    ticket,
  });
  await firstOrder.save();

  const res = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id,
    })
    .expect(201);

  const allOrders = await Order.find({});

  expect(allOrders.length).toEqual(2);
});
it('emits an event after create an order', async () => {
  const ticket = await Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 30,
  });
  await ticket.save();
  const res = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      ticketId: ticket.id,
    });
  expect(res.status).toEqual(201);

  expect(NatsWrapper.client.publish).toHaveBeenCalled();
});
