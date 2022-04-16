import { EntityManager } from 'typeorm';

export interface AppContext {
  manager: EntityManager;
}
