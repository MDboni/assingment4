import dotenv from "dotenv";
import path from "path";


dotenv.config({path: path.join(process.cwd(), ".env")});

export default {
    node_env : process.env.NODE_ENV || "development",
    is_production : process.env.NODE_ENV === "production",
    port : process.env.PORT || 5000,
    database_url : process.env.DATABASE_URL,
    app_url : process.env.APP_URL,
    bcrypt_salt_rounds : process.env.BCRYPT_SALT_ROUNDS || 12,
    jwt_access_secret : process.env.JWT_ACCESS_SECRET!,
    jwt_refresh_secret : process.env.JWT_REFRESH_SECRET!,
    jwt_access_expires_in : process.env.JWT_ACCESS_EXPIRES_IN!,
    jwt_refresh_expires_in : process.env.JWT_REFRESH_EXPIRES_IN!,
    stripe_product_price_id : process.env.STRIPE_PRODUCT_PRICE_ID!,
    stripe_secret_key : process.env.STRIPE_SECRET_KEY!,
    stripe_webhook_secret : process.env.STRIPE_WEBHOOK_SECRET!,
    stripe_success_url : process.env.STRIPE_SUCCESS_URL || "http://localhost:5000/payment/success",
    stripe_cancel_url : process.env.STRIPE_CANCEL_URL || "http://localhost:5000/payment/cancel",
    payment_currency : process.env.PAYMENT_CURRENCY || "USD"
}