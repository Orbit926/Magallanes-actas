/**
 * Script para generar íconos PWA desde el logo
 * Ejecutar: node scripts/generate-icons.js
 * 
 * Requiere: npm install sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_LOGO = path.join(__dirname, '../public/logos/logo.png');
const ICONS_DIR = path.join(__dirname, '../public/icons');

// Tamaños de íconos necesarios para PWA
const ICON_SIZES = [
  16, 32, 72, 96, 128, 144, 152, 167, 180, 192, 384, 512
];

// Crear directorio si no existe
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

async function generateIcons() {
  console.log('🎨 Generando íconos PWA desde:', SOURCE_LOGO);
  
  for (const size of ICON_SIZES) {
    const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
    
    await sharp(SOURCE_LOGO)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Generado: icon-${size}x${size}.png`);
  }
  
  // Generar apple-touch-icon (180x180)
  const appleTouchIconPath = path.join(ICONS_DIR, 'apple-touch-icon.png');
  await sharp(SOURCE_LOGO)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(appleTouchIconPath);
  console.log('✅ Generado: apple-touch-icon.png');
  
  // Generar íconos maskable (con padding para safe zone)
  const maskableSizes = [192, 512];
  for (const size of maskableSizes) {
    const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}-maskable.png`);
    const innerSize = Math.floor(size * 0.8); // 80% del tamaño para safe zone
    
    // Crear imagen con fondo y logo centrado
    const background = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 245, g: 247, b: 250, alpha: 1 } // #F5F7FA
      }
    }).png().toBuffer();
    
    const logo = await sharp(SOURCE_LOGO)
      .resize(innerSize, innerSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();
    
    await sharp(background)
      .composite([{
        input: logo,
        gravity: 'center'
      }])
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Generado: icon-${size}x${size}-maskable.png`);
  }
  
  console.log('\n🎉 ¡Todos los íconos generados exitosamente!');
  console.log('📁 Ubicación:', ICONS_DIR);
}

generateIcons().catch(console.error);
