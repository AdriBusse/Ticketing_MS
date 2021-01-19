import { Message } from 'node-nats-streaming';
import { Listener } from './Listener';
import { TicketUpdatedEvent } from './TicketUpdatedEvent';
import { Subjects } from './Subjects';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
  queueGroupName = 'payments-service';

  onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    console.log(`Event data `, data);
    msg.ack();
  }
}
