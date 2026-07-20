import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

export const validateRequest = (schema: ZodType) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const parsed = await schema.parseAsync({ body: req.body });
            req.body = (parsed as { body: unknown }).body;
            next();
        } catch (error) {
            next(error);
        }
    };
};
