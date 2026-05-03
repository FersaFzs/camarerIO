class PrinterService {
  /**
   * Generates a VeriFactu compliant ticket string
   */
  generateLegalTicketString(invoiceData, nif = "24210725M", name = "EL APALANQUE", address = "Calle San Antonio, Kioscos 5 y 6.\\n18517 Cortes y Graena.") {
    let ticket = `========= EL APALANQUE =========\n`;
    ticket += `NIF: ${nif}\n`;
    ticket += `${address}\n`;
    ticket += `--------------------------------\n`;
    ticket += `Factura Simplificada: ${invoiceData.invoiceNumber}\n`;
    ticket += `Fecha: ${new Date(invoiceData.date || Date.now()).toLocaleString()}\n`;
    ticket += `Mesa: ${invoiceData.tableNumber}\n`;
    ticket += `--------------------------------\n`;
    
    invoiceData.items.forEach(item => {
      const line = `${item.quantity}x ${item.name}`;
      const price = `$${item.total.toFixed(2)}`;
      const paddingLength = Math.max(1, 32 - line.length - price.length);
      const padding = ' '.repeat(paddingLength);
      ticket += `${line}${padding}${price}\n`;
    });
    
    ticket += `--------------------------------\n`;
    ticket += `Base Imponible: $${invoiceData.subtotal.toFixed(2)}\n`;
    ticket += `IVA (${invoiceData.taxRate}%): $${invoiceData.taxAmount.toFixed(2)}\n`;
    ticket += `TOTAL: $${Number(invoiceData.total).toFixed(2)}\n`;
    ticket += `Metodo: ${invoiceData.paymentMethod || 'Efectivo'}\n`;
    
    if (invoiceData.amountGiven && invoiceData.paymentMethod === 'efectivo') {
      const amountGiven = Number(invoiceData.amountGiven);
      const total = Number(invoiceData.total);
      if (amountGiven > total) {
        ticket += `Entregado: $${amountGiven.toFixed(2)}\n`;
        ticket += `Cambio: $${(amountGiven - total).toFixed(2)}\n`;
      } else if (amountGiven === total) {
        ticket += `Entregado: $${amountGiven.toFixed(2)} (Importe exacto)\n`;
      }
    }

    ticket += '¡GRACIAS POR SU VISITA!\n';

    return ticket;
  }

  /**
   * Emits a ticket payload to the local Print Bridge via Socket.io
   * @param {Object} io Socket.io instance
   * @param {string} text Content to print
   */
  async printTicket(io, text) {
    if (io) {
      io.emit('print-job', { type: 'ticket', text });
      console.log('Orden de impresión delegada al Print Bridge.');
    } else {
      console.warn('Advertencia: No hay conexión Socket.io activa para el Bridge de impresión.');
    }
  }

  /**
   * Emits a drawer open command to the local Print Bridge via Socket.io
   */
  async openDrawer(io) {
    if (io) {
      io.emit('print-job', { type: 'drawer' });
      console.log('Orden de apertura de cajón delegada al Print Bridge.');
    }
  }
}

export default new PrinterService();
