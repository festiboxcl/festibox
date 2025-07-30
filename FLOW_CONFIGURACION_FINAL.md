# 🎉 FLOW API - PROBLEMA RESUELTO

## ✅ Problema Identificado
Las credenciales del dashboard de Flow eran para **PRODUCCIÓN**, no para sandbox.

## ✅ Solución Implementada
- Cambiado endpoint de `https://sandbox.flow.cl/api` a `https://www.flow.cl/api`
- Validada autenticación HMAC-SHA256 con test directo
- Código actualizado y funcionando correctamente

---

## 🔧 CONFIGURACIÓN DE VARIABLES DE ENTORNO EN VERCEL

### Paso 1: Acceder al Dashboard de Vercel
1. Ve a https://vercel.com/dashboard
2. Selecciona el proyecto `festibox`
3. Ve a la pestaña **Settings**
4. Selecciona **Environment Variables**

### Paso 2: Agregar Variables de Producción
Agrega estas 3 variables exactamente como aparecen:

#### Variable 1:
- **Name:** `FLOW_API_KEY`
- **Value:** `1F35DEE4-1B10-49E6-A226-55845L8E1A12`
- **Environment:** `Production`, `Preview`, `Development`

#### Variable 2:
- **Name:** `FLOW_SECRET_KEY`
- **Value:** `1f47dd2ce362449c28a2c6805f8495b74cd684a1`
- **Environment:** `Production`, `Preview`, `Development`

#### Variable 3:
- **Name:** `FLOW_BASE_URL`
- **Value:** `https://www.flow.cl/api`
- **Environment:** `Production`, `Preview`, `Development`

### Paso 3: Redesplegar (Opcional)
Si las variables no se aplican automáticamente:
1. Ve a la pestaña **Deployments**
2. Haz clic en **Redeploy** en el último deployment

---

## ✅ Test de Verificación

Para confirmar que todo funciona:

```bash
# Test directo con curl (debería responder HTTP 200)
curl "https://www.flow.cl/api/merchant/list?apiKey=1F35DEE4-1B10-49E6-A226-55845L8E1A12&s=d95912484645caa09be0514e66cb616f030ac23839824d875861b822cac156f5"
```

**Respuesta esperada:**
```json
{"total":0,"hasMore":false,"data":[]}
```

---

## 🚀 Siguientes Pasos

1. **Configurar variables en Vercel** (usando la guía de arriba)
2. **Probar endpoint de pagos** desde el frontend
3. **Configurar URLs de confirmación** apuntando a tu dominio
4. **Probar flujo completo** de pago

---

## 📋 URLs de Confirmación Recomendadas

Para los pagos, usar estas URLs:

- **urlConfirmation:** `https://festibox.vercel.app/api/flow/confirmation`
- **urlReturn:** `https://festibox.vercel.app/order-success`

---

## 🔍 Debugging

Si tienes problemas:

1. Verifica que las variables estén configuradas en Vercel
2. Checa los logs de Vercel Functions en tiempo real
3. Usa el endpoint `/api/flow/test-env` para verificar configuración

**Comando de debug:**
```bash
curl https://festibox.vercel.app/api/flow/test-env
```
