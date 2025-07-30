// Script para debugear la firma de Flow paso a paso
import crypto from 'crypto';

// Usa las credenciales exactas que me diste
const apiKey = '1F35DEE4-1B10-49E6-A226-55845L8E1A12';
const secretKey = '1f47dd2ce362449c28a2c6805f8495b74cd684a1';

console.log('=== DEBUG FLOW SIGNATURE ===');
console.log('API Key:', apiKey);
console.log('API Key Length:', apiKey.length);
console.log('Secret Key:', secretKey);
console.log('Secret Key Length:', secretKey.length);

// Parámetros exactos del log
const params = {
  amount: 12990,
  apiKey: apiKey,
  commerceOrder: 'FESTIBOX-1753908248499-8ijxc2l0z',
  currency: 'CLP',
  email: 'javohv@gmail.com',
  subject: 'FestiBox - Tarjeta Explosiva Simple (1x)',
  urlConfirmation: 'https://festibox.cl/api/flow/confirmation',
  urlReturn: 'https://festibox.cl/pedido-confirmado?order=FESTIBOX-1753908248499-8ijxc2l0z'
};

console.log('\n=== PARÁMETROS ===');
console.log(JSON.stringify(params, null, 2));

// Ordenar claves alfabéticamente
const sortedKeys = Object.keys(params).sort();
console.log('\n=== CLAVES ORDENADAS ===');
console.log(sortedKeys);

// Construir string para firmar
let stringToSign = '';
for (const key of sortedKeys) {
  const value = String(params[key]);
  console.log(`${key}: "${value}"`);
  stringToSign += key + value;
}

console.log('\n=== STRING PARA FIRMAR ===');
console.log('String completo:', stringToSign);
console.log('Longitud:', stringToSign.length);

// Generar firma con diferentes métodos
console.log('\n=== FIRMAS GENERADAS ===');

// Método 1: Nuestro actual
const signature1 = crypto.createHmac('sha256', secretKey).update(stringToSign, 'utf8').digest('hex');
console.log('1. UTF-8:', signature1);

// Método 2: Sin encoding
const signature2 = crypto.createHmac('sha256', secretKey).update(stringToSign).digest('hex');
console.log('2. Sin encoding:', signature2);

// Método 3: Latin1
const signature3 = crypto.createHmac('sha256', secretKey).update(stringToSign, 'latin1').digest('hex');
console.log('3. Latin1:', signature3);

// Método 4: Secret como buffer
const secretBuffer = Buffer.from(secretKey, 'utf8');
const signature4 = crypto.createHmac('sha256', secretBuffer).update(stringToSign, 'utf8').digest('hex');
console.log('4. Secret como buffer:', signature4);

// Método 5: Probar con secret en diferentes encodings
const secretHex = Buffer.from(secretKey, 'hex');
const signature5 = crypto.createHmac('sha256', secretHex).update(stringToSign, 'utf8').digest('hex');
console.log('5. Secret como hex buffer:', signature5);

// Método 6: Todo como binary
const signature6 = crypto.createHmac('sha256', secretKey).update(stringToSign, 'binary').digest('hex');
console.log('6. Binary:', signature6);

console.log('\n=== VERIFICAR CARACTERES ESPECIALES ===');
// Verificar si hay caracteres problemáticos
for (let i = 0; i < stringToSign.length; i++) {
  const char = stringToSign[i];
  const code = char.charCodeAt(0);
  if (code > 127) {
    console.log(`Carácter problemático en posición ${i}: "${char}" (código: ${code})`);
  }
}

export default function handler(req, res) {
  res.json({
    apiKey,
    secretKey: secretKey.substring(0, 10) + '...',
    params,
    sortedKeys,
    stringToSign,
    stringLength: stringToSign.length,
    signatures: {
      utf8: signature1,
      noEncoding: signature2,
      latin1: signature3,
      secretBuffer: signature4,
      secretHex: signature5,
      binary: signature6
    }
  });
}
