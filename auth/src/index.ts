import mongoose from 'mongoose';
import { app } from './app';
const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT key not defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MongoUri env not defined');
  }
  try {
    //connect to auth-db-srv and create the "auth" table
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('connect to mongo');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Listen on Port 3000..');
  });
};

start();
