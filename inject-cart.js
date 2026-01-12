const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

if (!html.includes('cart.js')) {
  html = html.replace('</body>', '<script src="/cart.js"></script></body>');
  fs.writeFileSync('index.html', html);
  console.log('✅ Cart.js injetado com sucesso!');
} else {
  console.log('⚠️ Cart.js já está no HTML');
}
