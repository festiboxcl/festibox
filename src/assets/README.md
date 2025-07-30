# 📁 Recursos Gráficos - FestiBox

Esta carpeta contiene todos los assets visuales de tu tienda online.

## 🖼️ Cómo agregar tus imágenes

### 1. Logo Principal
- **Archivo recomendado**: `festibox-logo.png` o `festibox-logo.svg`
- **Ubicación**: `src/assets/images/`
- **Tamaños recomendados**: 
  - PNG: 400x160px (alta resolución)
  - SVG: Vectorial (preferido)

### 2. Imágenes de Productos
- **Tarjeta explosiva cerrada**: `explosive-card-closed.jpg`
- **Tarjeta explosiva abierta**: `explosive-card-open.jpg`
- **Galería de ejemplos**: `gallery-1.jpg`, `gallery-2.jpg`, etc.

### 3. Imágenes de Proceso
- **Paso 1 - Subir fotos**: `step-upload.jpg`
- **Paso 2 - Creación**: `step-create.jpg`
- **Paso 3 - Entrega**: `step-deliver.jpg`

## 🎨 Especificaciones Técnicas

### Formatos Recomendados
- **Logo**: SVG o PNG con fondo transparente
- **Fotos de productos**: JPG o WebP
- **Iconos**: SVG preferido

### Tamaños Optimizados
- **Logo header**: 160x64px
- **Logo footer**: 200x80px
- **Producto principal**: 600x600px
- **Galería**: 300x300px
- **Hero images**: 1200x600px

### Optimización
- Todas las imágenes deben estar optimizadas para web
- Peso máximo recomendado: 200KB por imagen
- Usa herramientas como TinyPNG o ImageOptim

## 🔧 Cómo implementar tus imágenes

1. **Guarda tus archivos** en `src/assets/images/`

2. **Actualiza el archivo** `src/assets/index.ts`:
```typescript
import logoImg from './images/festibox-logo.png';
import explosiveCardImg from './images/explosive-card-closed.jpg';

export const assets = {
  logo: logoImg,
  explosiveCard: explosiveCardImg,
  // ... más imágenes
};
```

3. **Actualiza el componente Logo** en `src/components/Logo.tsx`:
```typescript
import { assets } from '../assets';

export function Logo({ className = '', size = 'md' }: LogoProps) {
  return (
    <img 
      src={assets.logo} 
      alt="FestiBox" 
      className={`${sizeClasses[size]} ${className}`}
    />
  );
}
```

## 📋 Checklist de Recursos

- [ ] Logo principal (SVG/PNG)
- [ ] Favicon (32x32px)
- [ ] Imagen de tarjeta explosiva cerrada
- [ ] Imagen de tarjeta explosiva abierta
- [ ] Galería de ejemplos (al menos 6 fotos)
- [ ] Imágenes del proceso paso a paso
- [ ] Imagen de hero/banner principal
- [ ] Iconos personalizados (si los tienes)

## 🚀 Próximos Pasos

1. Reemplaza el logo SVG placeholder con tu logo real
2. Agrega fotos de alta calidad de tus productos
3. Crea una galería de tarjetas explosivas de ejemplo
4. Optimiza todas las imágenes para web
5. Prueba la carga en diferentes dispositivos

¿Necesitas ayuda para implementar alguna imagen específica? ¡Solo dime cuál quieres agregar!
