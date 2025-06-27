import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Modal from '../components/Modals/Modal';
import { 
  BarChart3, 
  Download, 
  Calendar,
  Filter,
  FileText,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  MapPin,
  Star,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'operational' | 'performance' | 'custom';
  icon: any;
  fields: string[];
  formats: ('pdf' | 'excel' | 'csv')[];
}

interface ScheduledReport {
  id: string;
  templateId: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  nextRun: string;
  recipients: string[];
  active: boolean;
}

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'templates' | 'custom' | 'scheduled'>('templates');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [customReport, setCustomReport] = useState({
    name: '',
    description: '',
    dateRange: { start: '', end: '' },
    filters: {
      status: 'all',
      priority: 'all',
      state: 'all',
      correspondent: 'all'
    },
    fields: [] as string[],
    format: 'pdf' as 'pdf' | 'excel' | 'csv'
  });

  const reportTemplates: ReportTemplate[] = [
    {
      id: '1',
      name: 'Relatório de Receitas',
      description: 'Análise detalhada das receitas por período, cliente e tipo de diligência',
      category: 'financial',
      icon: DollarSign,
      fields: ['receitas', 'clientes', 'tipos_diligencia', 'periodo'],
      formats: ['pdf', 'excel', 'csv']
    },
    {
      id: '2',
      name: 'Performance de Correspondentes',
      description: 'Métricas de desempenho, avaliações e produtividade dos correspondentes',
      category: 'performance',
      icon: Star,
      fields: ['correspondentes', 'avaliacoes', 'tempo_execucao', 'taxa_conclusao'],
      formats: ['pdf', 'excel']
    },
    {
      id: '3',
      name: 'Análise Operacional',
      description: 'Estatísticas de diligências, prazos, distribuição geográfica e status',
      category: 'operational',
      icon: BarChart3,
      fields: ['diligencias', 'prazos', 'localizacao', 'status'],
      formats: ['pdf', 'excel', 'csv']
    },
    {
      id: '4',
      name: 'Relatório de Clientes',
      description: 'Atividade dos clientes, volume de diligências e histórico de pagamentos',
      category: 'operational',
      icon: Users,
      fields: ['clientes', 'volume_diligencias', 'pagamentos', 'satisfacao'],
      formats: ['pdf', 'excel']
    },
    {
      id: '5',
      name: 'Análise de Prazos',
      description: 'Cumprimento de prazos, diligências em atraso e tempo médio de execução',
      category: 'performance',
      icon: Clock,
      fields: ['prazos', 'atrasos', 'tempo_medio', 'urgencias'],
      formats: ['pdf', 'excel', 'csv']
    },
    {
      id: '6',
      name: 'Distribuição Geográfica',
      description: 'Mapeamento de diligências por estado, cidade e região',
      category: 'operational',
      icon: MapPin,
      fields: ['estados', 'cidades', 'regioes', 'densidade'],
      formats: ['pdf', 'excel']
    }
  ];

  const scheduledReports: ScheduledReport[] = [
    {
      id: '1',
      templateId: '1',
      name: 'Receitas Mensais',
      frequency: 'monthly',
      nextRun: '2025-01-01T09:00:00Z',
      recipients: ['admin@jurisconnect.com'],
      active: true
    },
    {
      id: '2',
      templateId: '2',
      name: 'Performance Semanal',
      frequency: 'weekly',
      nextRun: '2024-12-23T08:00:00Z',
      recipients: ['admin@jurisconnect.com', 'gerencia@jurisconnect.com'],
      active: true
    }
  ];

  const availableFields = [
    { id: 'diligencias', label: 'Diligências', category: 'Operacional' },
    { id: 'receitas', label: 'Receitas', category: 'Financeiro' },
    { id: 'clientes', label: 'Clientes', category: 'Operacional' },
    { id: 'correspondentes', label: 'Correspondentes', category: 'Operacional' },
    { id: 'prazos', label: 'Prazos', category: 'Performance' },
    { id: 'avaliacoes', label: 'Avaliações', category: 'Performance' },
    { id: 'localizacao', label: 'Localização', category: 'Geográfico' },
    { id: 'status', label: 'Status', category: 'Operacional' },
    { id: 'tipos_diligencia', label: 'Tipos de Diligência', category: 'Operacional' },
    { id: 'pagamentos', label: 'Pagamentos', category: 'Financeiro' }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial': return 'bg-green-100 text-green-800';
      case 'operational': return 'bg-blue-100 text-blue-800';
      case 'performance': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'financial': return 'Financeiro';
      case 'operational': return 'Operacional';
      case 'performance': return 'Performance';
      default: return 'Personalizado';
    }
  };

  const generateReport = async (template: ReportTemplate, format: string) => {
    // Simular geração de relatório
    const loadingToast = { id: 'generating' };
    
    try {
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Em produção, isso seria uma chamada real para a API
      const blob = new Blob(['Dados do relatório simulado'], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${template.name.toLowerCase().replace(/\s+/g, '_')}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    }
  };

  const generateCustomReport = async () => {
    if (!customReport.name || customReport.fields.length === 0) {
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const blob = new Blob(['Dados do relatório personalizado'], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${customReport.name.toLowerCase().replace(/\s+/g, '_')}.${customReport.format}`;
      link.click();
      URL.revokeObjectURL(url);
      
      setShowCustomModal(false);
      setCustomReport({
        name: '',
        description: '',
        dateRange: { start: '', end: '' },
        filters: { status: 'all', priority: 'all', state: 'all', correspondent: 'all' },
        fields: [],
        format: 'pdf'
      });
    } catch (error) {
      console.error('Erro ao gerar relatório personalizado:', error);
    }
  };

  const toggleScheduledReport = (reportId: string) => {
    // Implementar toggle do relatório agendado
    console.log('Toggle scheduled report:', reportId);
  };

  const renderTemplates = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reportTemplates.map((template) => (
        <Card key={template.id} className="hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <template.icon className="h-6 w-6 text-blue-600" />
              </div>
              <Badge className={getCategoryColor(template.category)}>
                {getCategoryLabel(template.category)}
              </Badge>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{template.description}</p>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">Formatos disponíveis:</p>
                <div className="flex space-x-1">
                  {template.formats.map(format => (
                    <Badge key={format} variant="default" className="text-xs">
                      {format.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-2">
                {template.formats.map(format => (
                  <Button
                    key={format}
                    variant="outline"
                    size="sm"
                    onClick={() => generateReport(template, format)}
                    className="flex-1"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    {format.toUpperCase()}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTemplate(template);
                  setShowScheduleModal(true);
                }}
                className="w-full"
              >
                <Calendar className="h-3 w-3 mr-1" />
                Agendar
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderCustomReports = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Relatórios Personalizados</h2>
          <p className="text-gray-600">Crie relatórios customizados com os dados que você precisa</p>
        </div>
        <Button onClick={() => setShowCustomModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Relatório
        </Button>
      </div>

      <Card>
        <div className="p-6 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Construtor de Relatórios</h3>
          <p className="text-gray-600 mb-4">
            Use nosso construtor intuitivo para criar relatórios personalizados com filtros avançados
          </p>
          <Button onClick={() => setShowCustomModal(true)}>
            Começar
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderScheduledReports = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Relatórios Agendados</h2>
          <p className="text-gray-600">Geração automática de relatórios em intervalos regulares</p>
        </div>
      </div>

      <div className="space-y-4">
        {scheduledReports.map((report) => {
          const template = reportTemplates.find(t => t.id === report.templateId);
          
          return (
            <Card key={report.id}>
              <div className="flex items-center justify-between p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    {template && <template.icon className="h-6 w-6 text-purple-600" />}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                    <p className="text-gray-600">Baseado em: {template?.name}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Frequência: {report.frequency === 'daily' ? 'Diário' : report.frequency === 'weekly' ? 'Semanal' : 'Mensal'}</span>
                      <span>Próxima execução: {format(new Date(report.nextRun), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                      <span>Destinatários: {report.recipients.length}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge variant={report.active ? 'success' : 'default'}>
                    {report.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleScheduledReport(report.id)}
                  >
                    {report.active ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-600">Gere relatórios detalhados e análises do sistema</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'templates', label: 'Modelos', icon: FileText },
            { id: 'custom', label: 'Personalizados', icon: Settings },
            { id: 'scheduled', label: 'Agendados', icon: Calendar }
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
      {activeTab === 'templates' && renderTemplates()}
      {activeTab === 'custom' && renderCustomReports()}
      {activeTab === 'scheduled' && renderScheduledReports()}

      {/* Modal de Relatório Personalizado */}
      <Modal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        title="Criar Relatório Personalizado"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Relatório
              </label>
              <input
                type="text"
                value={customReport.name}
                onChange={(e) => setCustomReport(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Análise Mensal de Performance"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formato
              </label>
              <select
                value={customReport.format}
                onChange={(e) => setCustomReport(prev => ({ ...prev, format: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (Opcional)
            </label>
            <textarea
              value={customReport.description}
              onChange={(e) => setCustomReport(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descreva o objetivo deste relatório..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Inicial
              </label>
              <input
                type="date"
                value={customReport.dateRange.start}
                onChange={(e) => setCustomReport(prev => ({ 
                  ...prev, 
                  dateRange: { ...prev.dateRange, start: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Final
              </label>
              <input
                type="date"
                value={customReport.dateRange.end}
                onChange={(e) => setCustomReport(prev => ({ 
                  ...prev, 
                  dateRange: { ...prev.dateRange, end: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Campos do Relatório
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableFields.map((field) => (
                <label key={field.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customReport.fields.includes(field.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCustomReport(prev => ({ 
                          ...prev, 
                          fields: [...prev.fields, field.id]
                        }));
                      } else {
                        setCustomReport(prev => ({ 
                          ...prev, 
                          fields: prev.fields.filter(f => f !== field.id)
                        }));
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{field.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={() => setShowCustomModal(false)}>
              Cancelar
            </Button>
            <Button onClick={generateCustomReport}>
              <Download className="h-4 w-4 mr-2" />
              Gerar Relatório
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Agendamento */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title={`Agendar - ${selectedTemplate?.name}`}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Configure a geração automática deste relatório
          </p>
          
          {/* Implementar formulário de agendamento */}
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Funcionalidade de agendamento em desenvolvimento</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Reports;