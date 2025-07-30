# FestiBox - Tienda Online de Tarjetas Explosivas 🎉

FestiBox es una tienda online especializada en tarjetas explosivas personalizadas. Los usuarios pueden subir sus fotos favoritas y crear tarjetas únicas que "explotan" al abrirse, revelando los recuerdos más especiales.

## ✨ Características Principales

- **📸 Subida de Imágenes**: Interfaz intuitiva para subir hasta 12 fotos por tarjeta
- **🔄 Drag & Drop**: Reordena las fotos arrastrándolas para personalizar tu tarjeta
- **📱 Responsive**: Diseño optimizado para móviles y desktop
- **🛒 E-commerce**: Sistema preparado para carrito de compras y procesamiento de pedidos
- **💰 Precios en CLP**: Formato de precios en pesos chilenos
- **🚚 Envío**: Información de envío incluida

## 🛠️ Stack Tecnológico

- **Vite** - Build tool ultra rápido
- **React 18** - Framework de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de CSS utility-first
- **@dnd-kit** - Biblioteca para drag & drop
- **react-dropzone** - Componente para subida de archivos
- **lucide-react** - Iconos modernos

## 🚀 Desarrollo

### Requisitos previos
- Node.js 18+ 
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes React reutilizables
│   ├── ImageUploader.tsx    # Componente principal de subida
│   └── SortableImageItem.tsx # Item arrastrable de imagen
├── types/              # Definiciones de TypeScript
│   └── index.ts           # Tipos principales (Product, Order, etc.)
├── utils/              # Utilidades
│   └── cn.ts             # Helper para clases CSS
├── App.tsx             # Componente principal
└── main.tsx            # Punto de entrada
```

## 🎯 Funcionalidades

### Tarjeta Explosiva Personalizada
- **Precio**: $15.990 CLP
- **12 espacios** para fotos personalizadas
- **Mecanismo explosivo** sorpresa al abrir
- **Material de alta calidad**
- **Envío gratis** en Santiago

### Proceso de Personalización
1. **Sube tus fotos**: Selecciona 12 imágenes especiales
2. **Reordena**: Arrastra las fotos para cambiar su posición
3. **Confirma**: Agrega al carrito cuando tengas las 12 fotos
4. **Recibe**: Entrega en 3-5 días hábiles

## 🎨 Diseño

- **Colores primarios**: Naranja (#de5a16) y azul (#0284c7)
- **Tipografía**: Inter font family
- **Responsive**: Mobile-first design
- **Accesibilidad**: Controles con teclado y screen readers

## 📦 Próximas Funcionalidades

- [ ] Sistema completo de carrito de compras
- [ ] Integración con pasarelas de pago chilenas (WebPay, MercadoPago)
- [ ] Panel de administración de pedidos
- [ ] Sistema de usuarios y autenticación
- [ ] Galería de productos adicionales
- [ ] Notificaciones por email/WhatsApp
- [ ] Tracking de pedidos

## 💼 Contacto

- **Instagram**: [@festiboxcl](https://instagram.com/festiboxcl)
- **Dominio**: festibox.cl

## 🚀 Despliegue

Este proyecto está configurado para desplegarse fácilmente en Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/clfestibox/festibox)

### Variables de Entorno

Copia `.env.example` a `.env.local` y configura las variables necesarias.

---

*Desarrollado con ❤️ para crear regalos que explotan de amor y recuerdos*
