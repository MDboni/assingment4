import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import config from './config';




const app: Application = express();

app.use(cors({
    origin : config.app_url,
    credentials : true,
}))
app.use("/api/v1/subscription/webhook", express.raw({ type: 'application/json' }))

app.use(express.json());
app.use(express.urlencoded({ extended : true }));
app.use(cookieParser())

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

// // Stripe checkout redirect landing endpoints
// app.get('/premium', (req: Request, res: Response) => {
//     res.send({
//         success: req.query.success === 'true',
//         message: req.query.success === 'true'
//             ? 'Payment successful! You now have access to premium content.'
//             : 'Payment not completed.',
//     });
// });

// app.get('/payment', (_req: Request, res: Response) => {
//     res.send({
//         success: false,
//         message: 'Payment was cancelled.',
//     });
// });


// app.use('/api/v1/users', userRoute);
// app.use('/api/v1/auth', authRoute);
// app.use('/api/v1/posts', postRouter);
// app.use('/api/v1/comments', commentRouter); // Assuming you have a commentRouter for comments
// app.use('/api/v1/subscription', subscriptionRouter); // Assuming you have a subscriptionRouter for subscriptions
// app.use('/api/v1/premium', premiumRoutes);
// // 404 handler for unmatched routes
// app.use(notFound);

// // Global error handler (must be the last middleware)
// app.use(globalErrorHandler);


export default app;