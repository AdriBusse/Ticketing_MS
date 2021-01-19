import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { validateRequest } from '@ticketing_common/common';
import { BadRequestError } from '@ticketing_common/common';
import { Password } from '../services/password';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valide'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('You must supply a Password'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError('Invalid Credentials');
    }
    const pwMatch = await Password.compare(existingUser.password, password);
    if (!pwMatch) {
      throw new BadRequestError('Invalid Credentials');
    }
    //Generate JWT
    const userJwt = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
      },

      //in this file TS dont know if JWS_TOKEN exist. Even we check it in the start method
      //! prevent it
      process.env.JWT_KEY!
    );

    //store it in session Object
    //this syntax because ts dont have jwt prop
    req.session = { jwt: userJwt };
    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
