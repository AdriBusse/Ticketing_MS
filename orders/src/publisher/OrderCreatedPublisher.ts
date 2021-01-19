import {
  Publisher,
  OrderCreatedEvent,
  Subjects,
} from '@ticketing_common/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
