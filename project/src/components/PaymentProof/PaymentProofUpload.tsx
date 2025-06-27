import React, { useState } from 'react';
import Button from '../UI/Button';
import Modal from '../Modals/Modal';
import { useToast } from '../UI/ToastContainer';
import { 
  Upload, 
  X, 
  CheckCircle, 
  DollarSign,
  AlertCircle,
  FileImage
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface PaymentProofUploadProps {
  isOpen: boolean;
  onClose: () => void;
  diligenceTitle: string;
  amount: number;
  onSubmit: (pixKey: string, proofImage: File) => Promise<boolean>;
}

const PaymentProofUpload: React.FC<PaymentProofUploadProps> = ({
  isOpen,
  onClose,
  diligenceTitle,
  amount,
  onSubmit
}) => {
  const { addToast } = useToast();
  const [pixKey, setPixKey] = useState('');
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      addToast({
        type: 'error',
        title: 'Arquivo inválido',
        message: 'Por favor, selecione apenas imagens (JPG, PNG, etc.)'
      });
      return;
    }
    
    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'Arquivo muito grande',
        message: 'A imagem deve ter no máximo 5MB'
      });
      return;
    }
    
    setProofImage(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!pixKey.trim()) {
      addToast({
        type: 'error',
        title: 'Chave PIX obrigatória',
        message: 'Por favor, informe a chave PIX utilizada para o pagamento'
      });
      return;
    }

    if (!proofImage) {
      addToast({
        type: 'error',
        title: 'Comprovante obrigatório',
        message: 'Por favor, anexe o comprovante de pagamento'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await onSubmit(pixKey, proofImage);
      
      if (success) {
        // Reset form
        setPixKey('');
        setProofImage(null);
        onClose();
        
        addToast({
          type: 'success',
          title: 'Comprovante enviado!',
          message: 'Seu comprovante foi enviado e está sendo verificado.'
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao enviar',
        message: 'Ocorreu um erro ao enviar o comprovante. Tente novamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Enviar Comprovante de Pagamento"
      size="md"
    >
      <div className="space-y-6">
        {/* Informações do Pagamento */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-green-900 mb-2">Informações do Pagamento</h4>
              <div className="space-y-1 text-sm text-green-800">
                <p><strong>Diligência:</strong> {diligenceTitle}</p>
                <p><strong>Valor:</strong> {formatCurrency(amount)}</p>
                <p><strong>Método:</strong> PIX</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chave PIX */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chave PIX utilizada *
          </label>
          <input
            type="text"
            value={pixKey}
            onChange={(e) => setPixKey(e.target.value)}
            placeholder="Digite a chave PIX utilizada para o pagamento"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Informe a chave PIX (CPF, email, telefone ou chave aleatória) que você utilizou
          </p>
        </div>

        {/* Upload do Comprovante */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comprovante de Pagamento *
          </label>
          
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Arraste a imagem aqui ou clique para selecionar
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Formatos aceitos: JPG, PNG - Máximo 5MB
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="proof-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('proof-upload')?.click()}
            >
              Selecionar Imagem
            </Button>
          </div>

          {/* Arquivo Selecionado */}
          {proofImage && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <FileImage className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-900">{proofImage.name}</p>
                    <p className="text-xs text-green-700">{formatFileSize(proofImage.size)}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setProofImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Instruções */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Instruções Importantes</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Certifique-se de que o comprovante está legível e completo</li>
                <li>• O valor deve corresponder exatamente ao valor da diligência</li>
                <li>• A chave PIX deve ser a mesma utilizada no pagamento</li>
                <li>• Após o envio, aguarde a verificação (até 24 horas)</li>
                <li>• O correspondente será notificado após a confirmação</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!pixKey.trim() || !proofImage || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Enviando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Enviar Comprovante
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentProofUpload;