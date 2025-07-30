// Replicación exacta del ejemplo create.php de Flow
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Configuración como en Config.class.php
  const COMMERCE_CONFIG = {
    APIKEY: '1F35DEE4-1B10-49E6-A226-55845L8E1A12',
    SECRETKEY: '1f47dd2ce362449c28a2c6805f8495b74cd684a1',
    APIURL: 'https://www.flow.cl/api',
    BASEURL: 'https://festibox.cl'
  };

  // Función sign exactamente como en PHP
  function sign(params, secretKey) {
    const keys = Object.keys(params);
    keys.sort(); // PHP: sort($keys);
    
    let toSign = "";
    for (const key of keys) {
      toSign += key + params[key]; // PHP: $toSign .= $key . $params[$key];
    }
    
    // PHP: hash_hmac('sha256', $toSign , $this->secretKey);
    return crypto.createHmac('sha256', secretKey).update(toSign).digest('hex');
  }

  try {
    // Replicar exactamente el ejemplo create.php
    const params = {
      commerceOrder: Math.floor(Math.random() * (2000 - 1100) + 1100), // PHP: rand(1100,2000)
      subject: "FestiBox - Tarjeta Explosiva Simple (1x)",
      currency: "CLP",
      amount: 12990,
      email: "javohv@gmail.com",
      urlConfirmation: COMMERCE_CONFIG.BASEURL + "/api/flow/confirmation",
      urlReturn: COMMERCE_CONFIG.BASEURL + "/pedido-confirmado"
    };

    console.log('=== REPLICANDO EJEMPLO OFICIAL PHP ===');
    console.log('Parámetros originales:', params);

    // Replicar líneas exactas del método send() en FlowApi.class.php:
    // $params = array("apiKey" => $this->apiKey) + $params;
    const paramsWithApiKey = {
      apiKey: COMMERCE_CONFIG.APIKEY,
      ...params
    };

    console.log('Parámetros con apiKey:', paramsWithApiKey);

    // $params["s"] = $this->sign($params);
    const signature = sign(paramsWithApiKey, COMMERCE_CONFIG.SECRETKEY);
    paramsWithApiKey.s = signature;

    console.log('Firma generada:', signature);
    console.log('Parámetros finales:', Object.keys(paramsWithApiKey).sort());

    // String para debug
    const keys = Object.keys(paramsWithApiKey).sort();
    keys.splice(keys.indexOf('s'), 1); // Remover 's' para debug
    let debugString = '';
    for (const key of keys) {
      debugString += key + paramsWithApiKey[key];
    }
    console.log('String firmado (sin s):', debugString);
    console.log('Longitud string:', debugString.length);

    // Enviar request exactamente como httpPost en PHP
    const formData = new URLSearchParams();
    Object.entries(paramsWithApiKey).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    console.log('FormData preparado, enviando a:', COMMERCE_CONFIG.APIURL + '/payment/create');

    const response = await fetch(COMMERCE_CONFIG.APIURL + '/payment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formData
    });

    const responseText = await response.text();
    console.log('Respuesta HTTP Status:', response.status);
    console.log('Respuesta cruda:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      result = { error: 'No se pudo parsear JSON', raw: responseText };
    }

    return res.json({
      config: {
        apiKeyLength: COMMERCE_CONFIG.APIKEY.length,
        secretKeyLength: COMMERCE_CONFIG.SECRETKEY.length
      },
      originalParams: params,
      paramsWithApiKey: Object.keys(paramsWithApiKey).sort(),
      signature,
      debugString,
      debugStringLength: debugString.length,
      httpStatus: response.status,
      flowResponse: result,
      success: response.status === 200 && result && !result.code
    });

  } catch (error) {
    console.error('Error:', error);
    return res.json({
      error: error.message,
      stack: error.stack
    });
  }
}
