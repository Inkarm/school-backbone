const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

try {
    let content = fs.readFileSync(envPath, 'utf8');

    // Remove BOM if present
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }

    // Split into lines and clean up
    let lines = content.split(/\r?\n/).filter(line => line.trim() !== '');

    // Parse existing values to avoid duplicates
    const env = {};
    lines.forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            env[match[1].trim()] = match[2].trim();
        }
    });

    // Ensure AUTH_SECRET
    if (!env['AUTH_SECRET']) {
        env['AUTH_SECRET'] = 'complex_secret_key_123';
    }

    // Ensure AUTH_TRUST_HOST
    if (!env['AUTH_TRUST_HOST']) {
        env['AUTH_TRUST_HOST'] = 'true';
    }

    // Reconstruct content
    const newContent = Object.entries(env)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    fs.writeFileSync(envPath, newContent, 'utf8');
    console.log('Successfully fixed .env file');
    console.log('Keys present:', Object.keys(env).join(', '));

} catch (error) {
    console.error('Error fixing .env:', error);
}
