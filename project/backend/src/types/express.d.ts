// backend/src/types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: 'admin' | 'client' | 'correspondent';
        name: string;
        status: 'active' | 'pending' | 'inactive' | 'suspended';
        verified?: boolean;
      };
    }
  }
}

export {};