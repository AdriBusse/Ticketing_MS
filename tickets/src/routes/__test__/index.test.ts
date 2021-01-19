import request from 'supertest';
import { app } from '../../app';

const createTicket = (title: string, price: number) => {
  return request(app).post('/api/tickets').set('Cookie', global.signin()).send({
    title,
    price,
  });
};
it('returns a list of tickets', async () => {
  await createTicket('2Pac', 30);
  await createTicket('Concert', 10);
  await createTicket('Comedy', 30);
  await createTicket('StandUp', 30);

  const response = await request(app).get('/api/tickets').send().expect(200);

  expect(response.body.length).toEqual(4);
});
