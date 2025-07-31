import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, MapPin, Package, Clock, User, Phone, Mail, Home } from 'lucide-react';
import type { ShippingOption, ShippingAddress } from '../services/shippingService';
import { 
  calculateShippingOptions, 
  getAllCommunes,
  validateShippingAddress 
} from '../services/shippingService';

interface ShippingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShippingSelected: (option: ShippingOption, address?: ShippingAddress) => void;
  productCategory: string;
  productType: string;
  productName: string;
}

export function ShippingModal({
  isOpen,
  onClose,
  onShippingSelected,
  productCategory,
  productType,
  productName
}: ShippingModalProps) {
  const [selectedOption, setSelectedOption] = useState<ShippingOption | null>(null);
  const [commune, setCommune] = useState('');
  const [address, setAddress] = useState<ShippingAddress>({
    commune: '',
    address: '',
    reference: '',
    receiverName: '',
    receiverPhone: '',
    receiverEmail: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  
  const communes = getAllCommunes();

  useEffect(() => {
    if (commune) {
      const options = calculateShippingOptions(productCategory, productType, commune);
      setShippingOptions(options);
      
      // Auto-seleccionar retiro gratis por defecto
      if (options.length > 0 && !selectedOption) {
        setSelectedOption(options[0]);
      }
    } else {
      // Solo mostrar retiro si no hay comuna
      const options = calculateShippingOptions(productCategory, productType);
      setShippingOptions(options);
      setSelectedOption(options[0]);
    }
  }, [commune, productCategory, productType]);

  const handleCommuneChange = (selectedCommune: string) => {
    setCommune(selectedCommune);
    setAddress(prev => ({ ...prev, commune: selectedCommune }));
    setSelectedOption(null); // Reset selection when commune changes
  };

  const handleConfirm = () => {
    if (!selectedOption) return;

    if (selectedOption.type === 'pickup') {
      // Para retiro no necesitamos dirección
      onShippingSelected(selectedOption);
      onClose();
    } else {
      // Para envío validamos la dirección
      const validationErrors = validateShippingAddress(address);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }
      
      onShippingSelected(selectedOption, address);
      onClose();
    }
  };

  const getOptionIcon = (type: string) => {
    switch (type) {
      case 'pickup': return <MapPin className="w-6 h-6" />;
      case 'home': return <Home className="w-6 h-6" />;
      case 'point': return <Package className="w-6 h-6" />;
      default: return <Truck className="w-6 h-6" />;
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'GRATIS' : `$${price.toLocaleString('es-CL')} CLP`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Método de Envío</h3>
              <p className="text-gray-600 text-sm mt-1">Para: {productName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Selector de Comuna */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿A qué comuna quieres que enviemos? (opcional para retiro)
            </label>
            <select
              value={commune}
              onChange={(e) => handleCommuneChange(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Selecciona comuna o deja vacío para solo retiro</option>
              {communes.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Opciones de Envío */}
          <div className="space-y-4 mb-6">
            <h4 className="font-medium text-gray-900">Opciones disponibles:</h4>
            
            {shippingOptions.map((option) => (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedOption?.id === option.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedOption(option)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      selectedOption?.id === option.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getOptionIcon(option.type)}
                    </div>
                    
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{option.name}</h5>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {option.deliveryTime}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      option.price === 0 ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {formatPrice(option.price)}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Formulario de Dirección (solo para envíos) */}
          <AnimatePresence>
            {selectedOption && selectedOption.type !== 'pickup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <h4 className="font-medium text-gray-900">Datos de entrega:</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="w-4 h-4 inline mr-1" />
                      Nombre destinatario
                    </label>
                    <input
                      type="text"
                      value={address.receiverName}
                      onChange={(e) => setAddress(prev => ({ ...prev, receiverName: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Nombre completo"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={address.receiverPhone}
                      onChange={(e) => setAddress(prev => ({ ...prev, receiverPhone: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email destinatario
                  </label>
                  <input
                    type="email"
                    value={address.receiverEmail}
                    onChange={(e) => setAddress(prev => ({ ...prev, receiverEmail: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="email@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Home className="w-4 h-4 inline mr-1" />
                    Dirección completa
                  </label>
                  <input
                    type="text"
                    value={address.address}
                    onChange={(e) => setAddress(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Calle, número, depto/casa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referencia (opcional)
                  </label>
                  <input
                    type="text"
                    value={address.reference}
                    onChange={(e) => setAddress(prev => ({ ...prev, reference: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Entre qué calles, color de casa, etc."
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Errores */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <div className="text-red-800 text-sm">
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Resumen */}
          {selectedOption && (
            <div className="bg-gray-50 rounded-lg p-4 mt-6">
              <h4 className="font-medium text-gray-900 mb-2">Resumen:</h4>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{selectedOption.name}</span>
                <span className="font-bold text-lg">{formatPrice(selectedOption.price)}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{selectedOption.deliveryTime}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedOption}
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Confirmar {selectedOption && `(${formatPrice(selectedOption.price)})`}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
