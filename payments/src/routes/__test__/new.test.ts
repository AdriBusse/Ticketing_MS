import { OrderStatus } from '@ticketing_common/common';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/Order';
import { Payment } from '../../models/Payment';
import { stripe } from '../../stripe';

jest.mock('../../stripe');
it('return 404 when purchasing a order which not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'dfjs',
      orderId: mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});
it('return 401 when purchasing a order that doesnt belong to user', async () => {
  const order = await Order.build({
    userId: mongoose.Types.ObjectId().toHexString(),
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  }).save();
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({
      token: 'dfjs',
      orderId: order.id,
    })
    .expect(401);
});
it('return 400 when purchasing a cancelled order', async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  //const user=global.signin(userId)
  const order = await Order.build({
    userId,
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Cancelled,
  }).save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'dfjs',
      orderId: order.id,
    })
    .expect(400);
});

it('returns a 201 with valid inputs', async () => {
  const userId = mongoose.Types.ObjectId().toHexString();
  //const user=global.signin(userId)
  const order = await Order.build({
    userId,
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 20,
    status: OrderStatus.Created,
  }).save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201);

  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];

  expect(chargeOptions.source).toEqual('tok_visa');
  expect(chargeOptions.amount).toEqual(20 * 100);
  expect(chargeOptions.currency).toEqual('usd');
});
