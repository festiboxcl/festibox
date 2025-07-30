export default async function handler(req, res) {
  try {
    // APIKey está en el formato correcto según Flow 
    // XXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
    const originalApiKey = '1F35DEE4-1B10-49E6-A226-55845L8E1A12';
    
    // Prueba 1: API Key original
    const apiKey1 = originalApiKey;
    
    // Prueba 2: Reemplazar L con 1
    const apiKey2 = originalApiKey.replace('L', '1');
    
    // Prueba 3: Eliminar guiones
    const apiKey3 = originalApiKey.replace(/-/g, '');
    
    // Prueba 4: API Key alternativa (por si acaso)
    const apiKey4 = '1F35DEE4IB1049E6A22655845L8E1A12';
    
    return res.status(200).json({
      success: true,
      apiKeyVersions: {
        original: apiKey1,
        replaced_L_with_1: apiKey2,
        no_hyphens: apiKey3,
        alternative: apiKey4
      },
      instructionsToTry: [
        "Prueba con la API Key original exacta",
        "Prueba reemplazando la L con 1 (podría ser un error tipográfico)",
        "Prueba eliminando los guiones",
        "Verifica en Flow si la API Key es correcta"
      ]
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
