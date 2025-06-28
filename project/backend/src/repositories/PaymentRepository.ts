import { AppDataSource } from "../data-source";
import { Payment } from "../entities/Payment"; // Certifique-se de que sua entidade Payment está definida aqui
import { Repository } from "typeorm";
import { AppError } from "../middlewares/errorHandler"; // Importe se você for usar AppError

export class PaymentRepository extends Repository<Payment> {
  constructor() {
    super(Payment, AppDataSource.manager);
  }

  /**
   * Cria um novo registro de pagamento no banco de dados.
   * @param paymentData Dados parciais do pagamento a ser criado.
   * @returns O objeto Payment criado e salvo.
   */
  async createPayment(paymentData: Partial<Payment>): Promise<Payment> {
    const payment = this.create(paymentData);
    return this.save(payment);
  }

  /**
   * Busca um pagamento pelo seu ID.
   * @param id O ID do pagamento.
   * @returns O objeto Payment encontrado ou null se não existir.
   */
  async findById(id: string): Promise<Payment | null> {
    return this.findOne({
      where: { id },
      relations: ["diligence", "client", "correspondent"], // Inclua as relações relevantes
    });
  }

  /**
   * Busca todos os pagamentos.
   * @returns Um array de objetos Payment.
   */
  async findAll(): Promise<Payment[]> {
    return this.find({
      relations: ["diligence", "client", "correspondent"], // Inclua as relações relevantes
      order: { createdAt: "DESC" }, // Ordena por data de criação, do mais novo para o mais antigo
    });
  }

  /**
   * Atualiza um pagamento existente.
   * @param id O ID do pagamento a ser atualizado.
   * @param paymentData Dados parciais do pagamento para atualização.
   * @returns O objeto Payment atualizado.
   * @throws AppError se o pagamento não for encontrado.
   */
  async updatePayment(id: string, paymentData: Partial<Payment>): Promise<Payment> {
    const payment = await this.findById(id);
    
    if (!payment) {
      throw new AppError("Pagamento não encontrado", 404);
    }
    
    this.merge(payment, paymentData);
    return this.save(payment);
  }

  /**
   * Deleta um pagamento pelo seu ID.
   * @param id O ID do pagamento a ser deletado.
   */
  async deletePayment(id: string): Promise<void> {
    await this.delete(id);
  }

  /**
   * Busca pagamentos associados a uma diligência específica.
   * @param diligenceId O ID da diligência.
   * @returns Um array de objetos Payment.
   */
  async findByDiligenceId(diligenceId: string): Promise<Payment[]> {
    return this.find({
      where: { diligenceId },
      relations: ["client", "correspondent"],
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Busca pagamentos feitos por um cliente específico.
   * @param clientId O ID do cliente.
   * @returns Um array de objetos Payment.
   */
  async findByClientId(clientId: string): Promise<Payment[]> {
    return this.find({
      where: { clientId },
      relations: ["diligence", "correspondent"],
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Busca pagamentos destinados a um correspondente específico.
   * @param correspondentId O ID do correspondente.
   * @returns Um array de objetos Payment.
   */
  async findByCorrespondentId(correspondentId: string): Promise<Payment[]> {
    return this.find({
      where: { correspondentId },
      relations: ["diligence", "client"],
      order: { createdAt: "DESC" },
    });
  }

  /**
   * Busca pagamentos por status.
   * @param status O status do pagamento (ex: 'pending', 'completed', 'failed').
   * @returns Um array de objetos Payment.
   */
  async findByStatus(status: string): Promise<Payment[]> {
    return this.find({
      where: { status },
      relations: ["diligence", "client", "correspondent"],
      order: { createdAt: "DESC" },
    });
  }
}
