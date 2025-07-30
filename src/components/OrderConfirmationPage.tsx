import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowLeft, Clock, Mail } from 'lucide-react';
import { Logo } from '../components/Logo';
import { animations } from '../utils/animations';

interface OrderInfo {
  commerceOrder: string;
  items: any[];
  totals: any;
  customerEmail: string;
  flowOrder: number;
  token: string;
  createdAt: string;
}

export function OrderConfirmationPage() {
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'loading' | 'success' | 'failed'>('loading');

  useEffect(() => {
    // Obtener información del pedido desde localStorage
    const savedOrder = localStorage.getItem('festibox-current-order');
    if (savedOrder) {
      try {
        const orderData = JSON.parse(savedOrder);
        setOrderInfo(orderData);
        
        // Aquí podrías verificar el estado del pago con Flow
        // Por ahora simularemos que fue exitoso
        setTimeout(() => {
          setPaymentStatus('success');
          // Limpiar el pedido después de confirmar
          localStorage.removeItem('festibox-current-order');
        }, 1500);
      } catch (error) {
        console.error('Error cargando información del pedido:', error);
        setPaymentStatus('failed');
      }
    } else {
      setPaymentStatus('failed');
    }
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (paymentStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          className="text-center"
          {...animations.fadeIn}
        >
          <motion.div
            className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Verificando tu pago...
          </h2>
          <p className="text-gray-600">
            Por favor espera mientras confirmamos tu pedido
          </p>
        </motion.div>
      </div>
    );
  }

  if (paymentStatus === 'failed' || !orderInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div 
          className="text-center max-w-md mx-auto px-4"
          {...animations.fadeIn}
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No pudimos encontrar tu pedido
          </h2>
          <p className="text-gray-600 mb-6">
            Si realizaste un pago, por favor contacta nuestro soporte con tu comprobante.
          </p>
          <motion.button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-20">
            <Logo size="lg" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
          {...animations.slideInFromBottom}
        >
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-8 text-center border-b">
            <motion.div
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
            >
              <CheckCircle className="w-10 h-10 text-green-600" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ¡Pago Confirmado!
            </h1>
            <p className="text-lg text-gray-600">
              Tu FestiBox está siendo preparado con amor
            </p>
          </div>

          {/* Order Details */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Order Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Detalles del Pedido
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Número de pedido:</span>
                    <span className="font-medium text-gray-900">
                      {orderInfo.commerceOrder}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fecha del pedido:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(orderInfo.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">
                      {orderInfo.customerEmail}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total pagado:</span>
                    <span className="font-semibold text-primary-600 text-lg">
                      {formatPrice(orderInfo.totals.total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Productos ({orderInfo.items.length})
                </h3>
                <div className="space-y-3">
                  {orderInfo.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {item.product.name}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {item.photos?.length || 0} fotos • {item.messages?.length || 0} mensajes
                        </p>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* What's Next */}
            <div className="mt-8 p-6 bg-blue-50 rounded-xl">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                ¿Qué sigue ahora?
              </h3>
              <div className="space-y-3 text-blue-800">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold">1</span>
                  </div>
                  <p className="text-sm">
                    <strong>Preparación:</strong> Comenzaremos a crear tu FestiBox personalizado en las próximas 24 horas.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold">2</span>
                  </div>
                  <p className="text-sm">
                    <strong>Actualización:</strong> Te enviaremos fotos del proceso por email.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold">3</span>
                  </div>
                  <p className="text-sm">
                    <strong>Envío:</strong> Te notificaremos cuando tu pedido esté en camino (3-5 días hábiles).
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                ¿Tienes preguntas?
              </h4>
              <p className="text-sm text-gray-600">
                Contáctanos en <strong>contacto@festibox.cl</strong> o por Instagram{' '}
                <strong>@festibox.cl</strong>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <motion.button
                onClick={() => window.location.href = '/'}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-4 h-4" />
                Crear otro FestiBox
              </motion.button>
              <motion.button
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Package className="w-4 h-4" />
                Imprimir comprobante
              </motion.button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
