import express from 'express';
//handles error if they throw in async function
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';

import { errorHandler, currentUser } from '@ticketing_common/common';
import { createChargeRouter } from './routes/new';

const app = express();
//Ingress is a proxy
app.set('trust proxy', true);
app.use(json());
app.use(cors());
app.use(
  cookieSession({
    signed: false,
    //cookie just send over https request
    //test env is not https
    secure: process.env.NODE_ENV !== 'test',
  })
);

app.use(currentUser);

app.use(createChargeRouter);
app.all('*', async (req, res) => {
  throw new Error('Page not found');
  res.status(404);
});

app.use(errorHandler);

export { app };
