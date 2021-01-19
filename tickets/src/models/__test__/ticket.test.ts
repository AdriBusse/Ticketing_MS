import { Ticket } from '../Ticket';

//done invoke manually if test is done
it('implements optimistic concurenncy control', async (done) => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123',
  });

  await ticket.save();

  const firstInst = await Ticket.findById(ticket.id);
  const secondInst = await Ticket.findById(ticket.id);

  firstInst!.set({ price: 10 });
  secondInst!.set({ price: 15 });

  await firstInst!.save();

  //try to save the second. if error occour. And it should  finnish with return
  try {
    await secondInst!.save();
  } catch (err) {
    return done();
  }
  throw new Error('Should not reach this point');
});
it('icrement the version number on multible saves', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 5,
    userId: '123',
  });

  await ticket.save();
  expect(ticket.version).toEqual(0);

  await ticket.save();
  expect(ticket.version).toEqual(1);

  await ticket.save();
  expect(ticket.version).toEqual(2);
});
