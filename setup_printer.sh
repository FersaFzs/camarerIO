#!/bin/bash

echo "============================================="
echo " Configuración de Entorno CamarerIO Printer "
echo "============================================="
echo ""

# Verificar si se corre con sudo
if [ "$EUID" -ne 0 ]; then
  echo "Por favor, ejecuta este script con permisos de superusuario (sudo)"
  exit 1
fi

# 1. Obtener el usuario original (el que llamó a sudo)
ORIGINAL_USER=${SUDO_USER:-$USER}

echo "[1/3] Añadiendo al usuario '$ORIGINAL_USER' al grupo 'lp'..."
usermod -a -G lp "$ORIGINAL_USER"
if [ $? -eq 0 ]; then
  echo "✔ Usuario añadido correctamente."
else
  echo "✖ Hubo un problema al añadir el grupo."
fi

echo "[2/3] Creando reglas udev universales para impresoras térmicas USB..."
cat << 'EOF' > /etc/udev/rules.d/99-usb-printer.rules
# Regla genérica para dar permisos 0666 a cualquier impresora térmica detectada
SUBSYSTEM=="usb", KERNEL=="lp[0-9]*", MODE="0666", GROUP="lp"
EOF
echo "✔ Regla udev configurada."

echo "[3/3] Recargando reglas del sistema..."
udevadm control --reload-rules
udevadm trigger

echo ""
echo "============================================="
echo " ¡Configuración Completada! "
echo "============================================="
echo "NOTA IMPORTANTE: Para que el cambio de grupo surta efecto,"
echo "debes CERRAR SESIÓN e iniciar de nuevo en tu usuario de Linux,"
echo "o bien reiniciar el ordenador."
echo "Después de esto, CamarerIO podrá comunicarse nativamente con la impresora."
