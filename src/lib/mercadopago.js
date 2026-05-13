// Configuração do Mercado Pago
// Substitua os links abaixo pelos links gerados no seu painel do Mercado Pago
// Painel: https://www.mercadopago.com.br > Cobranças > Links de Pagamento

export const MERCADOPAGO_LINKS = {
  vereador:    'https://mpago.la/2byxnii',  // R$ 59,90  ✅
  deputado:    'https://mpago.la/1fedmyW',  // R$ 100,00 ✅
  majoritario: 'https://mpago.la/1TZVKsY', // R$ 150,00 ✅
};

// Redireciona o usuário para o checkout do Mercado Pago
export function redirectToCheckout(planId) {
  const link = MERCADOPAGO_LINKS[planId];
  if (!link || link.startsWith('COLE_AQUI')) {
    alert('Link de pagamento ainda não configurado. Entre em contato com o administrador.');
    return;
  }
  window.open(link, '_blank');
}
