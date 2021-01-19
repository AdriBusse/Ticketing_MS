import mongoose from 'mongoose';
import { Order, OrderStatus } from './Order';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  //That TS know a doc has version. We renamed it from __v
  version: number;
  isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByIdAndPrevVersion(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}

const TicketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

TicketSchema.set('versionKey', 'version');
TicketSchema.plugin(updateIfCurrentPlugin);
TicketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};
TicketSchema.statics.findByIdAndPrevVersion = (event: {
  id: string;
  version: number;
}) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

//Make sure the ticket is not reserved yet
//run query to look at all orders. Find an order where the ticket
//is the same we just found #and# the order status is #not# cancelled
//If we find an order like this it means the ticket is reserved already

//use on specific ticket
// this is better to use in function than in arrow function
TicketSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      //mongoose operation that looks if there is a order with one of this status
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });
  //returns 0|1 depend if ticket is already in use
  return existingOrder ? 1 : 0;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', TicketSchema);

export { Ticket };
