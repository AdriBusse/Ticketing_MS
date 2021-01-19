import {
  Publisher,
  TicketUpdatedEvent,
  Subjects,
} from '@ticketing_common/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
