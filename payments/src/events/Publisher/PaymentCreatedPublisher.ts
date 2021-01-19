import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from '@ticketing_common/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
