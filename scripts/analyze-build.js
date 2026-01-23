const fs = require('fs');
const path = require('path');

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (err) {
    return 0;
  }
}

function analyzeDirectory(dir, prefix = '') {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...analyzeDirectory(fullPath, path.join(prefix, item)));
      } else {
        files.push({
          path: path.join(prefix, item),
          size: stat.size,
          sizeFormatted: formatBytes(stat.size)
        });
      }
    });
  } catch (err) {
    // Ignore errors
  }
  
  return files;
}

function analyzeBuild() {
  const buildDir = path.join(process.cwd(), '.next');
  
  if (!fs.existsSync(buildDir)) {
    console.log('❌ Build directory not found. Please run "pnpm build" first.');
    return;
  }
  
  console.log('\n📊 Build Size Analysis\n');
  console.log('═'.repeat(80));
  
  // Analyze static files
  const staticDir = path.join(buildDir, 'static');
  if (fs.existsSync(staticDir)) {
    console.log('\n📦 Static Files:');
    const staticFiles = analyzeDirectory(staticDir);
    const jsFiles = staticFiles.filter(f => f.path.endsWith('.js'));
    const cssFiles = staticFiles.filter(f => f.path.endsWith('.css'));
    
    if (jsFiles.length > 0) {
      console.log('\n  JavaScript Files:');
      jsFiles
        .sort((a, b) => b.size - a.size)
        .slice(0, 20) // Top 20 largest JS files
        .forEach(file => {
          console.log(`    ${file.sizeFormatted.padStart(10)} - ${file.path}`);
        });
      
      const totalJsSize = jsFiles.reduce((sum, f) => sum + f.size, 0);
      console.log(`    ${'─'.repeat(70)}`);
      console.log(`    ${formatBytes(totalJsSize).padStart(10)} - Total JavaScript`);
    }
    
    if (cssFiles.length > 0) {
      console.log('\n  CSS Files:');
      cssFiles
        .sort((a, b) => b.size - a.size)
        .forEach(file => {
          console.log(`    ${file.sizeFormatted.padStart(10)} - ${file.path}`);
        });
      
      const totalCssSize = cssFiles.reduce((sum, f) => sum + f.size, 0);
      console.log(`    ${'─'.repeat(70)}`);
      console.log(`    ${formatBytes(totalCssSize).padStart(10)} - Total CSS`);
    }
  }
  
  // Analyze server files
  const serverDir = path.join(buildDir, 'server');
  if (fs.existsSync(serverDir)) {
    console.log('\n🖥️  Server Files:');
    const serverFiles = analyzeDirectory(serverDir);
    const topServerFiles = serverFiles
      .filter(f => f.path.endsWith('.js') || f.path.endsWith('.html'))
      .sort((a, b) => b.size - a.size)
      .slice(0, 15);
    
    topServerFiles.forEach(file => {
      console.log(`    ${file.sizeFormatted.padStart(10)} - ${file.path}`);
    });
    
    const totalServerSize = serverFiles.reduce((sum, f) => sum + f.size, 0);
    console.log(`    ${'─'.repeat(70)}`);
    console.log(`    ${formatBytes(totalServerSize).padStart(10)} - Total Server`);
  }
  
  // Total size
  const allFiles = analyzeDirectory(buildDir);
  const totalSize = allFiles.reduce((sum, f) => sum + f.size, 0);
  
  console.log('\n' + '═'.repeat(80));
  console.log(`\n🎯 Total Build Size: ${formatBytes(totalSize)}`);
  console.log(`📁 Total Files: ${allFiles.length}`);
  console.log('\n' + '═'.repeat(80) + '\n');
}

analyzeBuild();
