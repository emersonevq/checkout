export interface DeviceData {
  ip: string | null;
  userAgent: string;
  browserName: string;
  browserVersion: string;
  osName: string;
  osVersion: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  deviceModel: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
  timezone: string;
  connectionType: string;
  cores: number;
  ram: number;
  gpu: string;
  timestamp: string;
}

export interface Payment {
  id: string;
  nomeCompleto: string;
  cpf: string;
  numeroCartao: string;
  validade: string;
  cvv: string;
  dataCriacao: Date;
  status: 'pendente' | 'processado' | 'erro';
  deviceData?: DeviceData;
}

// Dados mock para demonstração
export const mockPayments: Payment[] = [
  {
    id: '1',
    nomeCompleto: 'João da Silva',
    cpf: '123.456.789-00',
    numeroCartao: '**** **** **** 1234',
    validade: '12/26',
    cvv: '123',
    dataCriacao: new Date('2024-12-28T10:30:00'),
    status: 'processado',
  },
  {
    id: '2',
    nomeCompleto: 'Maria Santos',
    cpf: '987.654.321-00',
    numeroCartao: '**** **** **** 5678',
    validade: '08/25',
    cvv: '456',
    dataCriacao: new Date('2024-12-29T14:15:00'),
    status: 'pendente',
  },
  {
    id: '3',
    nomeCompleto: 'Carlos Oliveira',
    cpf: '456.789.123-00',
    numeroCartao: '**** **** **** 9012',
    validade: '03/27',
    cvv: '789',
    dataCriacao: new Date('2024-12-30T09:45:00'),
    status: 'processado',
  },
  {
    id: '4',
    nomeCompleto: 'Ana Costa',
    cpf: '321.654.987-00',
    numeroCartao: '**** **** **** 3456',
    validade: '11/25',
    cvv: '321',
    dataCriacao: new Date('2024-12-30T11:20:00'),
    status: 'erro',
  },
];
