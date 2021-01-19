import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';
import jwt from 'jsonwebtoken';

//modify that global has property function(signin)
declare global {
  namespace NodeJS {
    interface Global {
      signin(id?: string): string[];
    }
  }
}

//because we cannt make use of our nats server from cluster
//we need to mock/fake it
//it will watch if this file gets imported and change it with the mock file
jest.mock('../NatsWrapper.ts');
let mongo: any;
beforeAll(async () => {
  process.env.JWT_KEY = 'asdf';
  mongo = new MongoMemoryServer();
  const mongoURI = await mongo.getUri();

  await mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();

  jest.clearAllMocks();
});

//global funktion. access from everywhere in test
global.signin = (id?: string) => {
  //build jwt payload. {id,email}
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };
  //create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);
  //build session object {jwt: my_jwt}
  const session = { jwt: token };
  //turn that session into JSON
  const sessionJson = JSON.stringify(session);
  //take json and encode it as base64
  const base64 = Buffer.from(sessionJson).toString('base64');
  //return string with cookie data
  return [`express:sess=${base64}`];
};
