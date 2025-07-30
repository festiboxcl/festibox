#!/bin/bash

# Script para limpiar y reconfigurar variables de entorno Flow

echo "🧹 Limpiando variables de entorno Flow..."

# Limpiar todas las variables existentes
echo "y" | npx vercel env rm FLOW_SECRET_KEY || true

echo "🔧 Agregando variables limpias..."

# Secret key exacto (40 caracteres)
SECRET_KEY="1f47dd2ce362449c28a2c6805f8495b74cd684a1"

# Agregar a todos los entornos
echo "$SECRET_KEY" | npx vercel env add FLOW_SECRET_KEY production
echo "$SECRET_KEY" | npx vercel env add FLOW_SECRET_KEY preview  
echo "$SECRET_KEY" | npx vercel env add FLOW_SECRET_KEY development

echo "✅ Variables configuradas. Listando..."
npx vercel env ls

echo "🚀 Haciendo redeploy..."
npx vercel --prod --force
