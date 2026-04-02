#!/bin/bash
# Setup script para el PC de la barra

echo "⚙️ Configurando el PC de la barra para camarerIO..."

# 1. Permisos USB para la impresora
# Añadir el usuario actual al grupo lp (y lpadmin / dialout por si acaso) para acceder a /dev/usb/lp0 sin sudo
sudo usermod -a -G lp $USER
sudo usermod -a -G dialout $USER

echo "✅ Permisos USB concedidos. Es posible que tengas que cerrar sesión y volver a entrar o reiniciar el PC para que los permisos tengan efecto."

# 2. Instrucciones para la IP Estática
echo ""
echo "🛑 IMPORTANTE: IP ESTÁTICA"
echo "Asegúrate de que este PC tiene una IP estática configurada en el router del bar para evitar problemas de conexión si accedes en red local."
echo ""

# 3. Crear el archivo .env en print-bridge
echo "Creando archivo .env por defecto para el print-bridge..."
cat << EOF > print-bridge/.env
# URL de tu backend en Render u otro servidor
BACKEND_URL=https://camarerio.onrender.com

# Archivo de simulación (Para probar sin impresora física)
# Pon a "true" para simular en simulador_ticket.txt, o "false" para usar la impresora USB real
SIMULATE_PRINTER=true
EOF

echo "✅ Archivo .env configurado."
echo ""
echo "🚀 Todo listo. Ve a la carpeta print-bridge y ejecuta: node index.js"
