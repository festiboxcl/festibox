import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Package, Clock, Truck, MapPin, CreditCard, Heart, X } from 'lucide-react';

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
    id: 'cuantas-fotos',
    category: 'Personalización',
    icon: Package,
    question: '¿Cuántas fotos puedo subir?',
    answer: 'Para tarjeta SIMPLE: hasta 4 fotos. Para tarjeta TRIPLE: hasta 12 fotos. Puedes agregar texto personalizado en cada espacio. Las fotos se imprimen en alta calidad y se adaptan automáticamente al diseño de la tarjeta.'
  },
  {
    id: 'proceso-personalizacion',
    category: 'Personalización',
    icon: Heart,
    question: '¿Cómo funciona la personalización?',
    answer: 'Después de elegir tu producto, puedes subir fotos desde tu dispositivo, escribir mensajes personalizados, y ver una vista previa de cómo quedará tu tarjeta. Nuestro equipo revisa cada diseño antes de la producción para garantizar la mejor calidad.'
  },

  // Categoría: Envíos
  {
    id: 'tiempo-envio',
    category: 'Envíos',
    icon: Clock,
    question: '¿Cuánto demora el envío?',
    answer: 'La producción toma 2-3 días hábiles. El envío con Blue Express es 1-2 días en Santiago y 2-4 días en regiones. En total: 3-5 días en Santiago, 4-7 días en regiones. ¡También puedes retirar gratis en Providencia!'
  },
  {
    id: 'cobertura-envio',
    category: 'Envíos',
    icon: MapPin,
    question: '¿Envían a todo Chile?',
    answer: 'Sí, enviamos a todo Chile continental a través de Blue Express. Cubrimos Santiago (zona celeste), regiones cercanas (zona naranja) y todo el país (zona verde). Los precios varían según la distancia y el tamaño del producto.'
  },
  {
    id: 'retiro-gratis',
    category: 'Envíos',
    icon: Truck,
    question: '¿Puedo retirar mi pedido?',
    answer: 'Sí, el retiro es GRATIS en nuestra ubicación en Providencia. Te notificaremos cuando esté listo (2-3 días hábiles). Es perfecto si vives cerca o prefieres asegurar que tu regalo llegue perfecto.'
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
    question: '¿Es seguro pagar online?',
    answer: 'Absolutamente seguro. Usamos Flow, la plataforma de pagos más confiable de Chile, con encriptación bancaria y certificaciones internacionales. Nunca almacenamos datos de tarjetas. Miles de empresas confían en Flow para sus pagos.'
  },
  {
    id: 'confirmacion-pedido',
    category: 'Pagos',
    icon: Heart,
    question: '¿Cómo sé que mi pedido se procesó?',
    answer: 'Recibirás un email de confirmación inmediatamente después del pago con todos los detalles. Te mantendremos informado durante la producción y envío. También puedes contactarnos por WhatsApp para cualquier consulta.'
  }
];

const categories = ['Productos', 'Personalización', 'Envíos', 'Pagos'];

export function FAQSection({ isOpen, onClose }: FAQProps) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.95 }}
        className="bg-white w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-xl sm:shadow-2xl sm:max-w-4xl overflow-hidden"
      >
        {/* Header - Mobile optimizado */}
        <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-secondary-50 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Preguntas Frecuentes</h3>
                <p className="text-gray-600 text-xs sm:text-sm mt-1 hidden sm:block">Todo lo que necesitas saber sobre FestiBox</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 -m-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Layout responsive: Stack vertical en mobile, horizontal en desktop */}
        <div className="flex flex-col sm:flex-row h-full sm:h-[70vh]">
          {/* Categorías - Horizontal scroll en mobile, sidebar en desktop */}
          <div className="w-full sm:w-1/4 bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-200 p-3 sm:p-4">
            <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">Categorías</h4>
            <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`flex-shrink-0 sm:w-full text-left px-3 py-2 rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap sm:whitespace-normal ${
                    selectedCategory === category
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100 bg-white sm:bg-transparent'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Contenido de preguntas - Optimizado para mobile */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h4 className="font-semibold text-base sm:text-lg text-gray-900 mb-4">
                {selectedCategory}
              </h4>
              
              <div className="space-y-3 sm:space-y-4">
                {filteredFAQs.map((item) => {
                  const Icon = item.icon;
                  const isOpen = openItems.includes(item.id);
                  
                  return (
                    <div key={item.id} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full flex items-center justify-between p-3 sm:p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                          <span className="font-medium text-gray-900 text-sm sm:text-base leading-snug pr-2">
                            {item.question}
                          </span>
                        </div>
                        <ChevronDown 
                          className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform flex-shrink-0 ${
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
                            <div className="p-3 sm:p-4 pt-0 border-t border-gray-100">
                              <div className="ml-7 sm:ml-8">
                                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                                  {item.answer}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Contacto adicional - Mobile friendly */}
              <div className="mt-6 sm:mt-8 p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg">
                <div className="text-center">
                  <h5 className="font-semibold text-gray-900 text-sm sm:text-base mb-2">
                    ¿No encuentras tu respuesta?
                  </h5>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3">
                    Contáctanos directamente y te ayudaremos de inmediato
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
                    <a
                      href="https://wa.me/message/TBSLQVGBXZ3QM1"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                    >
                      WhatsApp
                    </a>
                    <a
                      href="mailto:contacto@festibox.cl"
                      className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                      Email
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
