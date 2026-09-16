// scripts/audio-audit-full.js
// ✅ Ավելացնել աջակցություն OLD format-ի համար

function loadManifest(lang) {
  const manifestPath = MANIFESTS[lang];
  if (!fs.existsSync(manifestPath)) {
    LOG.warning(`Manifest not found: ${manifestPath}`);
    return null;
  }
  
  try {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const data = JSON.parse(content);
    
    // ✅ Convert OLD format to NEW format
    if (data.entries && !data.mapping) {
      const mapping = {};
      for (const [key, entry] of Object.entries(data.entries)) {
        // Try to get numId from filename
        const filename = entry.filename || '';
        const numId = filename.replace('.mp3', '');
        if (numId && !isNaN(parseInt(numId))) {
          mapping[key] = numId;
        } else {
          // If no numId, use index
          const index = Object.keys(mapping).length + 1;
          mapping[key] = String(index).padStart(6, '0');
        }
      }
      data.mapping = mapping;
      data.totalFiles = Object.keys(mapping).length;
    }
    
    return data;
  } catch (error) {
    LOG.error(`Failed to load ${lang} manifest: ${error.message}`);
    return null;
  }
}