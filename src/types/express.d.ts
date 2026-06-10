// src/types/express.d.ts

declare namespace Express {
    export interface User {
        id: number;
        email: string;
        role: string;
    }
}