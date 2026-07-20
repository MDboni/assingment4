import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import config from './config';
import { authRoute } from './modules/auth/auth.routes';
import { globalErrorHandler } from './middleware/globalErrorHandler';
import { notFound } from './middleware/notFound';
import { categoryRoute } from './modules/category/category.routes';
import { propertyRoute } from './modules/property/property.routes';
import { landlordRoute } from './modules/landlord/landloard.route';
import { rentalRoute } from './modules/rental/rental.route';
import { paymentRoute } from './modules/payment/payment.route';




const app: Application = express();

app.use(cors({
    origin : config.app_url,
    credentials : true,
}))

app.use("/api/payments/confirm", express.raw({ type: 'application/json' }))

app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(cookieParser())

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});


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



app.use('/api/auth', authRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/properties', propertyRoute);
app.use('/api/landlord', landlordRoute);
app.use('/api/rentals', rentalRoute);
app.use('/api/payments', paymentRoute);


// 404 handler for unmatched routes
app.use(notFound);

// Global error handler (must be the last middleware)
app.use(globalErrorHandler);


export default app;