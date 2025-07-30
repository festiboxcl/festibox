import { useState, useMemo } from 'react';
import type { Product } from '../types';

export function useProductWithOptions(baseProduct: Product | null) {
  const [selectedCardOption, setSelectedCardOption] = useState<string>(
    baseProduct?.defaultCardOption || baseProduct?.cardOptions?.[0]?.id || ''
  );

  // Crear un producto actualizado con la opción seleccionada
  const productWithSelectedOption = useMemo(() => {
    if (!baseProduct) {
      return null;
    }
    
    if (!baseProduct.cardOptions || baseProduct.cardOptions.length === 0) {
      return baseProduct;
    }

    const selectedOption = baseProduct.cardOptions.find(opt => opt.id === selectedCardOption);
    if (!selectedOption) {
      return baseProduct;
    }

    // Crear una nueva instancia del producto con los valores actualizados
    return {
      ...baseProduct,
      image: selectedOption.image,
      price: baseProduct.basePrice + selectedOption.priceModifier,
      imageCount: selectedOption.cubes * selectedOption.spacesPerCube,
      cubes: selectedOption.cubes,
      spacesPerCube: selectedOption.spacesPerCube,
      // Mantener referencia a la opción seleccionada
      selectedCardOption: selectedOption
    };
  }, [baseProduct, selectedCardOption]);

  return {
    product: productWithSelectedOption,
    selectedCardOption,
    setSelectedCardOption,
    hasCardOptions: Boolean(baseProduct?.cardOptions && baseProduct.cardOptions.length > 0)
  };
}
