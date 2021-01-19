import Queue from 'bull';
import { ExpirationCompletePublisher } from '../events/publishers/ExpirationCompletePublisher';
import { natsWrapper } from '../NatsWrapper';

//interface for the data we store in redis
interface Payload {
  orderId: string;
}
//<Payload> just that we can use it better with TS
const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: job.data.orderId,
  });
  console.log(
    `I want to publish an expiration:complete event for orderId ${job.data.orderId}`
  );
});

export { expirationQueue };
