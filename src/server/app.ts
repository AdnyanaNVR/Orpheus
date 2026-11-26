import express, { type Express, type Request, type Response } from 'express';
import {
  PosError,
  createCheckoutTransaction,
  createProduct,
  createStoreForUser,
  deleteProduct,
  getBootstrap,
  getDashboard,
  listProducts,
  listTransactions,
  loginAccount,
  logoutAccount,
  registerAccount,
  requireStoreContext,
  resolveAuthContext,
  returnTransaction,
  updateProduct,
  updateStoreName,
} from './posRepository.ts';
import type { PaymentMethod, PeriodFilter, RevenueRange } from '../types/pos.ts';

const VALID_PERIODS: PeriodFilter[] = ['Hari Ini', '7 Hari', '30 Hari'];
const VALID_RANGES: RevenueRange[] = ['7 Hari', '30 Hari'];

function handleApiError(res: Response, error: unknown) {
  if (error instanceof PosError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  console.error('Unexpected POS API error:', error);
  return res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
}

export function createPosApiApp(): Express {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Auth routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const body = req.body ?? {};
      const result = await registerAccount({
        email: typeof body.email === 'string' ? body.email : '',
        password: typeof body.password === 'string' ? body.password : '',
        storeName: typeof body.storeName === 'string' ? body.storeName : undefined,
        seedSampleData: body.seedSampleData !== false,
      });
      res.status(201).json(result);
    } catch (error) {
      handleApiError(res, error);
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const body = req.body ?? {};
      const result = await loginAccount({
        email: typeof body.email === 'string' ? body.email : '',
        password: typeof body.password === 'string' ? body.password : '',
      });
      res.json(result);
    } catch (error) {
      handleApiError(res, error);
    }
  });

  app.post('/api/auth/logout', async (req: Request, res: Response) => {
    try {
      await logoutAccount(req.headers.authorization);
      res.json({ ok: true });
    } catch (error) {
      handleApiError(res, error);
    }
  });

  app.get('/api/auth/session', async (req: Request, res: Response) => {
    try {
      const ctx = await resolveAuthContext(req.headers.authorization);
      res.json({ user: ctx.user, store: ctx.store });
    } catch (error) {
      handleApiError(res, error);
    }
  });

  // Create store for authenticated user
  app.post('/api/stores', async (req: Request, res: Response) => {
    try {
      const ctx = await resolveAuthContext(req.headers.authorization);
      const body = req.body ?? {};
      const store = await createStoreForUser(ctx, {
        storeName: typeof body.storeName === 'string' ? body.storeName : '',
        seedSampleData: body.seedSampleData !== false,
      });
      res.status(201).json({ store });
    } catch (error) {
      handleApiError(res, error);
    }
  });

  // Protected POS routes (require verified user + store ownership)
  app.get('/api/bootstrap', async (req: Request, res: Response) => {
    try {
      const ctx = await requireStoreContext(req.headers.authorization);
      const payload = await getBootstrap(ctx);
      res.json(payload);
    } catch (error) {
      handleApiError(res, error);
    }
  });

  app.get('/api/dashboard', async (req: Request, res: Response) => {
    try {
      const ctx = await requireStoreContext(req.headers.authorization);
      const rawPeriod = typeof req.query.period === 'string' ? req.query.period : 'Hari Ini';
      const rawRange = typeof req.query.range === 'string' ? req.query.range : '7 Hari';
      const period: PeriodFilter = VALID_PERIODS.includes(rawPeriod as PeriodFilter)
        ? (rawPeriod as PeriodFilter)
        : 'Hari Ini';
      const range: RevenueRange = VALID_RANGES.includes(rawRange as RevenueRange)
        ? (rawRange as RevenueRange)
        : '7 Hari';

      const dashboard = await getDashboard(ctx, period, range);
      res.json(dashboard);
    } catch (error) {
      handleApiError(res, error);
    }
  });

  app.put('/api/settings', async (req: Request, res: Response) => {
    try {
      const ctx = await requireStoreContext(req.headers.authorization);
      const storeName = typeof req.body?.storeName === 'string' ? req.body.storeName : '';
      const saved = await updateStoreName(ctx, storeName);
      res.json({ storeName: saved });
    } catch (error) {
      handleApiError(res, error);
    }
  });

  app.get('/api/products', async (req: Request, res: Response) => {
    try {
      const ctx = await requireStoreContext(req.headers.authorization);
      const products = await listProducts(ctx);
      res.json({ products });
    } catch (error) {
      handleApiError(res, error);
    }
  });

  app.post('/api/products', async (req: Request, res: Response) => {
    try {
      const ctx = await requireStoreContext(req.headers.authorization);
      const created = await createProduct(ctx, {
        name: typeof req.body?.name === 'string' ? req.body.name : '',
        sellPrice: Number(req.body?.sellPrice),
        costPrice: Number(req.body?.costPrice),
        stock: Number(req.body?.stock),
        category: typeof req.body?.category === 'string' ? req.body.category : undefined,
      });
      res.status(201).json({ product: created });
    } catch (error) {
      handleApiError(res, error);
    }
  });

  app.patch('/api/products/:id', async (req: Request, res: Response) => {
    try {
      const ctx = await requireStoreContext(req.headers.authorization);
      const id = String(req.params.id ?? '');
      const body = req.body ?? {};
      const updated = await updateProduct(ctx, id, {
        name: typeof body.name === 'string' ? body.name : undefined,
        sellPrice: body.sellPrice !== undefined ? Number(body.sellPrice) : undefined,
        costPrice: body.costPrice !== undefined ? Number(body.costPrice) : undefined,
        stock: body.stock !== undefined ? Number(body.stock) : undefined,
        restockDelta: body.restockDelta !== undefined ? Number(body.restockDelta) : undefined,
      });
      res.json({ product: updated });
    } catch (error) {
      handleApiError(res, error);
    }
  });

  app.delete('/api/products/:id', async (req: Request, res: Response) => {
    try {
      const ctx = await requireStoreContext(req.headers.authorization);
      const id = String(req.params.id ?? '');
      await deleteProduct(ctx, id);
      res.json({ ok: true });
    } catch (error) {
      handleApiError(res, error);
    }
  });

  app.get('/api/transactions', async (req: Request, res: Response) => {
    try {
      const ctx = await requireStoreContext(req.headers.authorization);
      const transactions = await listTransactions(ctx);
      res.json({ transactions });
    } catch (error) {
      handleApiError(res, error);
    }
  });

  app.post('/api/transactions', async (req: Request, res: Response) => {
    try {
      const ctx = await requireStoreContext(req.headers.authorization);
      const body = req.body ?? {};
      const result = await createCheckoutTransaction(ctx, {
        items: Array.isArray(body.items) ? body.items : [],
        method: body.method as PaymentMethod,
        discountPercent:
          body.discountPercent !== undefined ? Number(body.discountPercent) : 0,
        paidCash: body.paidCash !== undefined ? Number(body.paidCash) : 0,
      });
      res.status(201).json(result);
    } catch (error) {
      handleApiError(res, error);
    }
  });

  app.post('/api/transactions/:id/return', async (req: Request, res: Response) => {
    try {
      const ctx = await requireStoreContext(req.headers.authorization);
      const id = String(req.params.id ?? '');
      const result = await returnTransaction(ctx, id);
      res.json(result);
    } catch (error) {
      handleApiError(res, error);
    }
  });

  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'Endpoint API tidak ditemukan.' });
  });

  return app;
}
