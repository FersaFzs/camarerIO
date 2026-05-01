let usbDevice = null;

export const isWebUSBSupported = () => {
  return navigator.usb !== undefined;
};

export const connectWebUSB = async () => {
  try {
    // Pedir permiso al usuario para conectarse a cualquier dispositivo USB (la impresora)
    const device = await navigator.usb.requestDevice({ 
      filters: [] 
    });
    
    await device.open();
    if (device.configuration === null) {
      await device.selectConfiguration(1);
    }
    
    // Buscar la interfaz correcta para impresora
    let interfaceNumber = 0;
    for (const iface of device.configuration.interfaces) {
      // Las impresoras suelen tener bInterfaceClass === 7 (Printer)
      if (iface.alternate.interfaceClass === 7) {
        interfaceNumber = iface.interfaceNumber;
        break;
      }
    }

    try {
      await device.claimInterface(interfaceNumber);
    } catch (e) {
      // Si el SO ha capturado la interfaz, esto falla en algunos OS (como Linux sin reglas udev). 
      // En Android PWA suele funcionar directo.
      console.error('Error claiming interface, trying to force...', e);
      throw e;
    }
    
    usbDevice = device;
    return true;
  } catch (error) {
    console.error('Error conectando a WebUSB:', error);
    return false;
  }
};

export const autoConnectWebUSB = async () => {
  if (!isWebUSBSupported()) return false;
  try {
    const devices = await navigator.usb.getDevices();
    if (devices.length > 0) {
      const device = devices[0];
      await device.open();
      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }
      
      let interfaceNumber = 0;
      for (const iface of device.configuration.interfaces) {
        if (iface.alternate.interfaceClass === 7) {
          interfaceNumber = iface.interfaceNumber;
          break;
        }
      }

      await device.claimInterface(interfaceNumber);
      usbDevice = device;
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error autoconectando a WebUSB:', error);
    return false;
  }
};

export const getConnectedUSBDeviceName = () => {
  return usbDevice ? (usbDevice.productName || 'Impresora Genérica') : null;
};

export const printWebUSB = async (data) => {
  if (!usbDevice) {
    throw new Error('No hay impresora USB vinculada. Pulsa en "Vincular Impresora USB" primero.');
  }

  // Encontrar el endpoint de salida
  let endpoint = null;
  const intf = usbDevice.configuration.interfaces.find(i => i.claimed)?.alternate || usbDevice.configuration.interfaces[0].alternate;
  for (const ep of intf.endpoints) {
    if (ep.direction === 'out') {
      endpoint = ep;
      break;
    }
  }

  if (!endpoint) {
    throw new Error('No se encontró canal de salida (endpoint out) en la impresora USB.');
  }

  let escpos = "\x1B\x40"; // Initialize printer
  
  if (data.type === 'drawer') {
     escpos += "\x1B\x70\x00\x19\xFA"; // Open drawer
  } else if (data.type === 'ticket' && data.text) {
     // Normalizar acentos
     let safeText = data.text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
     escpos += safeText;
     escpos += "\n\n\n\n\n\n\x1D\x56\x00"; // Cut paper
     escpos += "\x1B\x70\x00\x19\xFA"; // Open drawer
  }

  escpos = escpos.replace(/[^\x00-\xFF]/g, "?");
  
  const bytes = new Uint8Array(escpos.length);
  for (let i = 0; i < escpos.length; i++) {
    bytes[i] = escpos.charCodeAt(i) & 0xFF;
  }

  await usbDevice.transferOut(endpoint.endpointNumber, bytes);
};
