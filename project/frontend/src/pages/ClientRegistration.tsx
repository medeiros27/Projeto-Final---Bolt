import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useToast } from '../components/UI/ToastContainer';
import { 
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  Upload,
  CheckCircle,
  CreditCard
} from 'lucide-react';
import { validateForm, ValidationRule } from '../utils/validation';
import { formatPhone, formatCNPJ } from '../utils/formatters';
import platformService from '../services/platformService';

interface ClientRegistrationData {
  // Personal Info
  name: string;
  email: string;
  phone: string;
  // Company Info
  companyName: string;
  cnpj: string;
  address: string;
  city: string;
  state: string;
  // Subscription
  plan: 'basic' | 'premium' | 'enterprise';
  // Documents
  documents: File[];
}

const ClientRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ClientRegistrationData>({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    cnpj: '',
    address: '',
    city: '',
    state: '',
    plan: 'basic',
    documents: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      price: 99.90,
      features: [
        'Até 10 diligências por mês',
        'Suporte por email',
        'Dashboard básico',
        'Relatórios mensais'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 299.90,
      features: [
        'Diligências ilimitadas',
        'Suporte prioritário',
        'Dashboard avançado',
        'Relatórios em tempo real',
        'API de integração',
        'Correspondentes dedicados'
      ],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 599.90,
      features: [
        'Tudo do Premium',
        'Gerente de conta dedicado',
        'SLA garantido',
        'Integração personalizada',
        'Treinamento da equipe',
        'Relatórios customizados'
      ]
    }
  ];

  const validationRules: Record<string, ValidationRule> = {
    name: { required: true, minLength: 2 },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    phone: { required: true },
    companyName: { required: true, minLength: 2 },
    cnpj: { required: true },
    address: { required: true },
    city: { required: true },
    state: { required: true }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    if (name === 'phone') {
      formattedValue = formatPhone(value);
    } else if (name === 'cnpj') {
      formattedValue = formatCNPJ(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, documents: [...prev.documents, ...files] }));
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    let stepFields: string[] = [];
    
    switch (step) {
      case 1:
        stepFields = ['name', 'email', 'phone'];
        break;
      case 2:
        stepFields = ['companyName', 'cnpj', 'address', 'city', 'state'];
        break;
      case 3:
        // Plan selection - no validation needed
        return true;
      case 4:
        // Documents - optional
        return true;
    }
    
    const stepData = Object.fromEntries(
      stepFields.map(field => [field, formData[field as keyof ClientRegistrationData]])
    );
    
    const stepRules = Object.fromEntries(
      stepFields.map(field => [field, validationRules[field]])
    );
    
    const validationErrors = validateForm(stepData, stepRules);
    setErrors(validationErrors);
    
    return Object.keys(validationErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      const client = await platformService.registerClient(formData);
      
      addToast({
        type: 'success',
        title: 'Cadastro realizado!',
        message: 'Sua conta foi criada com sucesso. Aguarde a validação dos documentos.'
      });
      
      navigate('/login');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro no cadastro',
        message: 'Ocorreu um erro ao criar sua conta. Tente novamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <User className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Informações Pessoais</h2>
        <p className="text-gray-600">Dados do responsável pela conta</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome Completo *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Seu nome completo"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="seu@email.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefone *
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="(11) 99999-9999"
            maxLength={15}
          />
          {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Building className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Dados da Empresa</h2>
        <p className="text-gray-600">Informações do escritório ou empresa</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome da Empresa *
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.companyName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Nome do escritório ou empresa"
          />
          {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CNPJ *
          </label>
          <input
            type="text"
            name="cnpj"
            value={formData.cnpj}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.cnpj ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="00.000.000/0000-00"
            maxLength={18}
          />
          {errors.cnpj && <p className="mt-1 text-sm text-red-600">{errors.cnpj}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Endereço Completo *
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.address ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Rua, número, complemento, bairro, CEP"
          />
          {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cidade *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.city ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Cidade"
            />
            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado *
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.state ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Selecione</option>
              <option value="SP">São Paulo</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="MG">Minas Gerais</option>
              {/* Add more states */}
            </select>
            {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CreditCard className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Escolha seu Plano</h2>
        <p className="text-gray-600">Selecione o plano que melhor atende suas necessidades</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative border-2 rounded-lg p-6 cursor-pointer transition-all ${
              formData.plan === plan.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, plan: plan.id as any }))}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  Mais Popular
                </span>
              </div>
            )}
            
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                R$ {plan.price.toFixed(2)}
              </div>
              <p className="text-sm text-gray-600 mb-4">por mês</p>
            </div>

            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            {formData.plan === plan.id && (
              <div className="absolute top-4 right-4">
                <CheckCircle className="h-6 w-6 text-blue-500" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Documentos</h2>
        <p className="text-gray-600">Envie os documentos para validação da conta</p>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Arraste arquivos aqui ou clique para selecionar
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Documentos aceitos: Contrato Social, Cartão CNPJ, OAB (se aplicável)
          </p>
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="hidden"
            id="document-upload"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => document.getElementById('document-upload')?.click()}
          >
            Selecionar Arquivos
          </Button>
        </div>

        {formData.documents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Documentos Selecionados:</h4>
            {formData.documents.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">{file.name}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(index)}
                >
                  Remover
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Documentos Necessários:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Contrato Social ou Requerimento de Empresário</li>
            <li>• Cartão CNPJ atualizado</li>
            <li>• Carteira da OAB (para advogados)</li>
            <li>• Comprovante de endereço da empresa</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Revisão Final</h2>
        <p className="text-gray-600">Confirme seus dados antes de finalizar o cadastro</p>
      </div>

      <div className="space-y-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados Pessoais</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Nome:</span>
              <span className="ml-2 font-medium">{formData.name}</span>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <span className="ml-2 font-medium">{formData.email}</span>
            </div>
            <div>
              <span className="text-gray-600">Telefone:</span>
              <span className="ml-2 font-medium">{formData.phone}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados da Empresa</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Empresa:</span>
              <span className="ml-2 font-medium">{formData.companyName}</span>
            </div>
            <div>
              <span className="text-gray-600">CNPJ:</span>
              <span className="ml-2 font-medium">{formData.cnpj}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Endereço:</span>
              <span className="ml-2 font-medium">{formData.address}</span>
            </div>
            <div>
              <span className="text-gray-600">Cidade:</span>
              <span className="ml-2 font-medium">{formData.city}</span>
            </div>
            <div>
              <span className="text-gray-600">Estado:</span>
              <span className="ml-2 font-medium">{formData.state}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plano Selecionado</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{plans.find(p => p.id === formData.plan)?.name}</p>
              <p className="text-sm text-gray-600">
                {plans.find(p => p.id === formData.plan)?.features.length} funcionalidades incluídas
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                R$ {plans.find(p => p.id === formData.plan)?.price.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">por mês</p>
            </div>
          </div>
        </Card>

        {formData.documents.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentos</h3>
            <p className="text-sm text-gray-600">
              {formData.documents.length} documento(s) anexado(s) para validação
            </p>
          </Card>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        <Card>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Anterior
            </Button>

            {currentStep < 5 ? (
              <Button onClick={nextStep}>
                Próximo
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Finalizar Cadastro'
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ClientRegistration;