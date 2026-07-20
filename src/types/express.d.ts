import { TJwtPayload } from "../utils/jwt";

declare global {
    namespace Express {
        interface Request {
            user?: TJwtPayload;
        }
    }
}

export {};
