/**
 * Formata uma data no formato DD/MM/YYYY
 * @param dateString String ISO de data
 * @returns String formatada
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Formata uma data completa com hora no formato DD/MM/YYYY HH:MM
 * @param dateString String ISO de data
 * @returns String formatada
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Converte uma string de data para o formato aceito pelo input type="date"
 * @param dateString String ISO de data
 * @returns String no formato YYYY-MM-DD
 */
export const toInputDateFormat = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}; 