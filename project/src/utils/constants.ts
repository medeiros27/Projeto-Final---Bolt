export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  DILIGENCES: '/diligences',
  USERS: '/users',
  CORRESPONDENTS: '/correspondents',
  FINANCIAL: '/financial',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  MY_DILIGENCES: '/my-diligences',
  NEW_DILIGENCE: '/new-diligence',
  AVAILABLE_DILIGENCES: '/available-diligences'
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client',
  CORRESPONDENT: 'correspondent'
} as const;

export const DILIGENCE_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const DILIGENCE_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
} as const;

export const FILE_TYPES = {
  PDF: 'application/pdf',
  DOC: 'application/msword',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  JPG: 'image/jpeg',
  PNG: 'image/png'
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const BRAZILIAN_STATES = [
  { code: 'AC', name: 'Acre' },
  { code: 'AL', name: 'Alagoas' },
  { code: 'AP', name: 'Amapá' },
  { code: 'AM', name: 'Amazonas' },
  { code: 'BA', name: 'Bahia' },
  { code: 'CE', name: 'Ceará' },
  { code: 'DF', name: 'Distrito Federal' },
  { code: 'ES', name: 'Espírito Santo' },
  { code: 'GO', name: 'Goiás' },
  { code: 'MA', name: 'Maranhão' },
  { code: 'MT', name: 'Mato Grosso' },
  { code: 'MS', name: 'Mato Grosso do Sul' },
  { code: 'MG', name: 'Minas Gerais' },
  { code: 'PA', name: 'Pará' },
  { code: 'PB', name: 'Paraíba' },
  { code: 'PR', name: 'Paraná' },
  { code: 'PE', name: 'Pernambuco' },
  { code: 'PI', name: 'Piauí' },
  { code: 'RJ', name: 'Rio de Janeiro' },
  { code: 'RN', name: 'Rio Grande do Norte' },
  { code: 'RS', name: 'Rio Grande do Sul' },
  { code: 'RO', name: 'Rondônia' },
  { code: 'RR', name: 'Roraima' },
  { code: 'SC', name: 'Santa Catarina' },
  { code: 'SP', name: 'São Paulo' },
  { code: 'SE', name: 'Sergipe' },
  { code: 'TO', name: 'Tocantins' }
] as const;

export const DILIGENCE_TYPES = [
  // Prepostos
  'Preposto Trabalhista Presencial Conciliação Inicial',
  'Preposto Cível Presencial Conciliação Inicial',
  'Preposto Trabalhista Presencial Instrução',
  'Preposto Cível Presencial Instrução',
  
  // Advogados
  'Advogado Trabalhista Presencial Conciliação Inicial',
  'Advogado Cível Presencial Conciliação Inicial',
  'Advogado Trabalhista Presencial Instrução',
  'Advogado Cível Presencial Instrução',
  
  // Advogado + Preposto
  'Advogado + Preposto Trabalhista Presencial Conciliação Inicial',
  'Advogado + Preposto Cível Presencial Conciliação Inicial',
  'Advogado + Preposto Trabalhista Presencial Instrução',
  'Advogado + Preposto Cível Presencial Instrução',
  
  // Serviços Processuais
  'Despacho Processual',
  'Protocolo',
  'Sustentação Oral',
  'Cópia (Volume)',
  'Visita In Loco',
  'Acompanhamento de Perícia',
  'Elaboração de Peças',
  'Serviços em Cartório',
  'Acompanhamentos',
  'Guias',
  'Cargas',
  'Demandas em Prefeitura'
] as const;

export const SUGGESTED_VALUES = {
  'Preposto Trabalhista Presencial Conciliação Inicial': 300,
  'Preposto Cível Presencial Conciliação Inicial': 300,
  'Preposto Trabalhista Presencial Instrução': 350,
  'Preposto Cível Presencial Instrução': 350,
  'Advogado Trabalhista Presencial Conciliação Inicial': 500,
  'Advogado Cível Presencial Conciliação Inicial': 500,
  'Advogado Trabalhista Presencial Instrução': 600,
  'Advogado Cível Presencial Instrução': 600,
  'Advogado + Preposto Trabalhista Presencial Conciliação Inicial': 800,
  'Advogado + Preposto Cível Presencial Conciliação Inicial': 800,
  'Advogado + Preposto Trabalhista Presencial Instrução': 900,
  'Advogado + Preposto Cível Presencial Instrução': 900,
  'Despacho Processual': 150,
  'Protocolo': 100,
  'Sustentação Oral': 600,
  'Cópia (Volume)': 80,
  'Visita In Loco': 250,
  'Acompanhamento de Perícia': 400,
  'Elaboração de Peças': 350,
  'Serviços em Cartório': 200,
  'Acompanhamentos': 200,
  'Guias': 100,
  'Cargas': 150,
  'Demandas em Prefeitura': 300
} as const;