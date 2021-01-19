import express from 'express';
//handles error if they throw in async function
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import cors from 'cors';

import {
  errorHandler,
  currentUser,
  NotFoundError,
} from '@ticketing_common/common';

import { createOrderRouter } from './routes/new';
import { orderDetailRouter } from './routes/show';
import { indexOrderRouter } from './routes/index';
import { deleteOrderRouter } from './routes/delete';

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

app.use(createOrderRouter);
app.use(orderDetailRouter);
app.use(indexOrderRouter);
app.use(deleteOrderRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
