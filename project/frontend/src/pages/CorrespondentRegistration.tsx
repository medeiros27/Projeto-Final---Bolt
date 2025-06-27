import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useToast } from '../components/UI/ToastContainer';
import { 
  UserCheck, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  Upload,
  CheckCircle,
  Award,
  X
} from 'lucide-react';
import { validateForm, ValidationRule } from '../utils/validation';
import { formatPhone } from '../utils/formatters';
import { BRAZILIAN_STATES } from '../utils/constants';
import platformService from '../services/platformService';

interface CorrespondentRegistrationData {
  // Personal Info
  name: string;
  email: string;
  phone: string;
  oab: string;
  // Location
  city: string;
  state: string;
  coverage: string[];
  // Specialties
  specialties: string[];
  // Experience
  experience: string;
  education: string;
  // Documents
  documents: File[];
}

const CorrespondentRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CorrespondentRegistrationData>({
    name: '',
    email: '',
    phone: '',
    oab: '',
    city: '',
    state: '',
    coverage: [],
    specialties: [],
    experience: '',
    education: '',
    documents: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const specialtyOptions = [
    'Direito Trabalhista',
    'Direito Cível',
    'Direito Empresarial',
    'Direito Tributário',
    'Direito Penal',
    'Direito Previdenciário',
    'Direito Imobiliário',
    'Direito de Família',
    'Direito do Consumidor',
    'Direito Administrativo'
  ];

  const validationRules: Record<string, ValidationRule> = {
    name: { required: true, minLength: 2 },
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    phone: { required: true },
    oab: { required: true, pattern: /^[A-Z]{2}\d{4,6}$/ },
    city: { required: true },
    state: { required: true },
    experience: { required: true },
    education: { required: true }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let formattedValue = value;
    if (name === 'phone') {
      formattedValue = formatPhone(value);
    } else if (name === 'oab') {
      formattedValue = value.toUpperCase();
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  const handleCoverageToggle = (state: string) => {
    setFormData(prev => ({
      ...prev,
      coverage: prev.coverage.includes(state)
        ? prev.coverage.filter(s => s !== state)
        : [...prev.coverage, state]
    }));
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
        stepFields = ['name', 'email', 'phone', 'oab'];
        break;
      case 2:
        stepFields = ['city', 'state'];
        // Also validate that at least one specialty is selected
        if (formData.specialties.length === 0) {
          setErrors(prev => ({ ...prev, specialties: 'Selecione pelo menos uma especialidade' }));
          return false;
        }
        break;
      case 3:
        stepFields = ['experience', 'education'];
        break;
      case 4:
        // Documents validation
        if (formData.documents.length === 0) {
          setErrors(prev => ({ ...prev, documents: 'Envie pelo menos um documento' }));
          return false;
        }
        return true;
    }
    
    const stepData = Object.fromEntries(
      stepFields.map(field => [field, formData[field as keyof CorrespondentRegistrationData]])
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
      const correspondent = await platformService.registerCorrespondent(formData);
      
      addToast({
        type: 'success',
        title: 'Cadastro realizado!',
        message: 'Sua solicitação foi enviada. Aguarde a análise dos documentos.'
      });
      
      navigate('/login');
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro no cadastro',
        message: 'Ocorreu um erro ao enviar sua solicitação. Tente novamente.'
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
        <p className="text-gray-600">Dados básicos do correspondente</p>
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

        <div className="grid grid-cols-2 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OAB *
            </label>
            <input
              type="text"
              name="oab"
              value={formData.oab}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.oab ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="SP123456"
            />
            {errors.oab && <p className="mt-1 text-sm text-red-600">{errors.oab}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Localização e Especialidades</h2>
        <p className="text-gray-600">Onde você atua e suas áreas de especialização</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cidade Principal *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.city ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Cidade onde atua"
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
              {BRAZILIAN_STATES.map(state => (
                <option key={state.code} value={state.code}>{state.name}</option>
              ))}
            </select>
            {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Especialidades Jurídicas *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {specialtyOptions.map((specialty) => (
              <label key={specialty} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.specialties.includes(specialty)}
                  onChange={() => handleSpecialtyToggle(specialty)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">{specialty}</span>
              </label>
            ))}
          </div>
          {errors.specialties && <p className="mt-1 text-sm text-red-600">{errors.specialties}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Estados de Cobertura (Opcional)
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Selecione os estados onde você pode atuar além do seu estado principal
          </p>
          <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {BRAZILIAN_STATES.map((state) => (
              <label key={state.code} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.coverage.includes(state.code)}
                  onChange={() => handleCoverageToggle(state.code)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-1 text-xs text-gray-700">{state.code}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Award className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Experiência Profissional</h2>
        <p className="text-gray-600">Conte-nos sobre sua trajetória profissional</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experiência Profissional *
          </label>
          <textarea
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.experience ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Descreva sua experiência profissional, cargos ocupados, tempo de atuação, etc."
          />
          {errors.experience && <p className="mt-1 text-sm text-red-600">{errors.experience}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Formação Acadêmica *
          </label>
          <textarea
            name="education"
            value={formData.education}
            onChange={handleInputChange}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.education ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Informe sua formação acadêmica, cursos de especialização, pós-graduação, etc."
          />
          {errors.education && <p className="mt-1 text-sm text-red-600">{errors.education}</p>}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Documentos</h2>
        <p className="text-gray-600">Envie os documentos necessários para credenciamento</p>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Arraste arquivos aqui ou clique para selecionar
          </p>
          <p className="text-xs text-gray-500 mb-4">
            Formatos aceitos: PDF, DOC, DOCX, JPG, PNG - Máximo 10MB por arquivo
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
                  <div>
                    <span className="text-sm text-gray-900">{file.name}</span>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {errors.documents && <p className="text-sm text-red-600">{errors.documents}</p>}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Documentos Obrigatórios:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Carteira da OAB (frente e verso)</li>
            <li>• RG ou CNH</li>
            <li>• CPF</li>
            <li>• Comprovante de endereço</li>
            <li>• Diploma de Direito</li>
            <li>• Certidão de regularidade da OAB</li>
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
        <p className="text-gray-600">Confirme seus dados antes de enviar a solicitação</p>
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
            <div>
              <span className="text-gray-600">OAB:</span>
              <span className="ml-2 font-medium">{formData.oab}</span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Localização</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Cidade:</span>
              <span className="ml-2 font-medium">{formData.city}</span>
            </div>
            <div>
              <span className="text-gray-600">Estado:</span>
              <span className="ml-2 font-medium">{formData.state}</span>
            </div>
          </div>
          {formData.coverage.length > 0 && (
            <div className="mt-3">
              <span className="text-gray-600">Cobertura adicional:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {formData.coverage.map(state => (
                  <Badge key={state} variant="info">{state}</Badge>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Especialidades</h3>
          <div className="flex flex-wrap gap-2">
            {formData.specialties.map(specialty => (
              <Badge key={specialty} variant="success">{specialty}</Badge>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentos</h3>
          <p className="text-sm text-gray-600">
            {formData.documents.length} documento(s) anexado(s) para análise
          </p>
        </Card>
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
                  'Enviar Solicitação'
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CorrespondentRegistration;