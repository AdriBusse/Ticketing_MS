import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from '@ticketing_common/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
