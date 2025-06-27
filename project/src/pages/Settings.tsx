import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Modal from '../components/Modals/Modal';
import ConfirmModal from '../components/Modals/ConfirmModal';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useToast } from '../components/UI/ToastContainer';
import { 
  Settings as SettingsIcon, 
  Building, 
  Mail, 
  Shield, 
  FileText,
  Users,
  Bell,
  Database,
  Globe,
  Upload,
  Save,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import { DILIGENCE_TYPES, SUGGESTED_VALUES, BRAZILIAN_STATES } from '../utils/constants';

interface SystemSettings {
  company: {
    name: string;
    logo: string;
    email: string;
    phone: string;
    address: string;
    timezone: string;
    currency: string;
  };
  diligences: {
    types: DiligenceType[];
    defaultSLA: number;
    autoAssignment: boolean;
    requireApproval: boolean;
  };
  notifications: {
    emailTemplates: EmailTemplate[];
    smtpSettings: SMTPSettings;
    defaultSettings: NotificationSettings;
  };
  payments: {
    paymentMethods: string[];
    paymentTerms: number;
    lateFee: number;
  };
  security: {
    passwordPolicy: PasswordPolicy;
    sessionTimeout: number;
    auditLog: boolean;
    backupFrequency: string;
  };
}

interface DiligenceType {
  id: string;
  name: string;
  category: string;
  suggestedValue: number;
  averageTime: number;
  requiredDocuments: string[];
  sla: number;
  active: boolean;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  active: boolean;
}

interface SMTPSettings {
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  frequency: 'immediate' | 'hourly' | 'daily';
}

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  expirationDays: number;
  historyCount: number;
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'general' | 'diligences' | 'notifications' | 'payments' | 'security' | 'users'>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'diligence-type' | 'email-template' | 'user-role'>('diligence-type');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<any>(null);

  // Mock settings data
  const [settings, setSettings] = useState<SystemSettings>({
    company: {
      name: 'JurisConnect',
      logo: '/logotipo.png',
      email: 'contato@jurisconnect.com',
      phone: '(11) 3000-0000',
      address: 'Av. Paulista, 1000 - São Paulo, SP',
      timezone: 'America/Sao_Paulo',
      currency: 'BRL'
    },
    diligences: {
      types: DILIGENCE_TYPES.map((type, index) => ({
        id: (index + 1).toString(),
        name: type,
        category: getTypeCategory(type),
        suggestedValue: SUGGESTED_VALUES[type as keyof typeof SUGGESTED_VALUES] || 200,
        averageTime: Math.floor(Math.random() * 48) + 24,
        requiredDocuments: ['Mandado', 'Petição'],
        sla: Math.floor(Math.random() * 72) + 24,
        active: true
      })),
      defaultSLA: 48,
      autoAssignment: true,
      requireApproval: false
    },
    notifications: {
      emailTemplates: [
        {
          id: '1',
          name: 'Nova Diligência',
          subject: 'Nova diligência criada - {{title}}',
          body: 'Uma nova diligência foi criada: {{title}}\nDescrição: {{description}}\nPrazo: {{deadline}}',
          variables: ['title', 'description', 'deadline', 'client', 'value'],
          active: true
        },
        {
          id: '2',
          name: 'Diligência Atribuída',
          subject: 'Diligência atribuída - {{title}}',
          body: 'A diligência {{title}} foi atribuída a você.\nPrazo: {{deadline}}\nValor: {{value}}',
          variables: ['title', 'deadline', 'value', 'correspondent'],
          active: true
        }
      ],
      smtpSettings: {
        host: 'smtp.gmail.com',
        port: 587,
        username: 'noreply@jurisconnect.com',
        password: '••••••••',
        secure: true
      },
      defaultSettings: {
        email: true,
        sms: false,
        push: true,
        frequency: 'immediate'
      }
    },
    payments: {
      paymentMethods: ['PIX'],
      paymentTerms: 30,
      lateFee: 2
    },
    security: {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: false,
        expirationDays: 90,
        historyCount: 5
      },
      sessionTimeout: 480,
      auditLog: true,
      backupFrequency: 'daily'
    }
  });

  function getTypeCategory(type: string): string {
    if (type.includes('Preposto') && !type.includes('Advogado +')) return 'Prepostos';
    if (type.includes('Advogado') && !type.includes('+')) return 'Advogados';
    if (type.includes('Advogado + Preposto')) return 'Advogado + Preposto';
    return 'Serviços Processuais';
  }

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      addToast({
        type: 'success',
        title: 'Configurações salvas!',
        message: 'As configurações foram atualizadas com sucesso.'
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Erro ao salvar',
        message: 'Ocorreu um erro ao salvar as configurações.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDiligenceType = () => {
    setSelectedItem(null);
    setModalType('diligence-type');
    setShowModal(true);
  };

  const handleEditDiligenceType = (type: DiligenceType) => {
    setSelectedItem(type);
    setModalType('diligence-type');
    setShowModal(true);
  };

  const handleDeleteDiligenceType = (type: DiligenceType) => {
    setConfirmAction({
      type: 'delete-diligence-type',
      item: type,
      title: 'Excluir Tipo de Diligência',
      message: `Tem certeza que deseja excluir o tipo "${type.name}"?`
    });
    setShowConfirmModal(true);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações da Empresa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Empresa
            </label>
            <input
              type="text"
              value={settings.company.name}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                company: { ...prev.company, name: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de Contato
            </label>
            <input
              type="email"
              value={settings.company.email}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                company: { ...prev.company, email: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <input
              type="text"
              value={settings.company.phone}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                company: { ...prev.company, phone: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={settings.company.timezone}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                company: { ...prev.company, timezone: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
              <option value="America/Manaus">Manaus (UTC-4)</option>
              <option value="America/Rio_Branco">Rio Branco (UTC-5)</option>
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endereço
            </label>
            <textarea
              value={settings.company.address}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                company: { ...prev.company, address: e.target.value }
              }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo da Empresa</h3>
        <div className="flex items-center space-x-4">
          <img 
            src={settings.company.logo} 
            alt="Logo" 
            className="h-16 w-16 object-contain border border-gray-200 rounded-lg"
          />
          <div>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Alterar Logo
            </Button>
            <p className="text-sm text-gray-500 mt-1">
              Formatos aceitos: PNG, JPG. Tamanho máximo: 2MB
            </p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderDiligenceSettings = () => (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Tipos de Diligência</h3>
          <Button onClick={handleAddDiligenceType}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Tipo
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Nome</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Categoria</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Valor Sugerido</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">SLA (horas)</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody>
              {settings.diligences.types.slice(0, 10).map((type) => (
                <tr key={type.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{type.name}</td>
                  <td className="py-3 px-4">
                    <Badge variant="info">{type.category}</Badge>
                  </td>
                  <td className="py-3 px-4">R$ {type.suggestedValue.toFixed(2)}</td>
                  <td className="py-3 px-4">{type.sla}h</td>
                  <td className="py-3 px-4">
                    <Badge variant={type.active ? 'success' : 'danger'}>
                      {type.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditDiligenceType(type)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteDiligenceType(type)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações Gerais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SLA Padrão (horas)
            </label>
            <input
              type="number"
              value={settings.diligences.defaultSLA}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                diligences: { ...prev.diligences, defaultSLA: parseInt(e.target.value) }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.diligences.autoAssignment}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  diligences: { ...prev.diligences, autoAssignment: e.target.checked }
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Atribuição Automática</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.diligences.requireApproval}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  diligences: { ...prev.diligences, requireApproval: e.target.checked }
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Requer Aprovação</span>
            </label>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações SMTP</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Servidor SMTP
            </label>
            <input
              type="text"
              value={settings.notifications.smtpSettings.host}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: {
                  ...prev.notifications,
                  smtpSettings: { ...prev.notifications.smtpSettings, host: e.target.value }
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Porta
            </label>
            <input
              type="number"
              value={settings.notifications.smtpSettings.port}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: {
                  ...prev.notifications,
                  smtpSettings: { ...prev.notifications.smtpSettings, port: parseInt(e.target.value) }
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Usuário
            </label>
            <input
              type="text"
              value={settings.notifications.smtpSettings.username}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: {
                  ...prev.notifications,
                  smtpSettings: { ...prev.notifications.smtpSettings, username: e.target.value }
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              value={settings.notifications.smtpSettings.password}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: {
                  ...prev.notifications,
                  smtpSettings: { ...prev.notifications.smtpSettings, password: e.target.value }
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.notifications.smtpSettings.secure}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: {
                  ...prev.notifications,
                  smtpSettings: { ...prev.notifications.smtpSettings, secure: e.target.checked }
                }
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Usar SSL/TLS</span>
          </label>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Templates de Email</h3>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Template
          </Button>
        </div>
        
        <div className="space-y-4">
          {settings.notifications.emailTemplates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.subject}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={template.active ? 'success' : 'danger'}>
                      {template.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Variáveis: {template.variables.join(', ')}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Pagamento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prazo de Pagamento (dias)
            </label>
            <input
              type="number"
              value={settings.payments.paymentTerms}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                payments: { ...prev.payments, paymentTerms: parseInt(e.target.value) }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Multa por Atraso (%)
            </label>
            <input
              type="number"
              value={settings.payments.lateFee}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                payments: { ...prev.payments, lateFee: parseFloat(e.target.value) }
              }))}
              min="0"
              max="100"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Método de Pagamento</h3>
        <div className="p-4 bg-green-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-full">
              <img src="https://logospng.org/download/pix/logo-pix-512.png" alt="PIX" className="h-8 w-8" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">PIX</h4>
              <p className="text-sm text-gray-600">Pagamento instantâneo</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-green-700">
            O sistema utiliza exclusivamente o PIX como método de pagamento, garantindo transações rápidas e seguras.
          </p>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Instruções para Pagamento</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• O cliente recebe os dados para pagamento após a conclusão da diligência</li>
            <li>• O cliente deve enviar o comprovante de pagamento através da plataforma</li>
            <li>• O administrador verifica o comprovante antes de liberar o pagamento ao correspondente</li>
            <li>• O correspondente recebe o valor integral da diligência após a confirmação</li>
          </ul>
        </div>
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Política de Senhas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comprimento Mínimo
            </label>
            <input
              type="number"
              value={settings.security.passwordPolicy.minLength}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                security: {
                  ...prev.security,
                  passwordPolicy: {
                    ...prev.security.passwordPolicy,
                    minLength: parseInt(e.target.value)
                  }
                }
              }))}
              min="6"
              max="32"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiração (dias)
            </label>
            <input
              type="number"
              value={settings.security.passwordPolicy.expirationDays}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                security: {
                  ...prev.security,
                  passwordPolicy: {
                    ...prev.security.passwordPolicy,
                    expirationDays: parseInt(e.target.value)
                  }
                }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="mt-4 space-y-3">
          {[
            { key: 'requireUppercase', label: 'Requer letras maiúsculas' },
            { key: 'requireLowercase', label: 'Requer letras minúsculas' },
            { key: 'requireNumbers', label: 'Requer números' },
            { key: 'requireSymbols', label: 'Requer símbolos' }
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={settings.security.passwordPolicy[key as keyof PasswordPolicy] as boolean}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  security: {
                    ...prev.security,
                    passwordPolicy: {
                      ...prev.security.passwordPolicy,
                      [key]: e.target.checked
                    }
                  }
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Sessão</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeout de Sessão (minutos)
            </label>
            <input
              type="number"
              value={settings.security.sessionTimeout}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, sessionTimeout: parseInt(e.target.value) }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequência de Backup
            </label>
            <select
              value={settings.security.backupFrequency}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, backupFrequency: e.target.value }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="hourly">A cada hora</option>
              <option value="daily">Diário</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.security.auditLog}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                security: { ...prev.security, auditLog: e.target.checked }
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Habilitar Log de Auditoria</span>
          </label>
        </div>
      </Card>
    </div>
  );

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Restrito</h3>
            <p className="text-gray-600">Apenas administradores podem acessar as configurações do sistema.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
        <p className="text-gray-600">Gerencie as configurações globais da plataforma</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'general', label: 'Geral', icon: Building },
            { id: 'diligences', label: 'Diligências', icon: FileText },
            { id: 'notifications', label: 'Notificações', icon: Bell },
            { id: 'payments', label: 'Pagamentos', icon: Shield },
            { id: 'security', label: 'Segurança', icon: Shield },
            { id: 'users', label: 'Usuários', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'general' && renderGeneralSettings()}
      {activeTab === 'diligences' && renderDiligenceSettings()}
      {activeTab === 'notifications' && renderNotificationSettings()}
      {activeTab === 'payments' && renderPaymentSettings()}
      {activeTab === 'security' && renderSecuritySettings()}
      {activeTab === 'users' && (
        <Card>
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Gestão de Usuários</h3>
            <p className="text-gray-600 mb-4">
              Configure permissões e roles de usuários
            </p>
            <Button variant="outline">Em Desenvolvimento</Button>
          </div>
        </Card>
      )}

      {/* Save Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={handleSaveSettings}
          disabled={isLoading}
          className="shadow-lg"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Configurações
        </Button>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalType === 'diligence-type' ? 'Tipo de Diligência' : 'Template de Email'}
        size="lg"
      >
        <div className="text-center py-8">
          <SettingsIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Modal de edição em desenvolvimento</p>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          // Handle confirm action
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        type="danger"
      />
    </div>
  );
};

export default Settings;