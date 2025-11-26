const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE_FILE = path.join(__dirname, '../public/poezja.png');
const DEST_DIR = path.join(__dirname, '../public/icons');

if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
}

async function generateIcons() {
    try {
        console.log('Generating icons from:', SOURCE_FILE);

        await sharp(SOURCE_FILE)
            .resize(192, 192)
            .toFile(path.join(DEST_DIR, 'icon-192x192.png'));
        console.log('✅ Generated icon-192x192.png');

        await sharp(SOURCE_FILE)
            .resize(512, 512)
            .toFile(path.join(DEST_DIR, 'icon-512x512.png'));
        console.log('✅ Generated icon-512x512.png');

        // Apple touch icon (usually 180x180 or same as 192)
        await sharp(SOURCE_FILE)
            .resize(180, 180)
            .toFile(path.join(DEST_DIR, 'apple-touch-icon.png'));
        console.log('✅ Generated apple-touch-icon.png');

    } catch (error) {
        console.error('Error generating icons:', error);
    }
}

generateIcons();
