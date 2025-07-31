// Utilidades para procesamiento de imágenes

export interface ImagePosition {
  x: number;
  y: number;
}

// Generar imagen cropeada según posición del usuario
export const cropImageToSquare = (file: File, imagePosition?: ImagePosition): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Tamaño del cuadrado final (optimizado para impresión e redes sociales)
      const squareSize = 1200; // 1200x1200px - perfecto para impresión 8x8cm (377 DPI) y redes sociales
      canvas.width = squareSize;
      canvas.height = squareSize;
      
      // Calcular el crop basado en la posición del usuario
      const { width: originalWidth, height: originalHeight } = img;
      const xPercent = imagePosition?.x || 50; // Default centrado
      const yPercent = imagePosition?.y || 50; // Default centrado
      
      // Determinar el lado más pequeño para hacer el crop cuadrado
      const cropSize = Math.min(originalWidth, originalHeight);
      
      // Calcular posición del crop basada en el porcentaje del usuario
      const maxOffsetX = originalWidth - cropSize;
      const maxOffsetY = originalHeight - cropSize;
      
      const cropX = (maxOffsetX * xPercent) / 100;
      const cropY = (maxOffsetY * yPercent) / 100;
      
      // Dibujar la porción cropeada en el canvas cuadrado
      ctx.drawImage(
        img,
        cropX, cropY, cropSize, cropSize, // Source: área a recortar
        0, 0, squareSize, squareSize       // Destination: canvas completo
      );
      
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedFile = new File([blob], 
            file.name.replace(/\.[^/.]+$/, '_cropped.jpg'), {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(croppedFile);
        } else {
          resolve(file); // Fallback al archivo original
        }
      }, 'image/jpeg', 0.95); // Alta calidad para impresión
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Comprimir imagen manteniendo calidad para impresión
export const compressImageForPrint = (file: File, quality: number = 0.92): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // Reducir tamaño manteniendo aspect ratio - aumentado para mejor calidad de impresión
      const maxSize = 1200; // Aumentado de 800px a 1200px para mejor calidad
      let { width, height } = img;
      
      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        } else {
          resolve(file); // Fallback al archivo original
        }
      }, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
