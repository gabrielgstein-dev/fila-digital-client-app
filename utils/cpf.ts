export const formatCPF = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.length <= 11) {
    let formatted = cleaned;
    if (cleaned.length > 3) {
      formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    }
    if (cleaned.length > 6) {
      formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    }
    if (cleaned.length > 9) {
      formatted = `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    }
    return formatted;
  }
  return value;
};

export const shouldSkipCPFValidation = (cpf: string, environment: string): boolean => {
  const cleanedCPF = cleanCPF(cpf);
  const isDevOrQA = environment === 'development' || environment === 'staging';
  const isSpecialCPF = cleanedCPF === '00000000001' || cleanedCPF === '00000000002';
  
  return isDevOrQA && isSpecialCPF;
};

export const validateCPF = (cpf: string, environment?: string): boolean => {
  if (environment && shouldSkipCPFValidation(cpf, environment)) {
    return true;
  }

  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cleaned)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(10))) return false;

  return true;
};

export const cleanCPF = (cpf: string): string => {
  return cpf.replace(/\D/g, '');
};
