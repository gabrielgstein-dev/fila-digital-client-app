import { shouldSkipCPFValidation, validateCPF } from '../cpf';

describe('CPF Validation Utils', () => {
  describe('shouldSkipCPFValidation', () => {
    it('deve retornar true para CPF 00000000001 em ambiente development', () => {
      expect(shouldSkipCPFValidation('000.000.000-01', 'development')).toBe(true);
    });

    it('deve retornar true para CPF 00000000002 em ambiente development', () => {
      expect(shouldSkipCPFValidation('000.000.000-02', 'development')).toBe(true);
    });

    it('deve retornar true para CPF 00000000001 em ambiente staging', () => {
      expect(shouldSkipCPFValidation('000.000.000-01', 'staging')).toBe(true);
    });

    it('deve retornar false para CPF 00000000001 em ambiente production', () => {
      expect(shouldSkipCPFValidation('000.000.000-01', 'production')).toBe(false);
    });

    it('deve retornar false para outros CPFs em ambiente development', () => {
      expect(shouldSkipCPFValidation('123.456.789-09', 'development')).toBe(false);
    });

    it('deve funcionar com CPF sem formatação', () => {
      expect(shouldSkipCPFValidation('00000000001', 'development')).toBe(true);
    });
  });

  describe('validateCPF com ambiente', () => {
    it('deve pular validação para CPF 00000000001 em development', () => {
      expect(validateCPF('000.000.000-01', 'development')).toBe(true);
    });

    it('deve pular validação para CPF 00000000002 em staging', () => {
      expect(validateCPF('000.000.000-02', 'staging')).toBe(true);
    });

    it('deve validar normalmente para CPF 00000000001 em production', () => {
      expect(validateCPF('000.000.000-01', 'production')).toBe(false);
    });

    it('deve validar normalmente para CPF válido em development', () => {
      expect(validateCPF('123.456.789-09', 'development')).toBe(true);
    });

    it('deve validar normalmente para CPF inválido em development', () => {
      expect(validateCPF('123.456.789-00', 'development')).toBe(false);
    });
  });
});
