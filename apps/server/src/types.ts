import { Request, Response } from 'express';
import session from 'express-session';
import { EntityManager } from 'typeorm';

export interface AppContext {
  manager: EntityManager;
  req: Request & {
    session: session.Session &
      Partial<session.SessionData> & { userId: string };
  }; // & { session: Session & Partial<SessionData> };
  res: Response;
}
