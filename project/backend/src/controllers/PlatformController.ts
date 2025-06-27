import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../entities/User';
import { Diligence } from '../entities/Diligence';
import { Payment } from '../entities/Payment';

export class PlatformController {
  
  async getAnalytics(req: Request, res: Response): Promise<Response> {
    const userRepository = getRepository(User);
    const diligenceRepository = getRepository(Diligence);
    const paymentRepository = getRepository(Payment);

    // Cálculos podem ser otimizados com queries mais complexas
    const totalDiligences = await diligenceRepository.count();
    const completedDiligences = await diligenceRepository.count({ where: { status: 'completed' } });
    
    const activeCorrespondents = await userRepository.count({ 
      where: { role: 'correspondent', status: 'active' }
    });
    
    const activeClients = await userRepository.count({
      where: { role: 'client', status: 'active' }
    });

    const totalRevenueResult = await paymentRepository
      .createQueryBuilder("payment")
      .select("SUM(payment.amount)", "total")
      .where("payment.status = :status", { status: 'completed' })
      .getRawOne();
      
    const totalRevenue = totalRevenueResult.total || 0;

    const analytics = {
      totalDiligences,
      activeCorrespondents,
      activeClients,
      totalRevenue: parseFloat(totalRevenue),
      completionRate: totalDiligences > 0 ? (completedDiligences / totalDiligences) * 100 : 0,
    };

    return res.status(200).json(analytics);
  }
}
