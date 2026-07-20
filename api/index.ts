// Vercel serverless entry point।
// Vercel-এ app.listen() চলে না — Express app টাই handler হিসেবে export করতে হয়।
// Local development-এ src/server.ts ব্যবহার হয় (npm run dev)।
import app from "../src/app";

export default app;
