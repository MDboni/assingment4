import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config';
import { prisma } from './lib/prisma';
import { authLimiter } from './middleware/rateLimiter';
import { authRoute } from './modules/auth/auth.routes';
import { globalErrorHandler } from './middleware/globalErrorHandler';
import { notFound } from './middleware/notFound';
import { categoryRoute } from './modules/category/category.routes';
import { propertyRoute } from './modules/property/property.routes';
import { landlordRoute } from './modules/landlord/landloard.route';
import { rentalRoute } from './modules/rental/rental.route';
import { paymentRoute } from './modules/payment/payment.route';
import { reviewRoute } from './modules/review/review.route';
import { adminRoute } from './modules/admin/admin.route';
import { userRoute } from './modules/user/user.route';




const app: Application = express();

app.disable('x-powered-by');
app.use(helmet());
app.use(compression());

if (config.node_env !== 'production') {
    app.use(morgan('dev'));
}

app.use(cors({
    origin : config.app_url,
    credentials : true,
}))

// Stripe webhook-এ signature verify করতে raw body লাগে,
// তাই express.json()-এর আগেই এটা বসাতে হবে
app.use("/api/payments/confirm", express.raw({ type: 'application/json' }))

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended : true }));
app.use(cookieParser())

app.get('/', (_req: Request, res: Response) => {
    res.send({
        success: true,
        message: 'RentNest API is running',
        documentation: '/api',
    });
});

// Deployment health check
app.get('/health', async (_req: Request, res: Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: 'healthy', database: 'connected' });
    } catch {
        res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
    }
});

// Stripe checkout redirect landing endpoints।

app.get('/payment/success', (req: Request, res: Response) => {
    res.send({
        success: true,
        message: 'Payment received. Your rental will be activated once Stripe confirms it.',
        sessionId: req.query.session_id ?? null,
    });
});

app.get('/payment/cancel', (_req: Request, res: Response) => {
    res.send({
        success: false,
        message: 'Payment was cancelled.',
    });
});



app.use('/api/auth', authLimiter, authRoute);
app.use('/api/users', userRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/properties', propertyRoute);
app.use('/api/landlord', landlordRoute);
app.use('/api/rentals', rentalRoute);
app.use('/api/payments', paymentRoute);
app.use('/api/reviews', reviewRoute);
app.use('/api/admin', adminRoute);


// 404 handler for unmatched routes
app.use(notFound);

// Global error handler (must be the last middleware)
app.use(globalErrorHandler);


export default app;
