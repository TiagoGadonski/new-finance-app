const fs = require('fs');
const path = require('path');

// Verificar se sharp está instalado
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Sharp não está instalado. Instale com: npm install --save-dev sharp');
  console.log('\n💡 Alternativa: Use um conversor online como https://cloudconvert.com/svg-to-png');
  console.log('   Converta icon.svg para:');
  console.log('   - icon-192.png (192x192px)');
  console.log('   - icon-512.png (512x512px)');
  process.exit(1);
}

const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'icon.svg');

async function generateIcons() {
  try {
    console.log('🎨 Gerando ícones PWA...\n');

    // Verificar se o SVG existe
    if (!fs.existsSync(svgPath)) {
      console.error('❌ Arquivo icon.svg não encontrado em public/');
      process.exit(1);
    }

    const sizes = [
      { size: 192, name: 'icon-192.png' },
      { size: 512, name: 'icon-512.png' }
    ];

    for (const { size, name } of sizes) {
      const outputPath = path.join(publicDir, name);

      await sharp(svgPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Gerado: ${name} (${size}x${size}px)`);
    }

    console.log('\n🎉 Ícones PWA gerados com sucesso!');
    console.log('📁 Localização: frontend-nextjs/public/');

  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error.message);
    process.exit(1);
  }
}

generateIcons();
