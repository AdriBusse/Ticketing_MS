import mongoose from 'mongoose';
import { app } from './app';
import { NatsWrapper } from './NatsWrapper';
import { TicketCreatedListener } from './listeners/TicketCreatedListener';
import { TicketUpdatedListener } from './listeners/TicketUpdatedListener';
import { ExpirationCompleteListener } from './listeners/ExpirationCompleteListener';
import { PaymentCreatedListener } from './listeners/PaymentCreatedListener';
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
    await NatsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    //gracefull shutdown from nats
    NatsWrapper.client.on('close', () => {
      console.log(`nats connection closed`);
      process.exit();
    });
    //close connection before process finnished
    process.on('SIGINT', () => {
      NatsWrapper.client.close();
    });
    process.on('SIGTERM', () => {
      NatsWrapper.client.close();
    });

    //listen for Events
    new TicketCreatedListener(NatsWrapper.client).listen();
    new TicketUpdatedListener(NatsWrapper.client).listen();
    new ExpirationCompleteListener(NatsWrapper.client).listen();
    new PaymentCreatedListener(NatsWrapper.client).listen();

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

  app.listen(3000, () => {
    console.log('Listen on Port 3000..');
  });
};

start();
