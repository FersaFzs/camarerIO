import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://camarerio.onrender.com';

const GlobalPrinter = () => {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['polling'] });
    socket.on('print-job', async (data) => {
      try {
        let escpos = "\x1B\x40"; // Initialize printer
        
        if (data.type === 'ticket' && data.text) {
          let safeText = data.text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          escpos += safeText;
          escpos += "\n\n\n\n\n\n\x1D\x56\x00"; // Cut paper
          escpos += "\x1B\x70\x00\x19\xFA"; // Open drawer
        } else if (data.type === 'drawer') {
          escpos += "\x1B\x70\x00\x19\xFA"; // Open drawer only
        }

        escpos = escpos.replace(/[^\x00-\xFF]/g, "?");
        const bytes = new Uint8Array(escpos.length);
        for (let i = 0; i < escpos.length; i++) {
          bytes[i] = escpos.charCodeAt(i) & 0xFF;
        }

        // Conectar a RawBT por WebSocket
        const wsRawBT = new WebSocket('ws://127.0.0.1:40213/');
        
        wsRawBT.onopen = () => {
          wsRawBT.send(bytes);
          wsRawBT.close();
          setToast({ msg: 'Impreso por RawBT', type: 'success' });
          setTimeout(() => setToast(null), 3000);
        };

        wsRawBT.onerror = () => {
          console.warn('Fallo WebSocket RawBT, probando Intent Url...');
          // Si el WebSocket falla (por HTTPS mixto), usamos intent
          const base64Data = btoa(escpos);
          const intentUrl = `intent:base64,${base64Data}#Intent;scheme=rawbt;package=ru.a402d.rawbtprinter;end;`;
          
          const link = document.createElement('a');
          link.href = intentUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          setToast({ msg: 'Intento por App RawBT (Revisa Contenido Inseguro)', type: 'error' });
          setTimeout(() => setToast(null), 5000);
        };

      } catch (err) {
        console.error('Error al procesar impresión:', err);
      }
    });

    return () => socket.disconnect();
  }, []);

  if (!toast) return null;

  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-xl z-[9999] font-bold text-white transition-all ${toast.type === 'error' ? 'bg-orange-500' : 'bg-green-600'}`}>
      {toast.msg}
    </div>
  );
};

export default GlobalPrinter;
