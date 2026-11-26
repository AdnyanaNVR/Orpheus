import 'dotenv/config';
import { createPosApiApp } from '../src/server/app.ts';

const app = createPosApiApp();

export default app;
