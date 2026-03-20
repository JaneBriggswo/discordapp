const fs = require('fs')
const path = require('path')

// Simple code obfuscation for production builds
function obfuscateCode(code) {
  // Replace sensitive function names and variables
  const replacements = {
    'protectedAction': 'a1',
    'StealthProtection': 'b2',
    'AntiDebugProvider': 'c3',
    'useAuthProtection': 'd4',
    'SecurityManager': 'e5',
    'ServerProtection': 'f6',
    'pink_remote_session': 'g7',
    'pink_remote_csrf': 'h8',
    'handleLoad': 'i9',
    'handleSettingChange': 'j10',
    'addNotification': 'k11',
    'updateAim': 'l12',
    'updateVisuals': 'm13',
    'updateSettings': 'n14'
  }

  let obfuscated = code
  
  // Replace function names
  Object.entries(replacements).forEach(([original, replacement]) => {
    const regex = new RegExp(`\\b${original}\\b`, 'g')
    obfuscated = obfuscated.replace(regex, replacement)
  })

  // Add fake comments to confuse
  obfuscated = `// Next.js compiled component - Development build\n// Auto-generated code - Do not modify\n${obfuscated}`

  return obfuscated
}

// Obfuscate files in .next directory after build
function obfuscateBuildFiles() {
  const nextDir = path.join(__dirname, '../.next')
  
  if (!fs.existsSync(nextDir)) {
    console.log('No .next directory found')
    return
  }

  // Find and obfuscate JavaScript files
  function processDirectory(dir) {
    const files = fs.readdirSync(dir)
    
    files.forEach(file => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      
      if (stat.isDirectory()) {
        processDirectory(filePath)
      } else if (file.endsWith('.js') && !file.includes('webpack')) {
        try {
          const content = fs.readFileSync(filePath, 'utf8')
          const obfuscated = obfuscateCode(content)
          fs.writeFileSync(filePath, obfuscated)
          console.log(`Obfuscated: ${filePath}`)
        } catch (error) {
          console.log(`Skipped: ${filePath} (${error.message})`)
        }
      }
    })
  }

  processDirectory(nextDir)
  console.log('Build obfuscation complete')
}

// Run if called directly
if (require.main === module) {
  obfuscateBuildFiles()
}

module.exports = { obfuscateCode, obfuscateBuildFiles }