import React, { useEffect } from 'react';
import '../ticket-print.css';

const TicketView = ({ ticket, onClose, autoPrint = false }) => {
  useEffect(() => {
    if (autoPrint) {
      setTimeout(() => {
        window.print();
      }, 200);
    }
  }, [autoPrint]);

  if (!ticket) return null;

  return (
    <div id="ticket-print-content" className="bg-white p-8 max-w-md mx-auto font-mono text-sm print:p-0 ticket-print-root min-h-screen flex flex-col items-center justify-center">
      {/* Cabecera del ticket */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-bold">EL APALANQUE</h1>
        <p className="text-sm">Calle San Antonio, Kiosko 5</p>
        <p className="text-sm">Los Baños, Cortes y Graena, Granada, 18517</p>
      </div>

      {/* Información del ticket */}
      <div className="mb-4">
        <p>Ticket #: {ticket.ticketNumber}</p>
        <p>Mesa: {ticket.tableNumber}</p>
        <p>Fecha: {new Date(ticket.createdAt).toLocaleString()}</p>
      </div>

      {/* Línea separadora */}
      <div className="border-b border-black my-2"></div>

      {/* Items */}
      <div className="mb-4">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Cant</th>
              <th className="text-left">Producto</th>
              <th className="text-right">Precio</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {ticket.items.map((item, index) => (
              <tr key={index}>
                <td>{item.quantity}</td>
                <td>{item.name}</td>
                <td className="text-right">{item.price.toFixed(2)}€</td>
                <td className="text-right">{item.total.toFixed(2)}€</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Línea separadora */}
      <div className="border-b border-black my-2"></div>

      {/* Total */}
      <div className="text-right mb-4">
        <p className="font-bold">TOTAL: {ticket.total.toFixed(2)}€</p>
      </div>

      {/* Método de pago */}
      <div className="text-center mb-4">
        <p>Método de pago: {ticket.paymentMethod}</p>
      </div>

      {/* Pie del ticket */}
      <div className="text-center text-sm">
        <p>¡Gracias por su visita!</p>
        <p>IVA incluido</p>
      </div>

      {/* Botón de volver (solo visible en pantalla, no en impresión) */}
      <div className="mt-6 text-center print:hidden">
        <button
          onClick={onClose}
          className="bg-neutral-200 text-green-900 px-4 py-2 rounded hover:bg-neutral-300 transition-colors"
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default TicketView; 