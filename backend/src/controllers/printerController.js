// Endpoint para "Imprimir Cuenta" (Solo ticket en texto)
export const printPreTicket = async (req, res) => {
  try {
    const { tableNumber, items, total } = req.body;
    
    // Generar diseño de texto del ticket usando texto ASCII sencillo, 
    // será renderizado por la librería escpos local o simulador
    let ticketText = '--- CAMARERIO ---\n';
    ticketText += 'Ticket de Cuenta\n';
    ticketText += `Mesa: ${tableNumber}\n`;
    ticketText += `${new Date().toLocaleString()}\n`;
    ticketText += '--------------------------\n';
    
    items.forEach(item => {
      const line = `${item.quantity}x ${item.name}`;
      const price = `$${item.total.toFixed(2)}`;
      const paddingLength = Math.max(1, 26 - line.length - price.length);
      const padding = ' '.repeat(paddingLength);
      ticketText += `${line}${padding}${price}\n`;
    });
    
    ticketText += '--------------------------\n';
    ticketText += `TOTAL: $${Number(total).toFixed(2)}\n`;

    // Emitir vía Socket.IO
    if (req.io) {
      req.io.emit('print-job', {
        type: 'pre-ticket',
        text: ticketText
      });
    }
    
    res.status(200).json({ message: 'Pre-ticket enviado al puente de impresión.' });
  } catch (error) {
    console.error('Error al emitir pre-ticket:', error);
    res.status(500).json({ message: 'Error al emitir', error: error.message });
  }
};

// Endpoint para "Ticket de Pago" (Imprime y abre el cajón)
export const printPaymentTicket = async (req, res) => {
  try {
    const { tableNumber, items, total, paymentMethod } = req.body;
    
    let ticketText = '--- CAMARERIO ---\n';
    ticketText += 'Ticket Final (PAGADO)\n';
    ticketText += `Mesa: ${tableNumber}\n`;
    ticketText += `Método: ${paymentMethod}\n`;
    ticketText += `${new Date().toLocaleString()}\n`;
    ticketText += '--------------------------\n';
    
    items.forEach(item => {
      const line = `${item.quantity}x ${item.name}`;
      const price = `$${item.total.toFixed(2)}`;
      const paddingLength = Math.max(1, 26 - line.length - price.length);
      const padding = ' '.repeat(paddingLength);
      ticketText += `${line}${padding}${price}\n`;
    });
    
    ticketText += '--------------------------\n';
    ticketText += `TOTAL PAGADO: $${Number(total).toFixed(2)}\n`;
    ticketText += '¡GRACIAS POR SU VISITA!\n';

    if (req.io) {
      req.io.emit('print-job', {
        // Si el método es efectivo, envía tipo 'payment' para abrir el cajón
        type: paymentMethod === 'efectivo' ? 'payment' : 'ticket',
        text: ticketText
      });
    }
    
    res.status(200).json({ message: 'Ticket de pago enviado al puente de impresión.' });
  } catch (error) {
    console.error('Error al emitir ticket de pago:', error);
    res.status(500).json({ message: 'Error al emitir', error: error.message });
  }
};
