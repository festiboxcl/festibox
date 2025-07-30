import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
// import { SortableItem } from './SortableImageItem.tsx';
import type { UploadedImage } from '../types';
import { Upload, ImageIcon } from 'lucide-react';
import { cn } from '../utils/cn';

interface ImageUploaderProps {
  maxImages: number;
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  className?: string;
}

export function ImageUploader({ maxImages, images, onImagesChange, className }: ImageUploaderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('Archivos aceptados:', acceptedFiles);
    const newImages: UploadedImage[] = acceptedFiles.slice(0, maxImages - images.length).map((file, index) => {
      const preview = URL.createObjectURL(file);
      console.log('Vista previa creada:', preview);
      return {
        id: `${Date.now()}-${index}`,
        file,
        preview,
        position: images.length + index + 1,
      };
    });

    console.log('Nuevas imágenes:', newImages);
    onImagesChange([...images, ...newImages]);
  }, [images, maxImages, onImagesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: maxImages - images.length,
    disabled: images.length >= maxImages
  });

  const removeImage = (id: string) => {
    const filteredImages = images.filter(img => img.id !== id);
    // Reordenar posiciones
    const reorderedImages = filteredImages.map((img, index) => ({
      ...img,
      position: index + 1
    }));
    onImagesChange(reorderedImages);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = images.findIndex(img => img.id === active.id);
      const newIndex = images.findIndex(img => img.id === over.id);

      const reorderedImages = arrayMove(images, oldIndex, newIndex).map((img, index) => ({
        ...img,
        position: index + 1
      }));

      onImagesChange(reorderedImages);
    }
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Dropzone */}
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-primary-400",
            images.length >= maxImages && "opacity-50 cursor-not-allowed"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {isDragActive ? 'Suelta las imágenes aquí' : 'Arrastra y suelta tus fotos'}
          </p>
          <p className="text-sm text-gray-500">
            O haz clic para seleccionar • {images.length}/{maxImages} imágenes
          </p>
          <p className="text-xs text-gray-400 mt-2">
            PNG, JPG, WEBP hasta 10MB cada una
          </p>
        </div>
      )}

      {/* Vista previa de imágenes con drag & drop */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Tus fotos ({images.length}/{maxImages})</h3>
            <p className="text-sm text-gray-500">Arrastra para reordenar</p>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => {
                  console.log('Renderizando imagen:', image);
                  return (
                    <div key={image.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary-400 transition-colors">
                        <img
                          src={image.preview}
                          alt={`Foto ${image.position}`}
                          className="w-full h-full object-cover"
                          onLoad={() => console.log('Imagen cargada:', image.preview)}
                          onError={(e) => console.error('Error cargando imagen:', e, image.preview)}
                        />
                        
                        {/* Botón de eliminar simplificado */}
                        <button
                          onClick={() => removeImage(image.id)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                          title="Eliminar foto"
                        >
                          ×
                        </button>
                      </div>
                      <div className="text-center mt-2">
                        <span className="text-xs text-gray-500">Foto {image.position}</span>
                      </div>
                    </div>
                  );
                })}
                
                {/* Espacios vacíos para mostrar cuántas fotos faltan */}
                {images.length < maxImages && Array.from({ length: maxImages - images.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center"
                  >
                    <div className="text-center">
                      <ImageIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">Foto {images.length + index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Información sobre las posiciones */}
      {images.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">📱 Vista previa de tu tarjeta:</h4>
          <p className="text-sm text-blue-700">
            Las fotos se colocarán en el orden mostrado. La primera foto será la portada de tu tarjeta explosiva.
          </p>
        </div>
      )}
    </div>
  );
}
