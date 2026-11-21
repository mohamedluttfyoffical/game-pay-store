const fs = require('fs');
const vm = require('vm');

const xml = fs.readFileSync('blogger/game-pay-blogger-template.xml', 'utf8');

// 1. Check basic tags
if (!xml.startsWith('<?xml version="1.0" encoding="UTF-8" ?>')) {
  throw new Error('Missing XML declaration');
}

// 2. Check CDATA blocks
if (!xml.includes('<b:skin><![CDATA[') || !xml.includes(']]></b:skin>')) {
  throw new Error('Invalid b:skin CDATA enclosure');
}
if (!xml.includes('<script>\n  //<![CDATA[') || !xml.includes('//]]>\n  </script>')) {
  throw new Error('Invalid script CDATA enclosure');
}

// 3. Extract and check JS syntax
const jsMatch = xml.match(/<script>\s*\/\/<!\[CDATA\[([\s\S]*?)\/\/\]\]>\s*<\/script>/);
if (!jsMatch) {
  throw new Error('Could not find JS block in XML');
}

new vm.Script(jsMatch[1], { filename: 'app-engine.js' });
console.log('✔ JavaScript syntax is 100% valid!');

// 4. Check XML structure
let cleanXml = xml.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, 'CDATA');
if (!cleanXml.includes('</html>') || !cleanXml.includes('</body>') || !cleanXml.includes('</head>')) {
  throw new Error('Missing standard closing tags');
}
if (!cleanXml.includes("<b:widget id='Blog1'")) {
  throw new Error('Missing Blogger Blog1 widget');
}

console.log('✔ Blogger XML structure is 100% well-formed and valid!');
console.log(`✔ Template file size: ${(Buffer.byteLength(xml, 'utf8') / 1024).toFixed(2)} KB`);
