const fs = require('fs');
const path = require('path');
const vm = require('vm');

// 1. Locate compiled CSS
const assetsDir = path.join(__dirname, '../dist/public/assets');
const cssFile = fs.readdirSync(assetsDir).find(f => f.startsWith('index-') && f.endsWith('.css'));
if (!cssFile) {
  console.error('[Error] Compiled CSS not found in dist/public/assets. Please run pnpm exec vite build first.');
  process.exit(1);
}
const compiledCss = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');

// 2. Read Client Engine JS
const enginePath = path.join(__dirname, 'app-engine.js');
const clientAppScript = fs.readFileSync(enginePath, 'utf8');

// Verify JS syntax
try {
  new vm.Script(clientAppScript, { filename: 'app-engine.js' });
  console.log('[Check] app-engine.js is 100% syntactically valid.');
} catch (e) {
  console.error('[Syntax Error in app-engine.js]:', e);
  process.exit(1);
}

// Ensure no premature CDATA closure
if (clientAppScript.includes(']]>')) {
  console.error('[Error] clientAppScript contains literal "]]>", which would break XML CDATA block.');
  process.exit(1);
}

// 3. Assemble Blogger XML
const templateXml = `<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE html>
<html b:css='false' b:defaultwidgetversion='2' b:layoutsversion='3' dir='rtl' lang='ar' xmlns='http://www.w3.org/1999/xhtml' xmlns:b='http://www.google.com/2005/gml/b' xmlns:data='http://www.google.com/2005/gml/data' xmlns:expr='http://www.google.com/2005/gml/expr'>
<head>
  <meta charset='UTF-8'/>
  <meta content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' name='viewport'/>
  <title><data:blog.pageTitle/></title>
  
  <meta content='Game Pay – جيم باي | متجر شحن الألعاب والمنتجات الرقمية وحسابات الألعاب.' name='description'/>
  <meta content='#1a082f' name='theme-color'/>
  
  <!-- Preconnect & Fonts -->
  <link href='https://fonts.googleapis.com' rel='preconnect'/>
  <link crossorigin='' href='https://fonts.gstatic.com' rel='preconnect'/>
  <link href='https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&amp;display=swap' rel='stylesheet'/>
  
  <!-- Lucide Icons UMD -->
  <script src='https://unpkg.com/lucide@latest/dist/umd/lucide.js'></script>

  <!-- Firebase Compat SDKs (v10.8.0) -->
  <script src='https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js'></script>
  <script src='https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js'></script>
  <script src='https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js'></script>
  <script src='https://www.gstatic.com/firebasejs/10.8.0/firebase-storage-compat.js'></script>

  <!-- EXACT COMPILED TAILWIND V4 & GAME PAY PURPLE STYLESHEET -->
  <b:skin><![CDATA[
${compiledCss}

/* --- Blogger Template Specific Overrides --- */
.navbar, .widget-item-control, #header, .feed-links, .blog-feeds, .post-feeds {
  display: none !important;
}

body {
  background-color: #1a082f !important;
  font-family: 'Cairo', ui-sans-serif, system-ui, sans-serif !important;
  direction: rtl !important;
  margin: 0 !important;
  padding: 0 !important;
  min-height: 100vh;
  overflow-x: hidden;
}

/* Toast Container */
#toast-container {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}
.toast-item {
  pointer-events: auto;
  background: #220c3b;
  color: #f1f5f9;
  border: 1px solid rgba(185, 130, 236, 0.35);
  padding: 12px 18px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 700;
  box-shadow: 0 10px 25px rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  gap: 10px;
  animation: gp-toast-in 0.25s ease-out;
}
@keyframes gp-toast-in {
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
  ]]></b:skin>
</head>
<body>
  <!-- Root SPA Container for Game Pay -->
  <div id='app' class='store-shell min-h-screen bg-[#07111f] text-slate-100' dir='rtl'>
    <div class='grid min-h-screen place-items-center bg-[#1a082f]'>
      <div class='flex flex-col items-center gap-4'>
        <div class='grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400 text-white shadow-[0_0_28px_rgba(136,70,208,.42)]'>
          <i data-lucide='gamepad-2' class='h-6 w-6'></i>
        </div>
        <p class='text-sm font-bold text-slate-300'>جارٍ تشغيل Game Pay...</p>
      </div>
    </div>
  </div>

  <div id='toast-container'></div>

  <!-- Mandatory Blogger Section for Template Compatibility -->
  <b:section id='main' class='main' showaddelement='no'>
    <b:widget id='Blog1' locked='true' title='رسائل المدونة' type='Blog' version='2'>
      <b:includable id='main'>
        <div style='display:none !important;'>
          <b:loop values='data:posts' var='post'>
            <article>
              <h2><data:post.title/></h2>
              <div><data:post.body/></div>
            </article>
          </b:loop>
        </div>
      </b:includable>
    </b:widget>
  </b:section>

  <!-- Game Pay Client Engine Script -->
  <script>
  //<![CDATA[
${clientAppScript}
  //]]>
  </script>
</body>
</html>
`;

// 4. Save to destination
const outputPath = path.join(__dirname, 'game-pay-blogger-template.xml');
fs.writeFileSync(outputPath, templateXml, 'utf8');
console.log(`[Success] Game Pay Blogger XML template generated at: ${outputPath}`);
console.log(`[Stats] File size: ${(Buffer.byteLength(templateXml, 'utf8') / 1024).toFixed(2)} KB`);
