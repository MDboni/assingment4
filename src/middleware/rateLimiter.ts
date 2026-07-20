import rateLimit from "express-rate-limit";

// Brute-force ঠেকাতে login/register-এ সীমা
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 30,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
        success: false,
        statusCode: 429,
        message: "Too many attempts, please try again after 15 minutes",
        errorDetails: [],
    },
});
