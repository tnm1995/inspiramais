
/**
 * Remove caracteres não numéricos.
 */
export const cleanCPF = (cpf: string): string => {
    return cpf.replace(/\D/g, '');
};

/**
 * Validação algorítmica estrita de CPF (Padrão Receita Federal).
 * Verifica dígitos verificadores e rejeita sequências repetidas.
 */
export const validateCPF = (cpf: string): boolean => {
    const strCPF = cleanCPF(cpf);
    
    // Verifica tamanho
    if (strCPF.length !== 11) return false;
    
    // Verifica sequências iguais (ex: 111.111.111-11) que passam no cálculo mas são inválidas
    if (/^(\d)\1+$/.test(strCPF)) return false;

    // Validação do 1º Dígito
    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
        sum = sum + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;

    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(strCPF.substring(9, 10))) return false;

    // Validação do 2º Dígito
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum = sum + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;

    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(strCPF.substring(10, 11))) return false;

    return true;
};

/**
 * Formata CPF para exibição (000.000.000-00)
 */
export const formatCPF = (value: string): string => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};
