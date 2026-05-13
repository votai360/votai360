/**
 * Gera um link para o WhatsApp com uma mensagem pré-preenchida.
 * 
 * @param {string} phone - O número de telefone do eleitor (apenas números).
 * @param {string} message - A mensagem a ser enviada.
 * @returns {string} A URL formatada para abrir o WhatsApp (App ou Web).
 */
export function generateWhatsAppLink(phone, message) {
  // Remove tudo que não for número
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Adiciona o DDI do Brasil caso não tenha
  const fullPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
  
  // Codifica a mensagem para formato de URL
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${fullPhone}?text=${encodedMessage}`;
}

/**
 * Mensagens padrão para diferentes contextos de campanha
 */
export const whatsappTemplates = {
  welcome: (name, candidate) => `Olá ${name}! Aqui é da equipe do ${candidate}. Ficamos muito felizes com seu apoio! Posso salvar seu contato?`,
  event: (name, candidate, eventInfo) => `Oi ${name}, tudo bem? O ${candidate} vai estar na sua região: ${eventInfo}. Vamos?`,
  birthday: (name, candidate) => `Feliz aniversário ${name}! Que seu dia seja muito especial. Um grande abraço do ${candidate} e equipe.`,
};
