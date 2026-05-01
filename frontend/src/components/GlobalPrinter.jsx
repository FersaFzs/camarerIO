import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { autoConnectWebUSB, printWebUSB, getConnectedUSBDeviceName } from '../services/webusb';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://camarerio.onrender.com';

const GlobalPrinter = () => {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Intentar auto-conectar
    autoConnectWebUSB().then(success => {
      if (success) console.log('Impresora USB reconectada silenciosamente:', getConnectedUSBDeviceName());
    });

    const socket = io(SOCKET_URL, { transports: ['polling'] });
    socket.on('print-job', async (data) => {
      try {
        await printWebUSB(data);
        console.log('Impreso vía WebUSB Nativo');
        setToast({ msg: 'Imprimiendo ticket...', type: 'success' });
        setTimeout(() => setToast(null), 3000);
      } catch (err) {
        console.error('Error al imprimir por WebUSB:', err);
        setToast({ msg: 'Fallo de Impresión: ' + (err.message || 'Desconocido'), type: 'error' });
        setTimeout(() => setToast(null), 5000);
      }
    });

    return () => socket.disconnect();
  }, []);

  if (!toast) return null;

  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-xl z-[9999] font-bold text-white transition-all ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
      {toast.msg}
    </div>
  );
};

export default GlobalPrinter;
