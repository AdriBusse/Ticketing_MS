import express, { Request, Response } from 'express';
import { Ticket } from '../models/Ticket';
import { NotFoundError } from '@ticketing_common/common';

const router = express.Router();

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    throw new NotFoundError();
  }
  res.send(ticket);
});

export { router as showTicketRouter };
