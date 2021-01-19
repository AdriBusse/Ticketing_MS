import request from 'supertest';
import { app } from '../../app';
//sometimes jest dont work well with TS

it('returns a 201 on successfull signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      //request body
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);
});

it('returns a 400 with invalid email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      //request body
      email: 'testtest.com',
      password: 'password',
    })
    .expect(400);
});

it('returns a 400 with invalid password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      //request body
      email: 'test@test.com',
      password: '123',
    })
    .expect(400);
});

it('returns a 400 with no password and email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      //request body
    })
    .expect(400);
});

it('returns a 400 with no password or email', async () => {
  //one test with 2 checks
  await request(app)
    .post('/api/users/signup')
    .send({
      //request body
      password: '12345',
    })
    .expect(400);

  return request(app)
    .post('/api/users/signup')
    .send({
      //request body
      email: 'test@test.de',
    })
    .expect(400);
});

it('disallowed duplicated emails', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      //request body
      email: 'adri@test.com',
      password: 'password',
    })
    .expect(201);

  await request(app)
    .post('/api/users/signup')
    .send({
      //request body
      email: 'adri@test.com',
      password: 'password',
    })
    .expect(400);
});

it('set a cookie after signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      //request body
      email: 'test@test.com',
      password: 'password',
    })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});
