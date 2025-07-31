import { useState, useEffect } from 'react';
import { Upload, RotateCcw, Target, Trash2, Camera, MessageSquare, Edit3, MousePointerClick, CheckCircle, ArrowLeft, Home } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import heic2any from 'heic2any';
import { useSound } from '../hooks/useSound';
import type { Product, ProductConfiguration } from '../types';

interface UnifiedCustomizerProps {
  product: Product;
  onComplete: (config: ProductConfiguration, images: File[], messages: string[]) => void;
  onBack: () => void;
}

interface CubeSpace {
  id: string;
  type: 'photo' | 'message';
  content?: File | string;
  preview?: string;
  imagePosition?: { x: number; y: number }; // Para ajustar la posición de la imagen
}

export function UnifiedCustomizer({ product, onComplete, onBack }: UnifiedCustomizerProps) {
  // Hook de sonidos
  const { playClick, playTap, playSuccess, playError, playSelect } = useSound();
  
  // Estado para manejar múltiples cubos
  const [currentCubeIndex, setCurrentCubeIndex] = useState(0);
  
  // Estado para el mensaje de la caja (solo para productos dulce, dulce mini, salada)
  const [boxMessage, setBoxMessage] = useState('');
  
  // Verificar si el producto requiere mensaje de caja
  const requiresBoxMessage = ['d01-dulce', 'd01-dulce-mini', 's01-salada'].includes(product.id);
  
  // Inicializar espacios del cubo con configuración por defecto
  const [cubeSpaces, setCubeSpaces] = useState<CubeSpace[]>(() => {
    const spaces = Array.from({ length: product.imageCount }, (_, i) => ({
      id: `space-${i}`,
      // Todos los espacios empiezan como fotos por defecto
      type: 'photo' as 'photo' | 'message'
    }));
    console.log('Initial cubeSpaces:', spaces);
    return spaces;
  });

  const [activeSpace, setActiveSpace] = useState<string | null>(null);
  const [isConvertingHEIC, setIsConvertingHEIC] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [selectedFaceIndex, setSelectedFaceIndex] = useState<number | null>(null);
  const [showMessageEditor, setShowMessageEditor] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipFaceIndex, setTooltipFaceIndex] = useState<number | null>(null);
  const [showImageAdjuster, setShowImageAdjuster] = useState(false);
  const [adjustingImageIndex, setAdjustingImageIndex] = useState<number | null>(null);
  const [showPositionAdjuster, setShowPositionAdjuster] = useState(false);


  const onDrop = async (acceptedFiles: File[], spaceId?: string) => {
    if (acceptedFiles.length === 0) return;

    let file = acceptedFiles[0];
    
    // Detectar y convertir archivos HEIC/HEIF automáticamente
    const fileName = file.name.toLowerCase();
    const isHEIC = fileName.endsWith('.heic') || fileName.endsWith('.heif');
    
    if (isHEIC) {
      try {
        // Mostrar indicador de conversión
        setIsConvertingHEIC(true);
        console.log('Convirtiendo archivo HEIC a JPEG...');
        
        // Convertir HEIC a JPEG
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8
        }) as Blob;
        
        // Crear nuevo archivo con extensión .jpg
        const originalName = file.name.replace(/\.(heic|heif)$/i, '');
        file = new File([convertedBlob], `${originalName}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        
        console.log('Archivo HEIC convertido exitosamente a JPEG');
      } catch (error) {
        console.error('Error convirtiendo archivo HEIC:', error);
        alert('Error al procesar la imagen HEIC. Por favor, intenta con otra foto.');
        return;
      } finally {
        setIsConvertingHEIC(false);
      }
    }

    const preview = URL.createObjectURL(file);

    if (spaceId) {
      // Asignar a espacio específico
      setCubeSpaces(prev => prev.map(space => {
        if (space.id === spaceId) {
          // Limpiar URL anterior si existe
          if (space.preview) {
            URL.revokeObjectURL(space.preview);
          }
          return { 
            ...space, 
            type: 'photo', 
            content: file, 
            preview,
            imagePosition: { x: 50, y: 50 } // Posición inicial centrada
          };
        }
        return space;
      }));
    } else {
      // Asignar al primer espacio vacío de tipo foto
      setCubeSpaces(prev => {
        const firstEmptyPhoto = prev.find(space => space.type === 'photo' && !space.content);
        if (firstEmptyPhoto) {
          return prev.map(space => {
            if (space.id === firstEmptyPhoto.id) {
              // Limpiar URL anterior si existe
              if (space.preview) {
                URL.revokeObjectURL(space.preview);
              }
              return { 
                ...space, 
                content: file, 
                preview,
                imagePosition: { x: 50, y: 50 } // Posición inicial centrada
              };
            }
            return space;
          });
        }
        return prev;
      });
    }
  };

  const { isDragActive } = useDropzone({
    onDrop: (files) => onDrop(files),
    accept: { 
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/heic': ['.heic'],
      'image/heif': ['.heif']
    },
    multiple: true,
    noClick: true
  });

  const handleFaceClick = (faceIndex: number) => {
    console.log('handleFaceClick called with faceIndex:', faceIndex);
    // Calcular el índice real considerando el cubo actual
    const realIndex = currentCubeIndex * spacesPerCube + faceIndex;
    const targetSpace = cubeSpaces[realIndex];
    console.log('targetSpace:', targetSpace, 'realIndex:', realIndex);
    
    if (targetSpace) {
      setActiveSpace(targetSpace.id);
      setSelectedFaceIndex(realIndex); // Usar el índice real
      
      // Mostrar tooltip temporal para móviles
      setShowTooltip(true);
      setTooltipFaceIndex(faceIndex); // Mantener el índice local para el tooltip
      
      // Ocultar tooltip después de 2 segundos
      setTimeout(() => {
        setShowTooltip(false);
        setTooltipFaceIndex(null);
      }, 2000);
      
      // Si ya tiene contenido, permitir editar directamente
      if (targetSpace.content) {
        console.log('Target space has content, type:', targetSpace.type);
        if (targetSpace.type === 'message') {
          setCurrentMessage(targetSpace.content as string);
          setShowMessageEditor(true);
        } else {
          // Para fotos, mostrar opciones: cambiar foto o ajustar posición
          setAdjustingImageIndex(realIndex); // Usar el índice real
          setShowImageAdjuster(true);
        }
      } else {
        // Si está vacío, mostrar modal de selección
        console.log('Target space is empty, showing selection modal');
        setShowSelectionModal(true);
      }
    } else {
      console.log('No target space found for faceIndex:', faceIndex, 'realIndex:', realIndex);
    }
  };

  const handlePhotoSelection = () => {
    setShowSelectionModal(false);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.heic,.heif';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && selectedFaceIndex !== null) {
        onDrop([file], `space-${selectedFaceIndex}`);
      }
    };
    input.click();
  };

  const handleMessageSelection = () => {
    setShowSelectionModal(false);
    setCurrentMessage('');
    setShowMessageEditor(true);
  };

  const handleMessageSave = () => {
    if (selectedFaceIndex !== null && currentMessage.trim()) {
      setCubeSpaces(prev => prev.map((space, index) => {
        if (index === selectedFaceIndex) {
          return { ...space, type: 'message', content: currentMessage.trim() };
        }
        return space;
      }));
    }
    setShowMessageEditor(false);
    setCurrentMessage('');
    setSelectedFaceIndex(null);
  };

  const handleMessageCancel = () => {
    setShowMessageEditor(false);
    setCurrentMessage('');
    setSelectedFaceIndex(null);
  };

  const handleChangePhoto = () => {
    setShowImageAdjuster(false);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif,.heic,.heif';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && adjustingImageIndex !== null) {
        onDrop([file], `space-${adjustingImageIndex}`);
      }
    };
    input.click();
    setAdjustingImageIndex(null);
  };

  const handleAdjustPosition = () => {
    setShowImageAdjuster(false);
    setShowPositionAdjuster(true);
  };

  const updateImagePosition = (faceIndex: number, x: number, y: number) => {
    setCubeSpaces(prev => prev.map((space, index) => {
      if (index === faceIndex && space.type === 'photo') {
        return { ...space, imagePosition: { x, y } };
      }
      return space;
    }));
  };

  const handleDeleteContent = () => {
    if (adjustingImageIndex !== null) {
      setCubeSpaces(prev => prev.map((space, index) => {
        if (index === adjustingImageIndex) {
          // Limpiar URL si existe
          if (space.preview) {
            URL.revokeObjectURL(space.preview);
          }
          return { 
            ...space, 
            content: undefined, 
            preview: undefined, 
            imagePosition: undefined 
          };
        }
        return space;
      }));
    }
    setShowImageAdjuster(false);
    setAdjustingImageIndex(null);
  };

  const handleDeleteMessage = () => {
    if (selectedFaceIndex !== null) {
      setCubeSpaces(prev => prev.map((space, index) => {
        if (index === selectedFaceIndex) {
          return { 
            ...space, 
            content: undefined 
          };
        }
        return space;
      }));
    }
    setShowMessageEditor(false);
    setCurrentMessage('');
    setSelectedFaceIndex(null);
  };

  const photoSpaces = cubeSpaces.filter(space => space.type === 'photo');
  const messageSpaces = cubeSpaces.filter(space => space.type === 'message');
  const completedPhotos = photoSpaces.filter(space => space.content).length;
  const completedMessages = messageSpaces.filter(space => space.content).length;
  const isComplete = completedPhotos === photoSpaces.length && completedMessages === messageSpaces.length;

  // Validación completa incluyendo mensaje de caja si es requerido
  const isFullyComplete = isComplete && (!requiresBoxMessage || (requiresBoxMessage && boxMessage.trim() !== ''));

  // Función para completar la personalización
  const handleComplete = () => {
    if (!isFullyComplete) {
      playError();
      return;
    }

    // Crear configuración
    const config: ProductConfiguration = {
      productId: product.id,
      cubes: [], // Se puede calcular después si es necesario
      totalPhotos: completedPhotos,
      totalMessages: completedMessages,
      isComplete: true,
      boxMessage: requiresBoxMessage ? boxMessage.trim() : undefined
    };

    // Recopilar fotos
    const photos = photoSpaces
      .filter(space => space.content instanceof File)
      .map(space => space.content as File);

    // Recopilar mensajes
    const messages = messageSpaces
      .filter(space => space.content && typeof space.content === 'string')
      .map(space => space.content as string);

    // Agregar mensaje de caja si existe
    if (requiresBoxMessage && boxMessage.trim()) {
      messages.push(boxMessage.trim());
    }

    playSuccess();
    onComplete(config, photos, messages);
  };

  // Calcular espacios por cubo (4 espacios por cubo)
  const spacesPerCube = 4;
  // const totalCubes = Math.ceil(product.imageCount / spacesPerCube); // No usado actualmente
  const currentCubeSpaces = cubeSpaces.slice(
    currentCubeIndex * spacesPerCube, 
    (currentCubeIndex + 1) * spacesPerCube
  );

  // Calcular progreso del cubo actual
  const currentCubeCompleted = currentCubeSpaces.filter(space => space.content).length;
  // const currentCubeTotal = currentCubeSpaces.length; // No usado actualmente

  // Debug: Log modal state
  console.log('showSelectionModal:', showSelectionModal);
  console.log('selectedFaceIndex:', selectedFaceIndex);
  console.log('currentCubeIndex:', currentCubeIndex);
  console.log('currentCubeSpaces:', currentCubeSpaces);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-6">
      {/* Botón de volver al inicio */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            playClick();
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-[1.02] shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </button>
        
        {/* Botón de inicio alternativo con icono de casa */}
        <button
          onClick={() => {
            playClick();
            onBack();
          }}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-all duration-200"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Inicio</span>
        </button>
      </div>

      {/* Header con producto y cubo actual */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
        <p className="text-sm text-gray-600 mt-1">
          {product.cubes} cubo{product.cubes > 1 ? 's' : ''} • {product.imageCount} espacios totales
        </p>
        {product.cubes > 1 && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-sm font-medium text-gray-700">Personalizando:</span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
              Cubo {currentCubeIndex + 1} de {Math.ceil(product.imageCount / spacesPerCube)}
            </span>
          </div>
        )}
      </div>



      {/* Zona de drop global */}
      {isDragActive && (
        <div className="fixed inset-0 bg-primary-500 bg-opacity-20 border-4 border-dashed border-primary-500 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Upload className="h-12 w-12 text-primary-500 mx-auto mb-2" />
            <p className="text-lg font-semibold text-primary-700">Suelta las fotos aquí</p>
          </div>
        </div>
      )}

      {/* Indicador de conversión HEIC - Mobile responsive */}
      {isConvertingHEIC && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl border border-white/20 p-4 sm:p-6 rounded-2xl shadow-2xl text-center max-w-sm w-full"
               style={{
                 background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
                 backdropFilter: 'blur(20px)',
                 WebkitBackdropFilter: 'blur(20px)',
               }}>
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary-600 mx-auto mb-3 sm:mb-4"></div>
            <p className="text-base sm:text-lg font-semibold text-gray-700">Convirtiendo imagen HEIC...</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">Esto puede tomar unos segundos</p>
          </div>
        </div>
      )}

      {/* Modal de selección: Foto o Mensaje - Estilo Liquid Glass */}
      {showSelectionModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative">
            {/* Efecto liquid glass con múltiples capas */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-100/20 via-transparent to-secondary-100/20 rounded-3xl"></div>
            
            {/* Contenido del modal */}
            <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-xl max-w-sm w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                ¿Qué agregar en esta cara?
              </h3>
              
              <div className="space-y-3 mb-6">
                {/* Opción: Subir foto */}
                <button
                  onClick={() => {
                    playSelect();
                    handlePhotoSelection();
                  }}
                  className="group w-full p-4 rounded-2xl bg-gradient-to-br from-primary-50/80 to-primary-100/80 backdrop-blur-sm border border-primary-200/50 hover:from-primary-100/80 hover:to-primary-200/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-primary-300/50 transition-shadow">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-bold text-gray-900 mb-1">Subir una foto</div>
                      <div className="text-sm text-primary-700 font-medium">JPG, PNG, WebP o HEIC</div>
                    </div>
                  </div>
                </button>
                
                {/* Opción: Escribir mensaje */}
                <button
                  onClick={() => {
                    playSelect();
                    handleMessageSelection();
                  }}
                  className="group w-full p-4 rounded-2xl bg-gradient-to-br from-secondary-50/80 to-secondary-100/80 backdrop-blur-sm border border-secondary-200/50 hover:from-secondary-100/80 hover:to-secondary-200/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-secondary-300/50 transition-shadow">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-bold text-gray-900 mb-1">Escribir un mensaje</div>
                      <div className="text-sm text-secondary-700 font-medium">Máximo 30 caracteres</div>
                    </div>
                  </div>
                </button>
              </div>
              
              {/* Botón cancelar */}
              <button
                onClick={() => setShowSelectionModal(false)}
                className="w-full py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors rounded-2xl hover:bg-white/30"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de editor de mensaje - Estilo Liquid Glass */}
      {showMessageEditor && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative">
            {/* Efecto liquid glass con múltiples capas */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-secondary-100/20 via-transparent to-primary-100/20 rounded-3xl"></div>
            
            {/* Contenido del modal */}
            <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-xl max-w-sm w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center bg-gradient-to-r from-secondary-600 to-primary-600 bg-clip-text text-transparent">
                Escribe tu mensaje
              </h3>
              
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={currentMessage}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 30) {
                        setCurrentMessage(value);
                      }
                    }}
                    placeholder="Escribe tu mensaje aquí..."
                    className="w-full p-4 bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl resize-none focus:outline-none focus:border-secondary-400 focus:ring-2 focus:ring-secondary-200/50 placeholder-gray-500 text-gray-900 shadow-lg"
                    rows={3}
                    maxLength={30}
                  />
                  <div className="absolute bottom-2 right-3 text-xs font-medium text-gray-500 bg-white/80 rounded-full px-2 py-1">
                    {currentMessage.length}/30
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      playClick();
                      handleMessageCancel();
                    }}
                    className="flex-1 py-3 px-4 bg-white/50 backdrop-blur-sm border border-white/50 rounded-2xl text-gray-700 font-medium hover:bg-white/70 transition-all duration-300 shadow-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      if (currentMessage.trim()) {
                        playSuccess();
                        handleMessageSave();
                      }
                    }}
                    disabled={!currentMessage.trim()}
                    className={`flex-1 py-3 px-4 rounded-2xl font-bold transition-all duration-300 shadow-lg ${
                      currentMessage.trim()
                        ? 'bg-gradient-to-r from-secondary-500 to-primary-500 text-white hover:from-secondary-600 hover:to-primary-600 hover:shadow-xl hover:scale-[1.02]'
                        : 'bg-gray-200/70 text-gray-500 cursor-not-allowed backdrop-blur-sm'
                    }`}
                  >
                    Guardar
                  </button>
                </div>
                
                {/* Opción de eliminar mensaje (solo si editando) */}
                {selectedFaceIndex !== null && cubeSpaces[selectedFaceIndex]?.content && (
                  <button
                    onClick={handleDeleteMessage}
                    className="w-full py-2 text-sm font-medium text-red-600 hover:text-red-800 transition-colors rounded-2xl hover:bg-red-50/50"
                  >
                    Eliminar mensaje
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de opciones de imagen - Estilo Liquid Glass */}
      {showImageAdjuster && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative">
            {/* Efecto liquid glass con múltiples capas */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-100/20 via-transparent to-secondary-100/20 rounded-3xl"></div>
            
            {/* Contenido del modal */}
            <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-xl max-w-xs w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                Opciones de imagen
              </h3>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                {/* Cambiar foto */}
                <button
                  onClick={() => {
                    playClick();
                    handleChangePhoto();
                  }}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-50/80 to-primary-100/80 backdrop-blur-sm border border-primary-200/50 p-4 hover:from-primary-100/80 hover:to-primary-200/80 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-primary-300/50 transition-shadow">
                      <RotateCcw className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xs font-semibold text-primary-700">Cambiar</div>
                    <div className="text-xs text-primary-600 text-center leading-tight">Nueva foto</div>
                  </div>
                </button>
                
                {/* Ajustar posición */}
                <button
                  onClick={() => {
                    playClick();
                    handleAdjustPosition();
                  }}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-accent-50/80 to-accent-100/80 backdrop-blur-sm border border-accent-200/50 p-4 hover:from-accent-100/80 hover:to-accent-200/80 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-accent-300/50 transition-shadow">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xs font-semibold text-accent-700">Ajustar</div>
                    <div className="text-xs text-accent-600 text-center leading-tight">Posición</div>
                  </div>
                </button>
                
                {/* Eliminar */}
                <button
                  onClick={() => {
                    playError();
                    handleDeleteContent();
                  }}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-50/80 to-red-100/80 backdrop-blur-sm border border-red-200/50 p-4 hover:from-red-100/80 hover:to-red-200/80 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-red-300/50 transition-shadow">
                      <Trash2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xs font-semibold text-red-700">Eliminar</div>
                    <div className="text-xs text-red-600 text-center leading-tight">Borrar foto</div>
                  </div>
                </button>
              </div>
              
              {/* Botón cancelar con estilo minimalista */}
              <button
                onClick={() => {
                  setShowImageAdjuster(false);
                  setAdjustingImageIndex(null);
                }}
                className="w-full py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors rounded-2xl hover:bg-white/30"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de ajuste de posición de imagen - Estilo Liquid Glass */}
      {showPositionAdjuster && adjustingImageIndex !== null && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="relative">
            {/* Efecto liquid glass con múltiples capas */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-white/10 backdrop-blur-xl rounded-3xl border border-white/30 shadow-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-accent-100/20 via-transparent to-primary-100/20 rounded-3xl"></div>
            
            {/* Contenido del modal */}
            <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-xl max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center bg-gradient-to-r from-accent-600 to-primary-600 bg-clip-text text-transparent">
                Ajustar posición de la imagen
              </h3>
              
              {/* Preview de la imagen con controles */}
              <div className="mb-6">
                <div className="w-40 h-40 mx-auto bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 overflow-hidden relative shadow-xl">
                  <img 
                    src={cubeSpaces[adjustingImageIndex]?.preview || (cubeSpaces[adjustingImageIndex]?.content instanceof File ? URL.createObjectURL(cubeSpaces[adjustingImageIndex].content as File) : '')} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    style={{
                      objectPosition: `${cubeSpaces[adjustingImageIndex]?.imagePosition?.x || 50}% ${cubeSpaces[adjustingImageIndex]?.imagePosition?.y || 50}%`
                    }}
                  />
                </div>
                <p className="text-sm text-gray-700 text-center mt-3 font-medium">
                  Usa los controles para mover la imagen
                </p>
              </div>

              {/* Controles de posición */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Posición horizontal
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={cubeSpaces[adjustingImageIndex]?.imagePosition?.x || 50}
                      onChange={(e) => updateImagePosition(adjustingImageIndex, parseInt(e.target.value), cubeSpaces[adjustingImageIndex]?.imagePosition?.y || 50)}
                      className="w-full h-2 bg-gradient-to-r from-accent-200 to-accent-300 rounded-full appearance-none cursor-pointer backdrop-blur-sm"
                      style={{
                        background: `linear-gradient(to right, rgb(251 191 36 / 0.5) 0%, rgb(251 191 36) ${cubeSpaces[adjustingImageIndex]?.imagePosition?.x || 50}%, rgb(251 191 36 / 0.3) ${cubeSpaces[adjustingImageIndex]?.imagePosition?.x || 50}%, rgb(251 191 36 / 0.5) 100%)`
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Posición vertical
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={cubeSpaces[adjustingImageIndex]?.imagePosition?.y || 50}
                      onChange={(e) => updateImagePosition(adjustingImageIndex, cubeSpaces[adjustingImageIndex]?.imagePosition?.x || 50, parseInt(e.target.value))}
                      className="w-full h-2 bg-gradient-to-r from-accent-200 to-accent-300 rounded-full appearance-none cursor-pointer backdrop-blur-sm"
                      style={{
                        background: `linear-gradient(to right, rgb(251 191 36 / 0.5) 0%, rgb(251 191 36) ${cubeSpaces[adjustingImageIndex]?.imagePosition?.y || 50}%, rgb(251 191 36 / 0.3) ${cubeSpaces[adjustingImageIndex]?.imagePosition?.y || 50}%, rgb(251 191 36 / 0.5) 100%)`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPositionAdjuster(false);
                    setAdjustingImageIndex(null);
                  }}
                  className="flex-1 py-3 px-4 bg-white/50 backdrop-blur-sm border border-white/50 rounded-2xl text-gray-700 font-medium hover:bg-white/70 transition-all duration-300 shadow-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowPositionAdjuster(false);
                    setAdjustingImageIndex(null);
                  }}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-accent-500 to-primary-500 text-white rounded-2xl font-bold hover:from-accent-600 hover:to-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layout simplificado - solo cubo 3D interactivo */}
      <div className="flex justify-center">
        <div className="max-w-md w-full">
          <Cube3DPreview 
            cubeSpaces={currentCubeSpaces} 
            product={product}
            currentCubeIndex={currentCubeIndex}
            totalCubes={Math.ceil(product.imageCount / spacesPerCube)}
            onFaceClick={handleFaceClick}
            onCubeChange={setCurrentCubeIndex}
            activeSpace={activeSpace}
            showTooltip={showTooltip}
            tooltipFaceIndex={tooltipFaceIndex}
            allCubeSpaces={cubeSpaces}
            playTap={playTap}
            playClick={playClick}
          />
        </div>
      </div>

      {/* Estadísticas del cubo actual - movidas debajo del cubo */}
      <div className="flex justify-center gap-4 mt-6">
        <div className="bg-primary-50 rounded-lg p-3 text-center min-w-[80px]">
          <div className="text-2xl font-bold text-primary-600">
            {currentCubeSpaces.filter(s => s.type === 'photo' && s.content).length}
          </div>
          <div className="text-xs text-primary-700">Fotos</div>
        </div>
        <div className="bg-secondary-50 rounded-lg p-3 text-center min-w-[80px]">
          <div className="text-2xl font-bold text-secondary-600">
            {currentCubeSpaces.filter(s => s.type === 'message' && s.content).length}
          </div>
          <div className="text-xs text-secondary-700">Mensajes</div>
        </div>
        <div className="bg-accent-50 rounded-lg p-3 text-center min-w-[80px]">
          <div className="text-2xl font-bold text-accent-600">{currentCubeCompleted}</div>
          <div className="text-xs text-accent-700">Completados</div>
        </div>
      </div>

      {/* Mensaje de la caja - solo para productos que lo requieren */}
      {requiresBoxMessage && (
        <div className="bg-white rounded-lg shadow-sm border p-4 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Mensaje para el exterior de la caja</h3>
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              Obligatorio
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Este mensaje se imprimirá en el exterior de tu caja FestiBox y será lo primero que vea la persona especial.
          </p>
          <textarea
            value={boxMessage}
            onChange={(e) => setBoxMessage(e.target.value)}
            placeholder="Ej: Para la persona más especial del mundo ❤️"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            rows={3}
            maxLength={100}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              Máximo 100 caracteres
            </span>
            <span className="text-xs text-gray-500">
              {boxMessage.length}/100
            </span>
          </div>
        </div>
      )}

      {/* Botón de finalización simplificado */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mt-6">
        <div className="space-y-4">
          {/* Botón de finalización */}
          <button
            onClick={handleComplete}
            disabled={!isFullyComplete}
            className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-300 ${
              isFullyComplete
                ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700 shadow-lg hover:shadow-xl hover:scale-[1.02]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isFullyComplete 
              ? '¡Listo para armar tu FestiBox! 🎉' 
              : requiresBoxMessage && !boxMessage.trim()
                ? 'Completa el mensaje de la caja'
                : `Completa ${photoSpaces.length - completedPhotos} foto${photoSpaces.length - completedPhotos !== 1 ? 's' : ''} y ${messageSpaces.length - completedMessages} mensaje${messageSpaces.length - completedMessages !== 1 ? 's' : ''} más`
            }
          </button>

          {/* Indicador de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.round((completedPhotos + completedMessages + (requiresBoxMessage && boxMessage.trim() ? 1 : 0)) / (photoSpaces.length + messageSpaces.length + (requiresBoxMessage ? 1 : 0)) * 100)}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de vista previa 3D realista del cubo - ahora interactivo
function Cube3DPreview({ 
  cubeSpaces, 
  product, 
  currentCubeIndex,
  totalCubes,
  onFaceClick,
  onCubeChange,
  activeSpace,
  showTooltip,
  tooltipFaceIndex,
  // spacesPerCube, // No usado en este componente
  allCubeSpaces,
  playTap,
  playClick
}: { 
  cubeSpaces: CubeSpace[], 
  product: Product,
  currentCubeIndex: number,
  totalCubes: number,
  onFaceClick: (faceIndex: number) => void,
  onCubeChange: (cubeIndex: number) => void,
  activeSpace: string | null,
  showTooltip: boolean,
  tooltipFaceIndex: number | null,
  // spacesPerCube: number, // No usado en este componente
  allCubeSpaces: CubeSpace[],
  playTap: () => void,
  playClick: () => void
}) {
  const [rotation, setRotation] = useState(0);

  // Resetear rotación a cara 1 cuando cambie el cubo
  useEffect(() => {
    setRotation(0);
  }, [currentCubeIndex]);

  // Solo mostramos las primeras 4 caras (los 4 lados del cubo)
  const cubeFaces = cubeSpaces.slice(0, 4);

  const handleFaceClick = (faceIndex: number) => {
    playTap(); // Sonido cuando se hace click en una cara
    onFaceClick(faceIndex);
  };

  return (
    <div className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 rounded-lg px-6 py-12 text-center border border-gray-100 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-2">
        Vista previa de tu {product.name}
      </h3>
      <p className="text-sm text-gray-600 mb-6">Así se verán las 4 caras de tu cubo cuando se abra</p>
      
      {/* Navegación entre cubos - movida aquí, arriba del selector de caras */}
      {product.cubes > 1 && (
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            {Array.from({ length: totalCubes }, (_, i) => {
              // Calcular si este cubo está completo usando el spacesPerCube local
              const cubeStartIndex = i * 4; // 4 espacios por cubo
              const cubeEndIndex = cubeStartIndex + 4;
              const thisCubeSpaces = allCubeSpaces.slice(cubeStartIndex, cubeEndIndex);
              const isCubeComplete = thisCubeSpaces.every(space => space.content);
              
              return (
                <button
                  key={i}
                  onClick={() => {
                    playClick();
                    onCubeChange(i);
                  }}
                  className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentCubeIndex === i
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Cubo {i + 1}
                  {/* Badge de check verde cuando el cubo está completo */}
                  {isCubeComplete && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center z-20">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="flex justify-center mb-18">
        <div className="relative">
          {/* Controles de rotación con colores FestiBox */}
          <div className="flex gap-2 mb-12 justify-center">
            <button
              onClick={() => {
                playClick();
                setRotation(0);
              }}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                rotation === 0 
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'
              }`}
            >
              Cara 1
            </button>
            <button
              onClick={() => {
                playClick();
                setRotation(-90);
              }}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                rotation === -90 
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'
              }`}
            >
              Cara 2
            </button>
            <button
              onClick={() => {
                playClick();
                setRotation(-180);
              }}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                rotation === -180 
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'
              }`}
            >
              Cara 3
            </button>
            <button
              onClick={() => {
                playClick();
                setRotation(-270);
              }}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                rotation === -270 
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-300'
              }`}
            >
              Cara 4
            </button>
          </div>

          {/* Cubo 3D completo con CSS transforms - FUNCIONAL */}
          <div className="flex justify-center">
            <div style={{ perspective: '1200px' }}>
              <div 
                className="relative w-60 h-60 transition-transform duration-700 ease-in-out"
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${rotation}deg) rotateX(-10deg)`
                }}
              >
                {/* Cara frontal */}
                <div 
                  className="absolute w-60 h-60 bg-white border border-gray-200 rounded-lg shadow-lg"
                  style={{ 
                    transform: 'translateZ(120px)',
                    pointerEvents: 'none' // Desactivar eventos en el contenedor
                  }}
                >
                  <div 
                    className="absolute inset-0 rounded-lg opacity-30"
                    style={{
                      backgroundImage: 'url(/cube.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      pointerEvents: 'none'
                    }}
                  ></div>
                  <div style={{ pointerEvents: 'auto' }}> {/* Reactivar eventos solo en la cara */}
                    <InteractiveCubeFace 
                      space={cubeFaces[0]} 
                      faceNumber={1} 
                      isActive={activeSpace === 'space-0'}
                      onClick={() => handleFaceClick(0)}
                      showTooltip={showTooltip && tooltipFaceIndex === 0}
                    />
                  </div>
                </div>
                
                {/* Cara derecha */}
                <div 
                  className="absolute w-60 h-60 bg-white border border-gray-200 rounded-lg shadow-lg"
                  style={{ 
                    transform: 'rotateY(90deg) translateZ(120px)',
                    pointerEvents: 'none'
                  }}
                >
                  <div 
                    className="absolute inset-0 rounded-lg opacity-30"
                    style={{
                      backgroundImage: 'url(/cube.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      pointerEvents: 'none'
                    }}
                  ></div>
                  <div style={{ pointerEvents: 'auto' }}>
                    <InteractiveCubeFace 
                      space={cubeFaces[1]} 
                      faceNumber={2} 
                      isActive={activeSpace === 'space-1'}
                      onClick={() => handleFaceClick(1)}
                      showTooltip={showTooltip && tooltipFaceIndex === 1}
                    />
                  </div>
                </div>
                
                {/* Cara trasera */}
                <div 
                  className="absolute w-60 h-60 bg-white border border-gray-200 rounded-lg shadow-lg"
                  style={{ 
                    transform: 'rotateY(180deg) translateZ(120px)',
                    pointerEvents: 'none'
                  }}
                >
                  <div 
                    className="absolute inset-0 rounded-lg opacity-30"
                    style={{
                      backgroundImage: 'url(/cube.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      pointerEvents: 'none'
                    }}
                  ></div>
                  <div style={{ pointerEvents: 'auto' }}>
                    <InteractiveCubeFace 
                      space={cubeFaces[2]} 
                      faceNumber={3} 
                      isActive={activeSpace === 'space-2'}
                      onClick={() => handleFaceClick(2)}
                      showTooltip={showTooltip && tooltipFaceIndex === 2}
                    />
                  </div>
                </div>
                
                {/* Cara izquierda */}
                <div 
                  className="absolute w-60 h-60 bg-white border border-gray-200 rounded-lg shadow-lg"
                  style={{ 
                    transform: 'rotateY(-90deg) translateZ(120px)',
                    pointerEvents: 'none'
                  }}
                >
                  <div 
                    className="absolute inset-0 rounded-lg opacity-30"
                    style={{
                      backgroundImage: 'url(/cube.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      pointerEvents: 'none'
                    }}
                  ></div>
                  <div style={{ pointerEvents: 'auto' }}>
                    <InteractiveCubeFace 
                      space={cubeFaces[3]} 
                      faceNumber={4} 
                      isActive={activeSpace === 'space-3'}
                      onClick={() => handleFaceClick(3)}
                      showTooltip={showTooltip && tooltipFaceIndex === 3}
                    />
                  </div>
                </div>

                {/* Tapa superior (vacía - mecanismo) */}
                <div 
                  className="absolute w-60 h-60 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 rounded-lg shadow-sm"
                  style={{ 
                    transform: 'rotateX(90deg) translateZ(120px)',
                    pointerEvents: 'none'
                  }}
                >
                  <div 
                    className="absolute inset-0 rounded-lg opacity-30"
                    style={{
                      backgroundImage: 'url(/cube.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      pointerEvents: 'none'
                    }}
                  ></div>
                </div>

                {/* Base inferior (vacía - mecanismo) */}
                <div 
                  className="absolute w-60 h-60 bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-400 rounded-lg shadow-sm"
                  style={{ 
                    transform: 'rotateX(-90deg) translateZ(120px)',
                    pointerEvents: 'none'
                  }}
                >
                  <div 
                    className="absolute inset-0 rounded-lg opacity-30"
                    style={{
                      backgroundImage: 'url(/cube.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      pointerEvents: 'none'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instrucciones después del cubo */}
      <div className="text-center mt-12">
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <MousePointerClick className="w-5 h-5 text-primary-600" />
            ¡Haz clic en cada cara del cubo!
          </h3>
          <p className="text-sm text-gray-600">
            Puedes subir fotos o escribir mensajes personalizados en cada cara lateral
          </p>
        </div>
      </div>

    </div>
  );
}

// Componente interactivo para cada cara del cubo
function InteractiveCubeFace({ 
  space, 
  faceNumber, 
  isActive, 
  onClick,
  showTooltip = false
}: { 
  space?: CubeSpace; 
  faceNumber: number; 
  isActive: boolean;
  onClick: () => void;
  showTooltip?: boolean;
}) {
  const handleClick = () => {
    console.log('InteractiveCubeFace handleClick called for face:', faceNumber);
    onClick();
  };

  if (!space) {
    return (
      <div 
        className="w-full h-full flex items-center justify-center bg-transparent rounded-lg cursor-pointer transition-all hover:opacity-90"
        onClick={handleClick}
      >
        <div className="w-56 h-56 bg-gradient-to-br from-white via-gray-50 to-gray-100 border-2 border-dashed border-gray-400 rounded p-2 pt-2 relative shadow-sm mt-1.5 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
              <Upload className="w-5 h-5 text-gray-500" />
            </div>
            <div className="text-sm font-semibold text-gray-800 mb-2">Cara {faceNumber}</div>
            <div className="text-sm text-gray-700 px-3 py-1.5 bg-white/80 rounded-full shadow-sm">
              Toca para agregar
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (space.type === 'photo' && space.content) {
    const position = space.imagePosition || { x: 50, y: 50 };
    
    return (
            <div 
        className="w-full h-full flex items-center justify-center bg-transparent rounded-lg cursor-pointer transition-all hover:opacity-90"
        onClick={handleClick}
      >
        {/* Contenedor que ocupa más espacio con borde blanco pequeño - movido hacia abajo */}
        <div className="w-56 h-56 bg-white rounded p-2 pt-2 relative shadow-sm mt-1.5">
          {/* Imagen que ocupa casi todo el espacio */}
          <div className="w-full h-full overflow-hidden rounded-sm">
            <img 
              src={space.preview || (space.content instanceof File ? URL.createObjectURL(space.content) : '')} 
              alt={`Cara ${faceNumber}`} 
              className="w-full h-full object-cover" 
              style={{
                objectPosition: `${position.x}% ${position.y}%`
              }}
            />
          </div>
          {/* Indicador de opciones disponibles */}
          <div className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5 shadow-sm z-10">
            <Edit3 className="w-4 h-4 text-gray-600" />
          </div>
        </div>
        {isActive && showTooltip && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-md flex items-center justify-center animate-pulse">
            <div className="bg-white/95 px-3 py-2 rounded-full text-xs font-medium shadow-lg border border-gray-200 flex items-center gap-1">
              <MousePointerClick className="w-3 h-3 text-primary-600" />
              <span>Toca para editar esta cara del cubo</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (space.type === 'message') {
    return (
      <div 
        className="w-full h-full flex items-center justify-center bg-transparent rounded-lg cursor-pointer transition-all hover:opacity-90"
        onClick={handleClick}
      >
        {space.content ? (
          <>
            {/* Contenedor con el mismo tamaño y estructura que las fotos */}
            <div className="w-56 h-56 bg-white rounded p-2 pt-2 relative shadow-sm mt-1.5">
              {/* Área del mensaje con gradiente */}
              <div className="w-full h-full bg-gradient-to-br from-primary-50 via-white to-secondary-50 rounded-sm flex items-center justify-center">
                <div className="text-center px-4">
                  <div className="text-lg font-semibold text-gray-800 leading-tight break-words">
                    {space.content as string}
                  </div>
                </div>
              </div>
              {/* Indicador de que se puede editar */}
              <div className="absolute top-3 right-3 bg-white/90 rounded-full p-1.5 shadow-sm z-10">
                <Edit3 className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            {isActive && showTooltip && (
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-md flex items-center justify-center animate-pulse">
                <div className="bg-white/95 px-3 py-2 rounded-full text-xs font-medium shadow-lg border border-gray-200 flex items-center gap-1">
                  <MousePointerClick className="w-3 h-3 text-secondary-600" />
                  <span>Toca para editar esta cara del cubo</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-56 h-56 bg-gradient-to-br from-white via-gray-50 to-gray-100 border-2 border-dashed border-gray-400 rounded p-2 pt-2 relative shadow-sm mt-1.5 flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-gray-500" />
              </div>
              <div className="text-sm font-semibold text-gray-800 mb-2">Cara {faceNumber}</div>
              <div className="text-sm text-gray-700 px-3 py-1.5 bg-white/80 rounded-full shadow-sm">
                Mensaje
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Cara vacía - mostrar opciones
  return (
    <div 
      className="w-full h-full flex items-center justify-center bg-transparent rounded-lg cursor-pointer transition-all hover:opacity-90"
      onClick={handleClick}
    >
      <div className="w-56 h-56 bg-gradient-to-br from-white via-gray-50 to-gray-100 border-2 border-dashed border-gray-400 rounded p-2 pt-2 relative shadow-sm mt-1.5 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
            <Upload className="w-5 h-5 text-gray-500" />
          </div>
          <div className="text-sm font-semibold text-gray-800 mb-2">Cara {faceNumber}</div>
          <div className="text-sm text-gray-700 px-3 py-1.5 bg-white/80 rounded-full shadow-sm">
            Toca para agregar
          </div>
        </div>
      </div>
    </div>
  );
}
