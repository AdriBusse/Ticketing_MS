import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';

import { BadRequestError } from '@ticketing_common/common';

import { validateRequest } from '@ticketing_common/common';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    //after validation there will me a new param in body -> validationResult
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 Chars'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    //check if User email exist already
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError('Email in use already');
      return res.send({});
    }

    const user = User.build({ email, password });
    await user.save();

    //Generate JWT
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },

      //in this file TS dont know if JWS_TOKEN exist. Even we check it in the start method
      //! prevent it
      process.env.JWT_KEY!
    );

    //store it in session Object
    //this syntax because ts dont have jwt prop
    req.session = { jwt: userJwt };

    res.status(201).send(user);
  }
);

export { router as signupRouter };
