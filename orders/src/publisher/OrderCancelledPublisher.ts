import {
  Publisher,
  OrderCancelledEvent,
  Subjects,
} from '@ticketing_common/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
