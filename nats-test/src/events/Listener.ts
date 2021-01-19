import { Message, Stan } from 'node-nats-streaming';
import { Subjects } from './Subjects';

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event> {
  private client: Stan;
  protected ackWait = 5 * 1000; //5s

  abstract subject: T['subject'];
  abstract queueGroupName: string;
  abstract onMessage(parsedData: T['data'], msg: Message): void;

  constructor(client: Stan) {
    this.client = client;
  }

  subscribtionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queueGroupName);
  }

  listen() {
    const subscribtion = this.client.subscribe(
      this.subject,
      this.queueGroupName,
      this.subscribtionOptions()
    );
    subscribtion.on('message', (msg: Message) => {
      console.log(`message received: ${this.subject} / ${this.queueGroupName}`);
      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === 'string'
      ? JSON.parse(data)
      : JSON.parse(data.toString('utf8'));
  }
}
