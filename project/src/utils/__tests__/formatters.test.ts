import { 
  formatCurrency, 
  formatPhone, 
  formatCPF, 
  formatFileSize,
  formatDate,
  truncateText,
  capitalize
} from '../formatters';

describe('Formatters', () => {
  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
      expect(formatCurrency(0)).toBe('R$ 0,00');
      expect(formatCurrency(1000000)).toBe('R$ 1.000.000,00');
    });
  });

  describe('formatPhone', () => {
    it('formats phone numbers correctly', () => {
      expect(formatPhone('11999887766')).toBe('(11) 99988-7766');
      expect(formatPhone('1199887766')).toBe('(11) 9988-7766');
      expect(formatPhone('11')).toBe('(11');
      expect(formatPhone('119988')).toBe('(11) 9988');
    });
  });

  describe('formatCPF', () => {
    it('formats CPF correctly', () => {
      expect(formatCPF('12345678901')).toBe('123.456.789-01');
      expect(formatCPF('123')).toBe('123');
      expect(formatCPF('123456')).toBe('123.456');
      expect(formatCPF('123456789')).toBe('123.456.789');
    });
  });

  describe('formatFileSize', () => {
    it('formats file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  describe('formatDate', () => {
    it('formats dates correctly', () => {
      const date = new Date('2024-12-20T10:30:00');
      expect(formatDate(date, 'short')).toBe('20/12/2024');
    });
  });

  describe('truncateText', () => {
    it('truncates text correctly', () => {
      expect(truncateText('Hello World', 5)).toBe('Hello...');
      expect(truncateText('Hi', 10)).toBe('Hi');
    });
  });

  describe('capitalize', () => {
    it('capitalizes text correctly', () => {
      expect(capitalize('hello world')).toBe('Hello world');
      expect(capitalize('HELLO')).toBe('Hello');
    });
  });
});