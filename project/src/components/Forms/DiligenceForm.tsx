import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../UI/Button';
import Card from '../UI/Card';
import LoadingSpinner from '../UI/LoadingSpinner';
import { Upload, X, FileText, Calendar, MapPin, DollarSign, AlertCircle, Users, Building } from 'lucide-react';
import { useToast } from '../UI/ToastContainer';
import { validateForm, ValidationRule } from '../../utils/validation';
import { formatCurrency } from '../../utils/formatters';
import { DILIGENCE_TYPES, SUGGESTED_VALUES, BRAZILIAN_STATES, MAX_FILE_SIZE, FILE_TYPES } from '../../utils/constants';
import { User } from '../../types';
import userService from '../../services/userService';

interface DiligenceFormProps {
  onSubmit: (data: DiligenceFormData) => void;
  onCancel: () => void;
  initialData?: Partial<DiligenceFormData>;
  isEditing?: boolean;
}

export interface DiligenceFormData {
  title: string;
  description: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  value: number;
  correspondentValue?: number; // Valor que o correspondente receberá
  deadline: string;
  city: string;
  state: string;
  attachments: File[];
  clientId?: string; // ID do cliente (apenas para admin)
  correspondentId?: string; // ID do correspondente (apenas para admin)
}

const DiligenceForm: React.FC<DiligenceFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData,
  isEditing = false 
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState<DiligenceFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || '',
    priority: initialData?.priority || 'medium',
    value: initialData?.value || 0,
    correspondentValue: initialData?.correspondentValue || 0,
    deadline: initialData?.deadline || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    attachments: initialData?.attachments || [],
    clientId: initialData?.clientId || '',
    correspondentId: initialData?.correspondentId || ''
  });
  
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [clients, setClients] = useState<User[]>([]);
  const [correspondents, setCorrespondents] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const validationRules: Record<string, ValidationRule> = {
    title: { required: true, minLength: 5, maxLength: 200 },
    description: { required: true, minLength: 10, maxLength: 1000 },
    type: { required: true },
    priority: { required: true },
    value: { required: true, min: 1 },
    correspondentValue: { min: 0 },
    deadline: { required: true },
    city: { required: true, minLength: 2, maxLength: 100 },
    state: { required: true },
    attachments: {},
    clientId: user?.role === 'admin' ? { required: true } : {},
    correspondentId: user?.role === 'admin' && isEditing ? { required: true } : {}
  };

  // Carregar clientes e correspondentes (apenas para admin)
  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const [allUsers, allCorrespondents] = await Promise.all([
        userService.getUsers(),
        userService.getCorrespondents()
      ]);
      
      // Filtrar apenas clientes
      const clientUsers = allUsers.filter(u => u.role === 'client' && u.status === 'active');
      setClients(clientUsers);
      
      // Filtrar correspondentes ativos
      const activeCorrespondents = allCorrespondents.filter(c => c.status === 'active');
      setCorrespondents(activeCorrespondents);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      addToast({
        type: 'error',
        title: 'Erro ao carregar usuários',
        message: 'Não foi possível carregar a lista de clientes e correspondentes.'
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const getTypeCategory = (type: string): string => {
    if (type.includes('Preposto') && !type.includes('Advogado +')) return 'Prepostos';
    if (type.includes('Advogado') && !type.includes('+')) return 'Advogados';
    if (type.includes('Advogado + Preposto')) return 'Advogado + Preposto';
    return 'Serviços Processuais';
  };

  const groupedTypes = DILIGENCE_TYPES.reduce((acc, type) => {
    const category = getTypeCategory(type);
    if (!acc[category]) acc[category] = [];
    acc[category].push(type);
    return acc;
  }, {} as Record<string, string[]>);

  const getSuggestedValue = (type: string): number => {
    return SUGGESTED_VALUES[type as keyof typeof SUGGESTED_VALUES] || 200;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'value' || name === 'correspondentValue' ? parseFloat(value) || 0 : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(file => {
      const allowedTypes = Object.values(FILE_TYPES);
      
      if (file.size > MAX_FILE_SIZE) {
        addToast({
          type: 'error',
          title: 'Arquivo muito grande',
          message: `${file.name} excede o limite de 10MB.`
        });
        return false;
      }
      
      if (!allowedTypes.includes(file.type as any)) {
        addToast({
          type: 'error',
          title: 'Tipo de arquivo não permitido',
          message: `${file.name} não é um tipo de arquivo válido.`
        });
        return false;
      }
      
      return true;
    });

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...validFiles]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const validateFormData = (): boolean => {
    const validationErrors = validateForm(formData, validationRules);
    
    // Custom validation for deadline
    if (formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      const now = new Date();
      
      if (deadlineDate < now) {
        validationErrors.deadline = 'Data e horário não podem ser anteriores ao momento atual';
      }
    }

    // Custom validation for correspondentValue
    if (user?.role === 'admin' && formData.correspondentValue !== undefined) {
      if (formData.correspondentValue > formData.value) {
        validationErrors.correspondentValue = 'O valor do correspondente não pode ser maior que o valor da diligência';
      }
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateFormData()) {
      addToast({
        type: 'error',
        title: 'Erro de validação',
        message: 'Por favor, corrija os erros no formulário.'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      addToast({
        type: 'success',
        title: isEditing ? 'Diligência atualizada!' : 'Diligência criada!',
        message: isEditing ? 'A diligência foi atualizada com sucesso.' : 'A diligência foi criada com sucesso.'
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao salvar',
        message: 'Ocorreu um erro ao salvar a diligência. Tente novamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Update suggested value when type changes
  useEffect(() => {
    if (formData.type && formData.value === 0) {
      const suggestedValue = getSuggestedValue(formData.type);
      setFormData(prev => ({ 
        ...prev, 
        value: suggestedValue,
        correspondentValue: suggestedValue * 0.7 // 70% para o correspondente por padrão
      }));
    }
  }, [formData.type]);

  // Update correspondentValue when value changes (only for new diligences)
  useEffect(() => {
    if (!isEditing && formData.value > 0 && (!formData.correspondentValue || formData.correspondentValue === 0)) {
      setFormData(prev => ({ 
        ...prev, 
        correspondentValue: prev.value * 0.7 // 70% para o correspondente por padrão
      }));
    }
  }, [formData.value, isEditing]);

  // Filtrar correspondentes por estado selecionado
  const filteredCorrespondents = formData.state 
    ? correspondents.filter(c => c.state === formData.state)
    : correspondents;

  return (
    <Card className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Diligência' : 'Nova Diligência'}
        </h2>
        <p className="text-gray-600">
          {isEditing ? 'Atualize as informações da diligência' : 'Preencha os dados para criar uma nova diligência jurídica'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seleção de Cliente (apenas para admin) */}
        {user?.role === 'admin' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start space-x-3 mb-4">
              <Users className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-lg font-medium text-blue-900">Atribuição de Usuários</h3>
                <p className="text-sm text-blue-700">
                  Selecione o cliente e o correspondente para esta diligência
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Seleção de Cliente */}
              <div>
                <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
                  Cliente *
                </label>
                <select
                  id="clientId"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.clientId ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Selecione o cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} {client.companyName ? `(${client.companyName})` : ''}
                    </option>
                  ))}
                </select>
                {errors.clientId && <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>}
                {loadingUsers && <p className="mt-1 text-sm text-gray-500">Carregando clientes...</p>}
              </div>

              {/* Seleção de Correspondente (opcional para novas diligências, obrigatório para edição) */}
              <div>
                <label htmlFor="correspondentId" className="block text-sm font-medium text-gray-700 mb-2">
                  Correspondente {isEditing ? '*' : '(Opcional)'}
                </label>
                <select
                  id="correspondentId"
                  name="correspondentId"
                  value={formData.correspondentId}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.correspondentId ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required={isEditing}
                >
                  <option value="">Selecione o correspondente</option>
                  {filteredCorrespondents.map(correspondent => (
                    <option key={correspondent.id} value={correspondent.id}>
                      {correspondent.name} - {correspondent.city}, {correspondent.state} {correspondent.oab ? `(OAB: ${correspondent.oab})` : ''}
                    </option>
                  ))}
                </select>
                {errors.correspondentId && <p className="mt-1 text-sm text-red-600">{errors.correspondentId}</p>}
                {loadingUsers && <p className="mt-1 text-sm text-gray-500">Carregando correspondentes...</p>}
                {formData.state && filteredCorrespondents.length === 0 && (
                  <p className="mt-1 text-sm text-yellow-600">
                    Nenhum correspondente disponível para o estado selecionado.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título da Diligência *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ex: Preposto Trabalhista - Audiência de Conciliação - Processo nº 1234567"
              required
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descrição Detalhada *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Descreva detalhadamente a diligência: número do processo, vara, horário da audiência, endereço do fórum, instruções específicas, etc..."
              required
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Diligência *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.type ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Selecione o tipo de diligência</option>
              {Object.entries(groupedTypes).map(([category, types]) => (
                <optgroup key={category} label={category}>
                  {types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Prioridade
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
              Data e Hora da Audiência/Prazo *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="datetime-local"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                min={new Date().toISOString().slice(0, 16)}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.deadline ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
            </div>
            {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>}
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              Cidade/Comarca *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.city ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: São Paulo, Campinas, Santos"
                required
              />
            </div>
            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
              Estado *
            </label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.state ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Selecione o estado</option>
              {BRAZILIAN_STATES.map(state => (
                <option key={state.code} value={state.code}>{state.code}</option>
              ))}
            </select>
            {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
          </div>

          <div>
            <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
              Valor da Diligência (R$) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="number"
                id="value"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.value ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
                required
              />
            </div>
            {errors.value && <p className="mt-1 text-sm text-red-600">{errors.value}</p>}
            {formData.type && (
              <p className="text-xs text-gray-500 mt-1">
                Valor sugerido para este tipo: {formatCurrency(getSuggestedValue(formData.type))}
              </p>
            )}
          </div>

          {/* Campo de valor do correspondente - APENAS PARA ADMIN */}
          {user?.role === 'admin' && (
            <div>
              <label htmlFor="correspondentValue" className="block text-sm font-medium text-gray-700 mb-2">
                Valor do Correspondente (R$) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="number"
                  id="correspondentValue"
                  name="correspondentValue"
                  value={formData.correspondentValue}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.correspondentValue ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  required
                />
              </div>
              {errors.correspondentValue && <p className="mt-1 text-sm text-red-600">{errors.correspondentValue}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Valor que o correspondente receberá pela diligência
              </p>
              {formData.value > 0 && formData.correspondentValue !== undefined && (
                <p className="text-xs text-gray-500 mt-1">
                  Lucro: {formatCurrency(formData.value - formData.correspondentValue)} 
                  ({formData.value > 0 ? ((formData.value - formData.correspondentValue) / formData.value * 100).toFixed(1) : 0}%)
                </p>
              )}
            </div>
          )}
        </div>

        {/* Upload de Arquivos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Anexos (Mandados, Petições, Documentos)
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
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <p className="text-xs text-gray-500 mb-4">
              PDF, DOC, DOCX, JPG, PNG - Máximo 10MB por arquivo
            </p>
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
              id="file-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Selecionar Arquivos
            </Button>
          </div>

          {/* Lista de Arquivos */}
          {formData.attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Arquivos Selecionados:</h4>
              {formData.attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informações sobre Pagamento */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-green-900">Pagamento via PIX</h4>
              <ul className="text-sm text-green-800 mt-1 space-y-1">
                <li>• O pagamento será realizado exclusivamente via PIX</li>
                <li>• Após a conclusão da diligência, você receberá os dados para pagamento</li>
                <li>• Será necessário enviar o comprovante de pagamento</li>
                <li>• O correspondente receberá após confirmação do pagamento</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Informações Importantes */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Informações Importantes</h4>
              <ul className="text-sm text-blue-800 mt-1 space-y-1">
                <li>• A diligência será analisada pela administração antes da atribuição</li>
                <li>• Correspondentes qualificados na região serão notificados</li>
                <li>• Para audiências, informe data e horário exatos no campo prazo</li>
                <li>• Anexe todos os documentos necessários (mandados, petições, etc.)</li>
                <li>• Você receberá atualizações sobre o status da diligência</li>
                {user?.role === 'admin' && (
                  <li>• Como administrador, você pode atribuir diretamente a um correspondente</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoadingSpinner size="sm" />
            ) : (
              isEditing ? 'Atualizar Diligência' : 'Criar Diligência'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default DiligenceForm;