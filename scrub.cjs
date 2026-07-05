const fs = require('fs');
const txt = fs.readFileSync('.env.example', 'utf8');
fs.writeFileSync('.env.example', txt.replace(/="[^"]*"/g, '=""'));
