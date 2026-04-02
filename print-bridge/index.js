const { io } = require('socket.io-client');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
require('dotenv').config();

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

const socket = io(BACKEND_URL);

socket.on('connect', () => {
  console.log('✅ Conectado al backend:', BACKEND_URL);
  console.log('🖨️  Print Bridge Nativo (Bash) Activado.');
});

socket.on('disconnect', () => {
  console.log('❌ Desconectado del backend');
});

socket.on('print-job', async (data) => {
  console.log(`\n📥 Recibida petición de impresión delegada: [${data.type}]`);
  
  if (data.type === 'ticket') {
    try {
      const escapedText = data.text.replace(/'/g, "'\\''");
      // Mantenemos 5-6 saltos de línea para que el texto avance más allá del cabezal térmico crudo hasta la cuchilla
      const command = `printf -- '%b' '${escapedText}\\n\\n\\n\\n\\n\\n\\x1d\\x56\\x00' > /dev/usb/lp0`;
      await execPromise(command, { shell: '/bin/bash' });
      console.log('✅ Ticket impreso nativamente en hardware local.');
    } catch (err) {
      console.error('❌ Error al imprimir el ticket (revisa la impresora o permisos):', err.message);
    }
  } else if (data.type === 'drawer') {
    try {
      const command = `printf -- '%b' '\\x1b\\x70\\x00\\x19\\xff' > /dev/usb/lp0`;
      await execPromise(command, { shell: '/bin/bash' });
      console.log('✅ Cajón abierto nativamente en hardware local.');
    } catch (err) {
      console.error('❌ Error al abrir el cajón (revisa la impresora o permisos):', err.message);
    }
  }
});
