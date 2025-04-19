import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = path.join(__dirname, '.env');

// Read the current .env file
let envContent = fs.readFileSync(envFile, 'utf8');

// Split by lines
const lines = envContent.split('\n');
let fixedContent = [];

let inFrameMetadata = false;
let frameMetadataValue = '';

// Process each line
for (const line of lines) {
  // If this is the start of FRAME_METADATA
  if (line.startsWith('FRAME_METADATA=')) {
    inFrameMetadata = true;
    frameMetadataValue = line.substring('FRAME_METADATA='.length);
    
    // If the line ends with another property, it's a complete line
    if (frameMetadataValue.endsWith('"')) {
      inFrameMetadata = false;
      try {
        // Test if it's valid JSON
        const jsonValue = JSON.parse(frameMetadataValue);
        fixedContent.push(`FRAME_METADATA=${JSON.stringify(jsonValue)}`);
      } catch (e) {
        console.error('Error parsing JSON, keeping original line');
        fixedContent.push(line);
      }
    }
  } 
  // If we're in the middle of FRAME_METADATA, continue collecting
  else if (inFrameMetadata) {
    frameMetadataValue += line;
    
    // Check if this completes the JSON
    if (line.endsWith('"') || line.endsWith('"}')) {
      inFrameMetadata = false;
      try {
        // Test if it's valid JSON
        const jsonValue = JSON.parse(frameMetadataValue);
        fixedContent.push(`FRAME_METADATA=${JSON.stringify(jsonValue)}`);
      } catch (e) {
        console.error('Error parsing JSON, setting simplified value');
        // Create a minimal valid JSON object as fallback
        const fallbackMetadata = {
          accountAssociation: {
            header: "eyJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4MWJmRjZkNUU1OGJmMTY2MmEyNWQxRjJlMWYwYzVBMTkxRDExQzczZSIsImZpZCI6MTIzNDV9",
            payload: "eyJkb21haW4iOiJtaW5pLmJ0Yi5maW5hbmNlIn0",
            signature: "MHhhNmE4MGQ0ZTEyZWQ5NzkxOWRkODAxYjRjZGEwN2E1YWZjZDQ4ZjBiYjdlMGI5YjE3YTU4YjI2OTk5OTQ1ZGU1NWZmM2U1ZjE4YzBhZTRkNTg1ZGZiZTFhZDZkOWRkZmY5OTg5ZDViZWY0ZDFiNzI0MGM0NWRjZGNlZGI4NDhjMDFi"
          },
          frame: {
            version: "1",
            name: "btbfinance",
            iconUrl: "https://mini.btb.finance/icon.png",
            homeUrl: "https://mini.btb.finance",
            imageUrl: "https://mini.btb.finance/opengraph-image",
            buttonTitle: "Launch Frame",
            splashImageUrl: "https://mini.btb.finance/splash.png",
            splashBackgroundColor: "#f7f7f7",
            webhookUrl: "https://api.neynar.com/f/app/b8ef3593-7d21-4e7e-8e37-17adfec955d8/event"
          }
        };
        fixedContent.push(`FRAME_METADATA=${JSON.stringify(fallbackMetadata)}`);
      }
    }
  } 
  // Otherwise, just add the line
  else {
    fixedContent.push(line);
  }
}

// Write the fixed content back to .env
fs.writeFileSync(envFile, fixedContent.join('\n'));

console.log('Fixed .env file written successfully'); 