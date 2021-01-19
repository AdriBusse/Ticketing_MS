import request from 'supertest';
import { app } from '../../app';

it('response with details about current User', async () => {
  //use global signin function to get a cookie
  const cookie = await global.signin();

  //supertest dont send by default cookie
  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('response with no details if user not signed in', async () => {
  //supertest dont send by default cookie
  const response = await request(app)
    .get('/api/users/currentuser')
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});
