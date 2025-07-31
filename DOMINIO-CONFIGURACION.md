# Configuración Dominio festibox.cl en Vercel

## 📋 Pasos para Configurar el Dominio

### 1. En el Panel de Vercel
1. Ve a tu proyecto FestiBox en Vercel
2. Ir a **Settings** → **Domains**
3. Agregar dominio: `festibox.cl`
4. Agregar también: `www.festibox.cl`

### 2. Configuración DNS en tu Proveedor de Dominio
Necesitas configurar estos registros DNS:

#### Para el dominio raíz (festibox.cl):
```
Tipo: A
Nombre: @
Valor: 76.76.19.19
```

#### Para www (www.festibox.cl):
```
Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
```

### 3. Verificación SSL
- Vercel automáticamente configurará SSL
- Puede tomar hasta 24 horas en propagarse

### 4. Redirecciones Recomendadas
En Vercel, configurar redirección automática:
- `festibox.cl` → `www.festibox.cl` (recomendado)
- O viceversa según prefieras

## 🔧 Configuración Adicional Recomendada

### Email Profesional
Considera configurar email profesional:
- `contacto@festibox.cl`
- `ventas@festibox.cl`
- `info@festibox.cl`

### Subdominios Útiles
- `tienda.festibox.cl` (para futuras expansiones)
- `blog.festibox.cl` (para contenido SEO)

## ⚠️ Importante
Una vez configurado el dominio, actualizar las variables de entorno en Vercel:
- NEXT_PUBLIC_SITE_URL=https://www.festibox.cl
- Cualquier otra URL hardcodeada en el código

## 📱 Testing
Después de la configuración, verificar:
1. ✅ www.festibox.cl carga correctamente
2. ✅ festibox.cl redirecciona a www.festibox.cl
3. ✅ SSL funciona (https://)
4. ✅ Todas las imágenes y assets cargan
5. ✅ Google Analytics funciona con nuevo dominio
