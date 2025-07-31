# 🎮 Guía del Modo Demo - FestiBox

## ¿Qué es el Modo Demo?

El modo demo te permite probar todo el flujo de compra de FestiBox **sin procesar pagos reales**. Es perfecto para:

- ✅ Probar la funcionalidad completa del carrito
- ✅ Verificar el proceso de checkout
- ✅ Simular pagos exitosos
- ✅ Probar la integración de fotos y mensajes
- ✅ Validar el flujo de confirmación de pedidos

## 🚀 Cómo Activar el Modo Demo

### Opción 1: Ya está activado (por defecto)
Si ves el indicador amarillo "🎮 MODO DEMO ACTIVADO" en la esquina superior derecha, ya estás en modo demo.

### Opción 2: Activarlo manualmente
1. Abre el archivo `.env.local` en la raíz del proyecto
2. Asegúrate de que contenga:
   ```
   VITE_DEMO_MODE=true
   ```
3. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 🛒 Cómo Probar el Flujo Completo

### Paso 1: Seleccionar Producto
1. Ve a http://localhost:5173
2. Elige cualquier producto (ej: Tarjeta Explosiva Simple)

### Paso 2: Personalizar
1. Sube hasta 12 fotos usando drag & drop
2. Reordena las fotos como quieras
3. Agrega mensajes personalizados
4. Haz clic en "Agregar al Carrito"

### Paso 3: Checkout Demo
1. Abre el carrito (icono superior derecho)
2. Verifica que tus fotos y mensajes estén ahí
3. Haz clic en "Proceder al Checkout"
4. Completa los datos:
   - Email: `test@ejemplo.com`
   - Método de envío: cualquiera
   - Dirección: información de prueba
5. Haz clic en "Pagar con Flow"

### Paso 4: Simulación de Pago
En modo demo:
- **No se cobrará dinero real** 💸
- El sistema simulará 2 segundos de "procesamiento"
- Te redirigirá automáticamente a una página de éxito
- El carrito se vaciará como en un pago real

## 🔄 Cómo Cambiar a Modo Real (Producción)

### Para Sandbox de Flow (testing real)
1. Edita `.env.local`:
   ```
   VITE_DEMO_MODE=false
   FLOW_API_KEY=tu_api_key_sandbox
   FLOW_SECRET_KEY=tu_secret_key_sandbox
   FLOW_BASE_URL=https://sandbox.flow.cl/api
   ```

### Para Producción Real
1. Edita `.env.local`:
   ```
   VITE_DEMO_MODE=false
   FLOW_API_KEY=tu_api_key_produccion
   FLOW_SECRET_KEY=tu_secret_key_produccion
   FLOW_BASE_URL=https://www.flow.cl/api
   ```

2. Reinicia el servidor:
   ```bash
   npm run dev
   ```

## 🎯 Funcionalidades que Puedes Probar

### ✅ Sistema de Fotos
- Subida con drag & drop
- Conversión automática de HEIC a JPEG
- Compresión inteligente para productos impresos
- Recorte automático a formato cuadrado (1200x1200px)
- Persistencia tras refrescar la página

### ✅ Gestión del Carrito
- Agregar/eliminar productos
- Actualizar cantidades
- Persistencia en localStorage
- Vista previa de productos personalizados

### ✅ Proceso de Checkout
- Validación de formularios
- Cálculo de envíos
- Integración con métodos de pago
- Confirmación de pedidos

### ✅ Experiencia Mobile
- Diseño responsive
- Optimizado para touch
- Funcionalidad completa en móviles

## 🐛 Debugging

### Logs en Consola
El modo demo incluye logs detallados:
- `🎮 DEMO: Simulando creación de pago exitosa`
- `🎮 DEMO: Simulando redirección a Flow y pago exitoso`
- `🎮 DEMO: Simulando verificación de pago exitosa`

### Verificar Estado
- Abre las DevTools (F12)
- Ve a la consola para ver todos los logs
- Revisa localStorage para ver los datos guardados
- El indicador visual confirma que estás en modo demo

## 💡 Consejos para Testing

1. **Prueba con fotos reales**: Sube fotos desde tu teléfono para probar la compresión
2. **Testa el responsive**: Abre en móvil y desktop
3. **Verifica la persistencia**: Refresca la página y confirma que las fotos permanecen
4. **Prueba diferentes productos**: Cada tipo tiene configuraciones únicas
5. **Simula errores**: Intenta checkout sin email para ver validaciones

## 🚨 Recordatorios Importantes

- ⚠️ **NUNCA subas** el archivo `.env.local` a git
- ⚠️ **SIEMPRE verifica** que el modo demo esté desactivado en producción
- ⚠️ **Confirma** las credenciales de Flow antes de lanzar

---

¡Ya puedes probar toda la funcionalidad sin preocuparte por pagos reales! 🎉
