import { Request, Response } from 'express';
import financialService from '../services/FinancialService';
import statusManagementService from '../services/StatusManagementService';
import { IAuthRequest } from '../middlewares/authMiddleware';

/**
 * Interface que estende IAuthRequest para incluir a propriedade file
 * usada pelo middleware de upload (como o Multer)
 */
interface IFileAuthRequest extends IAuthRequest {
  file?: {
    filename: string;
    [key: string]: any;
  };
}

/**
 * O FinancialController lida com as requisições HTTP para a rota /financial.
 * Os métodos aceitam o 'Request' padrão do Express e convertem para 'IAuthRequest'
 * ou 'IFileAuthRequest' internamente, garantindo compatibilidade de tipos.
 */
export class FinancialController {
  
  /**
   * Obtém um resumo dos dados financeiros
   */
  getFinancialSummary = async (req: Request, res: Response): Promise<Response> => {
    const summary = await financialService.getFinancialSummary();
    return res.status(200).json(summary);
  };

  /**
   * Obtém todos os dados financeiros
   */
  getAllFinancialData = async (req: Request, res: Response): Promise<Response> => {
    const financialData = await financialService.getAllFinancialData();
    return res.status(200).json(financialData);
  };

  /**
   * Obtém dados financeiros de uma diligência específica
   * Nota: No serviço, este método só aceita o parâmetro diligenceId
   */
  getFinancialDataByDiligence = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    const { id: diligenceId } = req.params;
    
    // Aqui estamos passando apenas o diligenceId conforme a assinatura do método no serviço
    const financialData = await financialService.getFinancialDataByDiligence(diligenceId);
    
    // Se você precisar filtrar os dados com base no userId ou userRole, faça isso aqui após receber os dados
    // Exemplo (pseudocódigo):
    // const { id: userId, role: userRole } = authRequest.user;
    // const filteredData = userRole === 'admin' 
    //   ? financialData 
    //   : financialData.filter(item => item.userId === userId);
    
    return res.status(200).json(financialData);
  };

  /**
   * Envia comprovante de pagamento para uma diligência
   */
  submitPaymentProof = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IFileAuthRequest;
    const { diligenceId } = req.params;
    const { pixKey, amount } = req.body;
    const { id: userId } = authRequest.user;
    
    // Usando a interface IFileAuthRequest para acessar a propriedade file
    const proofImage = authRequest.file 
      ? `/uploads/${authRequest.file.filename}` 
      : "https://example.com/proof-image.jpg";

    const paymentProof = await financialService.submitPaymentProof(
      diligenceId, 
      pixKey, 
      proofImage, 
      amount, 
      userId
    );
    
    return res.status(201).json(paymentProof);
  };

  /**
   * Verifica um comprovante de pagamento (aprovação/rejeição)
   */
  verifyPaymentProof = async (req: Request, res: Response): Promise<Response> => {
    const authRequest = req as IAuthRequest;
    const { proofId } = req.params;
    const { isApproved, rejectionReason } = req.body;
    const { id: adminId } = authRequest.user;

    const result = await financialService.verifyPaymentProof(
      proofId, 
      isApproved, 
      adminId, 
      rejectionReason
    );
    
    return res.status(200).json(result);
  };
}

export default new FinancialController();