import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Package, Clock, Truck, MapPin, CreditCard, Heart } from 'lucide-react';

interface FAQProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  icon: any;
}

const faqData: FAQItem[] = [
  // Categoría: Productos
  {
    id: 'producto-tarjeta',
    category: 'Productos',
    icon: Heart,
    question: '¿Qué es una tarjeta explosiva?',
    answer: 'Una tarjeta explosiva es una tarjeta de regalo personalizada que al abrirse se despliega mostrando fotos y mensajes en múltiples paneles. Es perfecta para sorprender con recuerdos especiales en cumpleaños, aniversarios, graduaciones y más.'
  },
  {
    id: 'diferencia-simple-triple',
    category: 'Productos', 
    icon: Package,
    question: '¿Cuál es la diferencia entre tarjeta simple y triple?',
    answer: 'La tarjeta SIMPLE tiene 1 cubo con 4 espacios (4 fotos/mensajes total). La tarjeta TRIPLE tiene 3 cubos con 4 espacios cada uno (12 fotos/mensajes total). La triple es ideal para contar una historia más completa con más recuerdos.'
  },
  {
    id: 'diferencia-cajas',
    category: 'Productos',
    icon: Package,
    question: '¿Cuál es la diferencia entre caja dulce y caja dulce mini?',
    answer: 'La CAJA DULCE MINI (20x15x5cm) incluye dulces y chocolates selectos más la tarjeta personalizada. La CAJA DULCE normal (25x20x10cm) es más grande, incluye mayor variedad y cantidad de dulces gourmet. Ambas son perfectas para regalar.'
  },
  {
    id: 'caja-salada',
    category: 'Productos',
    icon: Package,
    question: '¿Por qué la caja salada no tiene envío?',
    answer: 'La caja salada contiene productos más grandes y pesados como botellas, snacks gourmet y productos delicados que requieren manejo especial. Solo está disponible para retiro en nuestra ubicación en Providencia para garantizar que llegue en perfecto estado.'
  },

  // Categoría: Personalización
  {
    id: 'como-personalizar',
    category: 'Personalización',
    icon: Heart,
    question: '¿Cómo personalizo mi tarjeta?',
    answer: 'Después de elegir tu producto, sube tus fotos favoritas (máximo 12 para tarjeta triple, 4 para simple) y escribe mensajes especiales. Nuestro equipo se encarga de armar tu tarjeta única con amor y cuidado en cada detalle.'
  },
  {
    id: 'tipos-fotos',
    category: 'Personalización',
    icon: Heart,
    question: '¿Qué tipo de fotos puedo usar?',
    answer: 'Acepta fotos JPG, PNG o HEIC. Para mejor calidad, usa fotos de alta resolución. Evita fotos muy oscuras o borrosas. ¡Las fotos con buenos recuerdos y sonrisas quedan espectaculares!'
  },
  {
    id: 'cambios-pedido',
    category: 'Personalización',
    icon: Clock,
    question: '¿Puedo hacer cambios después de realizar el pedido?',
    answer: 'Puedes hacer cambios hasta 2 horas después de confirmado el pago. Después de ese tiempo comenzamos la producción y no es posible modificar. ¡Revisa bien tus fotos y mensajes antes de pagar!'
  },

  // Categoría: Envíos y Entregas
  {
    id: 'opciones-envio',
    category: 'Envíos',
    icon: Truck,
    question: '¿Qué opciones de envío tienen?',
    answer: 'Ofrecemos 3 opciones: 1) Retiro GRATIS en Providencia, 2) Envío a domicilio con Blue Express, 3) Retiro en Punto Blue Express (más económico). Los precios varían según ubicación y tamaño del producto.'
  },
  {
    id: 'retiro-gratis',
    category: 'Envíos',
    icon: MapPin,
    question: '¿Dónde puedo retirar gratis mi pedido?',
    answer: 'Puedes retirar sin costo en nuestra ubicación en Providencia. Te contactaremos por WhatsApp para coordinar el horario de retiro una vez que tu pedido esté listo (24-48 horas después del pago).'
  },
  {
    id: 'blue-express',
    category: 'Envíos',
    icon: Truck,
    question: '¿Qué es Blue Express?',
    answer: 'Blue Express es nuestra empresa de envíos, reconocida en Chile por su confiabilidad. Ofrecen entrega a domicilio y retiro en puntos disponibles 24/7 en estaciones Copec. Las tarifas son oficiales y varían por zona geográfica.'
  },
  {
    id: 'tiempos-envio',
    category: 'Envíos',
    icon: Clock,
    question: '¿Cuánto demoran los envíos?',
    answer: 'Producción: 24 horas hábiles después del pago. Envío: Santiago 1-3 días, regiones 3-5 días. El retiro en Providencia está disponible desde las 24 horas de producción.'
  },
  {
    id: 'costos-envio',
    category: 'Envíos',
    icon: CreditCard,
    question: '¿Cuánto cuesta el envío?',
    answer: 'Tarjetas desde $2.600, Cajas Mini desde $3.700, Cajas Dulce desde $4.300. Los precios son menores en Santiago y mayores en regiones. El retiro en Providencia es siempre GRATIS.'
  },

  // Categoría: Pagos y Pedidos
  {
    id: 'formas-pago',
    category: 'Pagos',
    icon: CreditCard,
    question: '¿Qué formas de pago aceptan?',
    answer: 'Aceptamos todas las tarjetas de crédito y débito, transferencias bancarias y pagos con códigos QR a través de Flow, una plataforma de pagos segura y confiable usada por miles de empresas en Chile.'
  },
  {
    id: 'seguridad-pago',
    category: 'Pagos',
    icon: CreditCard,
    question: '¿Es seguro pagar en línea?',
    answer: 'Sí, totalmente seguro. Usamos Flow como procesador de pagos, que cuenta con certificación de seguridad bancaria. Tus datos financieros están protegidos y nunca almacenamos información de tarjetas.'
  },
  {
    id: 'confirmacion-pedido',
    category: 'Pagos',
    icon: Clock,
    question: '¿Cómo sé que mi pedido fue confirmado?',
    answer: 'Recibirás un email de confirmación inmediatamente después del pago exitoso. También te contactaremos por WhatsApp para confirmar detalles y coordinar la entrega o retiro.'
  }
];

const categories = ['Productos', 'Personalización', 'Envíos', 'Pagos'];

export function FAQModal({ isOpen, onClose }: FAQProps) {
  const [selectedCategory, setSelectedCategory] = useState('Productos');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const filteredFAQs = faqData.filter(item => item.category === selectedCategory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-6 h-6 text-primary-600" />
              <div>
                <h3 className="text-xl font-bold text-gray-900">Preguntas Frecuentes</h3>
                <p className="text-gray-600 text-sm mt-1">Todo lo que necesitas saber sobre FestiBox</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex h-[70vh]">
          {/* Sidebar de categorías */}
          <div className="w-1/4 bg-gray-50 border-r border-gray-200 p-4">
            <h4 className="font-medium text-gray-900 mb-4">Categorías</h4>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Contenido de preguntas */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h4 className="font-semibold text-lg text-gray-900 mb-4">
              {selectedCategory}
            </h4>
            
            <div className="space-y-4">
              {filteredFAQs.map((item) => {
                const Icon = item.icon;
                const isOpen = openItems.includes(item.id);
                
                return (
                  <div key={item.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-primary-600 flex-shrink-0" />
                        <span className="font-medium text-gray-900">{item.question}</span>
                      </div>
                      <ChevronDown 
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 text-gray-600 leading-relaxed">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600 mb-2">¿No encontraste lo que buscabas?</p>
            <p className="text-sm text-gray-500">
              Contáctanos por WhatsApp:{' '}
              <a 
                href="https://wa.me/message/TBSLQVGBXZ3QM1" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Enviar mensaje
              </a>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
