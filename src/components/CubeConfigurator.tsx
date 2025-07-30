import { useState } from 'react';
import { Box, Image, MessageSquare, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import type { Product, ProductConfiguration } from '../types';

interface CubeConfiguratorProps {
  product: Product;
  onConfigurationComplete: (config: ProductConfiguration) => void;
  onBack: () => void;
}

export function CubeConfigurator({ product, onConfigurationComplete, onBack }: CubeConfiguratorProps) {
  const [currentStep, setCurrentStep] = useState<'intro' | 'configure' | 'summary'>('intro');
  const [currentCube, setCurrentCube] = useState(1);
  const [configuration, setConfiguration] = useState<ProductConfiguration>({
    productId: product.id,
    cubes: Array.from({ length: product.cubes }, (_, i) => ({
      cubeNumber: i + 1,
      photos: 0,
      messages: 0,
      totalSpaces: product.spacesPerCube
    })),
    totalPhotos: 0,
    totalMessages: 0,
    isComplete: false
  });

  const updateCubeConfig = (cubeNumber: number, photos: number, messages: number) => {
    const newCubes = configuration.cubes.map(cube => 
      cube.cubeNumber === cubeNumber 
        ? { ...cube, photos, messages }
        : cube
    );
    
    const totalPhotos = newCubes.reduce((sum, cube) => sum + cube.photos, 0);
    const totalMessages = newCubes.reduce((sum, cube) => sum + cube.messages, 0);
    const isComplete = newCubes.every(cube => cube.photos + cube.messages === cube.totalSpaces);

    setConfiguration({
      ...configuration,
      cubes: newCubes,
      totalPhotos,
      totalMessages,
      isComplete
    });
  };

  const getCurrentCube = () => configuration.cubes.find(c => c.cubeNumber === currentCube)!;

  const handleNext = () => {
    if (currentStep === 'intro') {
      setCurrentStep('configure');
    } else if (currentStep === 'configure') {
      if (currentCube < product.cubes) {
        setCurrentCube(currentCube + 1);
      } else {
        setCurrentStep('summary');
      }
    } else if (currentStep === 'summary' && configuration.isComplete) {
      onConfigurationComplete(configuration);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 'configure' && currentCube > 1) {
      setCurrentCube(currentCube - 1);
    } else if (currentStep === 'configure' && currentCube === 1) {
      setCurrentStep('intro');
    } else if (currentStep === 'summary') {
      setCurrentCube(product.cubes);
      setCurrentStep('configure');
    }
  };

  const currentCubeConfig = getCurrentCube();
  const canProceed = currentStep === 'intro' || 
                    (currentStep === 'configure' && currentCubeConfig.photos + currentCubeConfig.messages === currentCubeConfig.totalSpaces) ||
                    (currentStep === 'summary' && configuration.isComplete);

  if (currentStep === 'intro') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Box className="h-10 w-10 text-primary-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            ¡Configuremos tu {product.name}!
          </h3>
          <p className="text-gray-600">
            Tu {product.name} tiene <strong>{product.cubes} cubo{product.cubes > 1 ? 's' : ''}</strong>, 
            cada uno con <strong>{product.spacesPerCube} espacios</strong> que puedes personalizar.
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">¿Qué puedes poner en cada espacio?</h4>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span><strong>Fotos:</strong> Tus recuerdos favoritos impresos</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span><strong>Mensajes:</strong> Texto personalizado que escribiremos</span>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500 mb-6">
          <p>Te vamos a guiar paso a paso para configurar cada cubo</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 inline mr-2" />
            Volver
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Empezar configuración
            <ArrowRight className="h-4 w-4 inline ml-2" />
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'configure') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Cubo {currentCube} de {product.cubes}
            </h3>
            <div className="text-sm text-gray-500">
              {currentCubeConfig.photos + currentCubeConfig.messages}/{currentCubeConfig.totalSpaces} espacios
            </div>
          </div>
          
          {/* Progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${((currentCubeConfig.photos + currentCubeConfig.messages) / currentCubeConfig.totalSpaces) * 100}%` 
              }}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ¿Cuántas fotos quieres poner en este cubo?
            </label>
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: currentCubeConfig.totalSpaces + 1 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => updateCubeConfig(
                    currentCube, 
                    i, 
                    currentCubeConfig.totalSpaces - i
                  )}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    currentCubeConfig.photos === i
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image className="h-4 w-4 mx-auto mb-1" />
                  <span className="text-xs font-medium">{i}</span>
                </button>
              ))}
            </div>
          </div>

          {currentCubeConfig.photos < currentCubeConfig.totalSpaces && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">
                  Los {currentCubeConfig.totalSpaces - currentCubeConfig.photos} espacios restantes 
                  se completarán con <strong>mensajes personalizados</strong> que tú nos proporciones.
                </span>
              </div>
            </div>
          )}

          {currentCubeConfig.photos + currentCubeConfig.messages === currentCubeConfig.totalSpaces && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  ¡Perfecto! Cubo {currentCube} configurado: {currentCubeConfig.photos} fotos + {currentCubeConfig.messages} mensajes
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={handlePrevious}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 inline mr-2" />
            {currentCube === 1 ? 'Volver' : 'Cubo anterior'}
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`flex-1 py-3 px-4 rounded-lg transition-colors ${
              canProceed
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {currentCube === product.cubes ? 'Ver resumen' : 'Siguiente cubo'}
            <ArrowRight className="h-4 w-4 inline ml-2" />
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'summary') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            ¡Configuración completa!
          </h3>
          <p className="text-gray-600">
            Tu {product.name} está lista para personalizar
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {configuration.cubes.map((cube) => (
            <div key={cube.cubeNumber} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-700">{cube.cubeNumber}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Cubo {cube.cubeNumber}</div>
                  <div className="text-sm text-gray-600">
                    {cube.photos} fotos + {cube.messages} mensajes
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{cube.totalSpaces} espacios</div>
                <div className="text-xs text-green-600">Completo</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-900">
              Total: {configuration.totalPhotos} fotos + {configuration.totalMessages} mensajes
            </div>
            <div className="text-sm text-blue-700 mt-1">
              {configuration.totalPhotos > 0 && 'Ahora podrás subir tus fotos '}
              {configuration.totalMessages > 0 && 'y escribir tus mensajes personalizados'}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePrevious}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 inline mr-2" />
            Modificar
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            ¡Empezar personalización!
            <ArrowRight className="h-4 w-4 inline ml-2" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
