import mongoose from 'mongoose';
import { Password } from '../services/password';

//an inerface that describe the property that are required to create a User
interface UserAttr {
  email: string;
  password: string;
}
//an interface that describes the properties that a user model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attr: UserAttr): UserDoc;
}

//describe which properties a single user has(Document)
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  updatedAt: string;
  createdAt: string;
}

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  //functions to modify what will come back if we stringify a User
  //view level logic
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

//middleware which is executed before saving
//done is for execute async manually
//document which is safed refer with this
UserSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

//to envolve TS. Here we can check in param attr that the right attributes given
//add a funktion to the user model
UserSchema.statics.build = (attr: UserAttr) => {
  return new User(attr);
};

//crazy code that mongoose and ts work together

const User = mongoose.model<UserDoc, UserModel>('User', UserSchema);

export { User };
