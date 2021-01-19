import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from '@ticketing_common/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
