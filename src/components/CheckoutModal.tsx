import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useSound } from '../hooks/useSound';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (email: string) => Promise<void>;
  cartTotal: number;
  isProcessing: boolean;
}

export function CheckoutModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  cartTotal,
  isProcessing 
}: CheckoutModalProps) {
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const { playClick, playError } = useSound();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!email.trim()) {
      setEmailError('Por favor ingresa tu email');
      playError();
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Por favor ingresa un email válido');
      playError();
      return;
    }

    if (email !== confirmEmail) {
      setEmailError('Los emails no coinciden');
      playError();
      return;
    }

    setEmailError('');
    playClick();

    try {
      await onConfirm(email);
    } catch (error) {
      console.error('Error en checkout:', error);
      setEmailError('Error procesando el pedido. Intenta nuevamente.');
      playError();
    }
  };

  const handleClose = () => {
    if (isProcessing) return; // No cerrar mientras procesa
    setEmail('');
    setConfirmEmail('');
    setEmailError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isProcessing ? handleClose : undefined}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        Finalizar Pedido
                      </h2>
                      <p className="text-sm text-gray-600">
                        Total: {formatPrice(cartTotal)}
                      </p>
                    </div>
                  </div>
                  
                  {!isProcessing && (
                    <motion.button
                      onClick={handleClose}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Form */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Tu Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isProcessing}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        emailError ? 'border-red-300' : 'border-gray-300'
                      } ${isProcessing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>

                  {/* Confirm Email Input */}
                  <div>
                    <label htmlFor="confirmEmail" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Email
                    </label>
                    <input
                      type="email"
                      id="confirmEmail"
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      disabled={isProcessing}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
                        emailError ? 'border-red-300' : 'border-gray-300'
                      } ${isProcessing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                      placeholder="Confirma tu email"
                      required
                    />
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {emailError && (
                      <motion.div
                        className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{emailError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Info Message */}
                  <div className="flex items-start gap-2 text-gray-600 text-sm bg-blue-50 p-3 rounded-lg">
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Te enviaremos:</p>
                      <ul className="mt-1 space-y-1 text-blue-700">
                        <li>• Confirmación del pedido</li>
                        <li>• Actualizaciones de estado</li>
                        <li>• Información de envío</li>
                      </ul>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isProcessing}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                      isProcessing
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 hover:scale-105 shadow-lg hover:shadow-xl'
                    }`}
                    whileHover={!isProcessing ? { scale: 1.02 } : {}}
                    whileTap={!isProcessing ? { scale: 0.98 } : {}}
                  >
                    {isProcessing ? (
                      <>
                        <motion.div
                          className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        Continuar al Pago
                      </>
                    )}
                  </motion.button>

                  {/* Security Info */}
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Serás redirigido a Flow para completar el pago de forma segura
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
