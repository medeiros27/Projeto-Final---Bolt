import { validateField, validateForm, validateEmail, validateCPF } from '../validation';

describe('Validation Utils', () => {
  describe('validateField', () => {
    it('validates required fields', () => {
      expect(validateField('', { required: true })).toBe('Este campo é obrigatório');
      expect(validateField('value', { required: true })).toBeNull();
      expect(validateField(null, { required: true })).toBe('Este campo é obrigatório');
    });

    it('validates minimum length', () => {
      expect(validateField('ab', { minLength: 3 })).toBe('Deve ter pelo menos 3 caracteres');
      expect(validateField('abc', { minLength: 3 })).toBeNull();
    });

    it('validates maximum length', () => {
      expect(validateField('abcdef', { maxLength: 5 })).toBe('Deve ter no máximo 5 caracteres');
      expect(validateField('abcde', { maxLength: 5 })).toBeNull();
    });

    it('validates patterns', () => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(validateField('invalid-email', { pattern: emailPattern })).toBe('Formato inválido');
      expect(validateField('test@example.com', { pattern: emailPattern })).toBeNull();
    });

    it('validates numeric ranges', () => {
      expect(validateField(5, { min: 10 })).toBe('Deve ser maior ou igual a 10');
      expect(validateField(15, { max: 10 })).toBe('Deve ser menor ou igual a 10');
      expect(validateField(10, { min: 5, max: 15 })).toBeNull();
    });

    it('validates custom rules', () => {
      const customRule = (value: string) => value === 'forbidden' ? 'Valor não permitido' : null;
      expect(validateField('forbidden', { custom: customRule })).toBe('Valor não permitido');
      expect(validateField('allowed', { custom: customRule })).toBeNull();
    });
  });

  describe('validateForm', () => {
    it('validates entire form', () => {
      const data = { name: '', email: 'invalid', age: 15 };
      const rules = {
        name: { required: true },
        email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        age: { min: 18 }
      };

      const errors = validateForm(data, rules);
      expect(errors.name).toBe('Este campo é obrigatório');
      expect(errors.email).toBe('Formato inválido');
      expect(errors.age).toBe('Deve ser maior ou igual a 18');
    });
  });

  describe('validateEmail', () => {
    it('validates email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
    });
  });

  describe('validateCPF', () => {
    it('validates CPF numbers', () => {
      expect(validateCPF('111.111.111-11')).toBe(false); // Invalid (repeated digits)
      expect(validateCPF('123.456.789-00')).toBe(false); // Invalid check digits
      expect(validateCPF('11144477735')).toBe(true); // Valid CPF
    });
  });
});