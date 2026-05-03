import { useState } from 'react';

const CashCalculatorModal = ({ total, onConfirm, onCancel }) => {
  const [amountGivenStr, setAmountGivenStr] = useState('');

  const handleNumber = (num) => {
    // Evitar demasiados decimales o longitudes irreales
    if (amountGivenStr.length > 8) return;
    if (num === '.' && amountGivenStr.includes('.')) return;
    setAmountGivenStr(prev => prev + num);
  };

  const handleBackspace = () => {
    setAmountGivenStr(prev => prev.slice(0, -1));
  };

  const handleExact = () => {
    setAmountGivenStr(total.toString());
  };

  const amountGiven = parseFloat(amountGivenStr) || 0;
  const change = amountGiven - total;
  const isValid = amountGiven >= total;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-green-600 text-white p-4 text-center">
          <h2 className="text-xl font-bold">Cobro en Efectivo</h2>
        </div>
        
        <div className="p-6 bg-neutral-50 flex flex-col items-center">
          <div className="text-sm text-neutral-500 font-semibold uppercase tracking-wider mb-1">Total a cobrar</div>
          <div className="text-4xl font-black text-neutral-800 mb-6">${total.toFixed(2)}</div>
          
          <div className="w-full bg-white border border-neutral-200 rounded-xl p-4 mb-2 flex justify-between items-center shadow-sm">
            <span className="text-neutral-500 font-medium">Entregado:</span>
            <span className="text-3xl font-bold text-blue-600">
              ${amountGivenStr ? amountGivenStr : '0.00'}
            </span>
          </div>

          <div className={`w-full rounded-xl p-4 flex justify-between items-center transition-colors ${isValid ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-600'}`}>
            <span className="font-semibold">Cambio:</span>
            <span className="text-2xl font-bold">
              ${change >= 0 ? change.toFixed(2) : '0.00'}
            </span>
          </div>
        </div>

        <div className="p-4 bg-white grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleNumber(num.toString())}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-2xl font-semibold py-4 rounded-xl transition-colors active:bg-neutral-300"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleNumber('.')}
            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-2xl font-semibold py-4 rounded-xl transition-colors active:bg-neutral-300"
          >
            .
          </button>
          <button
            onClick={() => handleNumber('0')}
            className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-2xl font-semibold py-4 rounded-xl transition-colors active:bg-neutral-300"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="bg-red-100 hover:bg-red-200 text-red-600 text-2xl font-semibold py-4 rounded-xl transition-colors flex items-center justify-center active:bg-red-300"
          >
            ⌫
          </button>
        </div>

        <div className="p-4 bg-white border-t border-neutral-100 flex flex-col gap-3">
          <button 
            onClick={handleExact}
            className="w-full py-3 bg-blue-100 text-blue-700 font-bold rounded-xl hover:bg-blue-200 transition-colors"
          >
            Importe Exacto
          </button>
          <div className="flex gap-3">
            <button 
              onClick={onCancel}
              className="flex-1 py-4 bg-neutral-200 text-neutral-700 font-bold rounded-xl hover:bg-neutral-300 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => onConfirm(amountGiven)}
              disabled={!isValid}
              className="flex-1 py-4 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              Cobrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashCalculatorModal;
