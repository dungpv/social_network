import { NextFunction, Request, Response, response } from 'express';

import { DataStoredInToken } from './../../modules/auth/auth.interface';
import jwt from 'jsonwebtoken';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('x-auth-token');

  if (!token)
    return res.status(401).json({ message: 'No token, authorization denied.' });

  try {
    const user = jwt.verify(
      token,
      process.env.JWT_TOKEN_SECRET!
    ) as DataStoredInToken;

    if (!req.user) req.user = { id: '' };

    req.user.id = user.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default authMiddleware;