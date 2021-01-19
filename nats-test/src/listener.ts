import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketUpdatedListener } from './events/TicketUpdatedListener';

const stan = nats.connect('ticketing', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222',
});
stan.on('connect', () => {
  console.log('connected');

  stan.on('close', () => {
    console.log(`nats connection closed`);
    process.exit();
  });

  new TicketUpdatedListener(stan).listen();
});

//close connection before process finnished
process.on('SIGINT', () => {
  stan.close();
});
process.on('SIGTERM', () => {
  stan.close();
});
