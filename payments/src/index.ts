import mongoose from 'mongoose';
import { app } from './app';
import { OrderCancelledListener } from './events/Listeners/OrderCancelledListener';
import { OrderCreatedListener } from './events/Listeners/OrderCreatedListener';

import { natsWrapper } from './NatsWrapper';
const start = async () => {
  console.log(`lets goooc`);

  if (!process.env.JWT_KEY) {
    throw new Error('JWT key not defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('Mongo URI must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('Nats URL must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error(' NATS_CLIENT_ID must be defined');
  }
  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    //gracefull shutdown from nats
    natsWrapper.client.on('close', () => {
      console.log(`nats connection closed`);
      process.exit();
    });
    //close connection before process finnished
    process.on('SIGINT', () => {
      natsWrapper.client.close();
    });
    process.on('SIGTERM', () => {
      natsWrapper.client.close();
    });
    //connect to auth-db-srv and create the "auth" table
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('connect to mongo');
  } catch (err) {
    console.error(err);
  }
  new OrderCancelledListener(natsWrapper.client).listen();
  new OrderCreatedListener(natsWrapper.client).listen();

  app.listen(3000, () => {
    console.log('Listen on Port 3000..');
  });
};

start();
