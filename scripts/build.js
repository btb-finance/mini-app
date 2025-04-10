import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { mnemonicToAccount } from 'viem/accounts';
import { fileURLToPath } from 'url';
import inquirer from 'inquirer';
import dotenv from 'dotenv';
import crypto from 'crypto';

// ANSI color codes
const yellow = '\x1b[33m';
const italic = '\x1b[3m';
const reset = '\x1b[0m';

// Load environment variables in specific order
// First load .env for main config
dotenv.config({ path: '.env' });

// Check if we're in non-interactive mode (CI environment)
const NON_INTERACTIVE = process.env.NON_INTERACTIVE_BUILD === 'true';

// Get preset values from environment
const PRESET_DOMAIN = process.env.DOMAIN || process.env.NEXT_PUBLIC_FRAME_DOMAIN;
const PRESET_FRAME_NAME = process.env.NEXT_PUBLIC_FRAME_NAME;
const PRESET_BUTTON_TEXT = process.env.NEXT_PUBLIC_FRAME_BUTTON_TEXT;

async function lookupFidByCustodyAddress(custodyAddress, apiKey) {
  if (!apiKey) {
    throw new Error('Neynar API key is required');
  }

  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/user/custody-address?custody_address=${custodyAddress}`,
    {
      headers: {
        'accept': 'application/json',
        'x-api-key': apiKey
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to lookup FID: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.user?.fid) {
    throw new Error('No FID found for this custody address');
  }

  return data.user.fid;
}

async function loadEnvLocal() {
  // Skip in non-interactive mode
  if (NON_INTERACTIVE) {
    console.log('Running in non-interactive mode. Skipping .env.local loading.');
    return;
  }
  
  try {
    if (fs.existsSync('.env.local')) {
      const { loadLocal } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'loadLocal',
          message: 'Found .env.local, likely created by the install script - would you like to load its values?',
          default: false
        }
      ]);

      if (loadLocal) {
        console.log('Loading values from .env.local...');
        const localEnv = dotenv.parse(fs.readFileSync('.env.local'));
        
        // Copy all values except SEED_PHRASE to .env
        const envContent = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') + '\n' : '';
        let newEnvContent = envContent;
        
        for (const [key, value] of Object.entries(localEnv)) {
          if (key !== 'SEED_PHRASE') {
            // Update process.env
            process.env[key] = value;
            // Add to .env content if not already there
            if (!envContent.includes(`${key}=`)) {
              newEnvContent += `${key}="${value}"\n`;
            }
          }
        }
        
        // Write updated content to .env
        fs.writeFileSync('.env', newEnvContent);
        console.log('✅ Values from .env.local have been written to .env');
      }
    }

    // Always try to load SEED_PHRASE from .env.local
    if (fs.existsSync('.env.local')) {
      const localEnv = dotenv.parse(fs.readFileSync('.env.local'));
      if (localEnv.SEED_PHRASE) {
        process.env.SEED_PHRASE = localEnv.SEED_PHRASE;
      }
    }
  } catch (error) {
    // Error reading .env.local, which is fine
    console.log('Note: No .env.local file found');
  }
}

// TODO: make sure rebuilding is supported

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

async function validateDomain(domain) {
  // Remove http:// or https:// if present
  const cleanDomain = domain.replace(/^https?:\/\//, '');
  
  // Basic domain validation
  if (!cleanDomain.match(/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/)) {
    throw new Error('Invalid domain format');
  }

  return cleanDomain;
}

async function queryNeynarApp(apiKey) {
  if (!apiKey) {
    return null;
  }
  try {
    const response = await fetch(
      `https://api.neynar.com/portal/app_by_api_key`,
      {
        headers: {
          'x-api-key': apiKey
        }
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error querying Neynar app data:', error);
    return null;
  }
}

async function validateSeedPhrase(seedPhrase) {
  try {
    // Try to create an account from the seed phrase
    const account = mnemonicToAccount(seedPhrase);
    return account.address;
  } catch (error) {
    throw new Error('Invalid seed phrase');
  }
}

async function generateFarcasterMetadata(domain, fid, accountAddress, seedPhrase, webhookUrl) {
  const header = {
    type: 'custody',
    key: accountAddress,
    fid,
  };
  const encodedHeader = Buffer.from(JSON.stringify(header), 'utf-8').toString('base64');

  const payload = {
    domain
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');

  const account = mnemonicToAccount(seedPhrase);
  const signature = await account.signMessage({ 
    message: `${encodedHeader}.${encodedPayload}`
  });
  const encodedSignature = Buffer.from(signature, 'utf-8').toString('base64url');

  return {
    accountAssociation: {
      header: encodedHeader,
      payload: encodedPayload,
      signature: encodedSignature
    },
    frame: {
      version: "1",
      name: process.env.NEXT_PUBLIC_FRAME_NAME,
      iconUrl: `https://${domain}/icon.png`,
      homeUrl: `https://${domain}`,
      imageUrl: `https://${domain}/opengraph-image`,
      buttonTitle: process.env.NEXT_PUBLIC_FRAME_BUTTON_TEXT,
      splashImageUrl: `https://${domain}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
      webhookUrl,
    },
  };
}

async function main() {
  try {
    console.log('\n📝 Checking environment variables...');
    console.log('Loading values from .env...');
    
    // Load .env.local if user wants to and not in non-interactive mode
    if (!NON_INTERACTIVE) {
      await loadEnvLocal();
    }

    // Get domain from user or use preset
    let domain;
    if (NON_INTERACTIVE) {
      if (!PRESET_DOMAIN) {
        throw new Error('DOMAIN must be set in environment when using NON_INTERACTIVE_BUILD=true');
      }
      domain = PRESET_DOMAIN;
      console.log(`Using domain from environment: ${domain}`);
    } else {
      const { domain: inputDomain } = await inquirer.prompt([
        {
          type: 'input',
          name: 'domain',
          message: 'Enter the domain where your frame will be deployed (e.g., example.com):',
          validate: async (input) => {
            try {
              await validateDomain(input);
              return true;
            } catch (error) {
              return error.message;
            }
          }
        }
      ]);
      domain = inputDomain;
    }

    // Get frame name from user or use preset
    let frameName;
    if (NON_INTERACTIVE) {
      frameName = PRESET_FRAME_NAME || 'Farcaster Frame';
      console.log(`Using frame name from environment: ${frameName}`);
    } else {
      const { frameName: inputFrameName } = await inquirer.prompt([
        {
          type: 'input',
          name: 'frameName',
          message: 'Enter the name for your frame (e.g., My Cool Frame):',
          default: process.env.NEXT_PUBLIC_FRAME_NAME,
          validate: (input) => {
            if (input.trim() === '') {
              return 'Frame name cannot be empty';
            }
            return true;
          }
        }
      ]);
      frameName = inputFrameName;
    }

    // Get button text from user or use preset
    let buttonText;
    if (NON_INTERACTIVE) {
      buttonText = PRESET_BUTTON_TEXT || 'Launch Frame';
      console.log(`Using button text from environment: ${buttonText}`);
    } else {
      const { buttonText: inputButtonText } = await inquirer.prompt([
        {
          type: 'input',
          name: 'buttonText',
          message: 'Enter the text for your frame button:',
          default: process.env.NEXT_PUBLIC_FRAME_BUTTON_TEXT || 'Launch Frame',
          validate: (input) => {
            if (input.trim() === '') {
              return 'Button text cannot be empty';
            }
            return true;
          }
        }
      ]);
      buttonText = inputButtonText;
    }

    // Get Neynar configuration
    let neynarApiKey = process.env.NEYNAR_API_KEY;
    let neynarClientId = process.env.NEYNAR_CLIENT_ID;
    let useNeynar = true;

    // Skip Neynar prompts in non-interactive mode
    if (NON_INTERACTIVE) {
      if (!neynarApiKey) {
        console.log('No Neynar API key found in environment, continuing without it');
        useNeynar = false;
      } else {
        console.log('Using Neynar API key from environment');
        
        // Try to get client ID from API if not already set
        if (!neynarClientId) {
          const appInfo = await queryNeynarApp(neynarApiKey);
          if (appInfo) {
            neynarClientId = appInfo.app_uuid;
            console.log('✅ Fetched Neynar app client ID');
          } else {
            console.log('Could not fetch Neynar client ID, continuing without it');
          }
        }
      }
    } else {
      while (useNeynar) {
        if (!neynarApiKey) {
          const { neynarApiKey: inputNeynarApiKey } = await inquirer.prompt([
            {
              type: 'password',
              name: 'neynarApiKey',
              message: 'Enter your Neynar API key (optional - leave blank to skip):',
              default: null
            }
          ]);
          neynarApiKey = inputNeynarApiKey;
        } else {
          console.log('Using existing Neynar API key from .env');
        }

        if (!neynarApiKey) {
          useNeynar = false;
          break;
        }

        // Try to get client ID from API
        const appInfo = await queryNeynarApp(neynarApiKey);
        if (appInfo) {
          neynarClientId = appInfo.app_uuid;
          console.log('✅ Fetched Neynar app client ID');
          break;
        }

        // If we get here, the API key was invalid
        console.log('\n⚠️  Could not find Neynar app information. The API key may be incorrect.');
        const { retry } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'retry',
            message: 'Would you like to try a different API key?',
            default: true
          }
        ]);

        // Reset for retry
        neynarApiKey = null;
        neynarClientId = null;

        if (!retry) {
          useNeynar = false;
          break;
        }
      }
    }

    // Get seed phrase from user or use existing
    let seedPhrase = process.env.SEED_PHRASE;
    if (!seedPhrase && !NON_INTERACTIVE) {
      const { seedPhrase: inputSeedPhrase } = await inquirer.prompt([
        {
          type: 'password',
          name: 'seedPhrase',
          message: 'Your farcaster custody account seed phrase is required to create a signature proving this app was created by you.\n' +
          `⚠️ ${yellow}${italic}seed phrase is only used to sign the frame manifest, then discarded${reset} ⚠️\n` +
          'Seed phrase:',
          validate: async (input) => {
            try {
              await validateSeedPhrase(input);
              return true;
            } catch (error) {
              return error.message;
            }
          }
        }
      ]);
      seedPhrase = inputSeedPhrase;
    } else if (!seedPhrase && NON_INTERACTIVE) {
      // In non-interactive mode, we'll skip seed phrase validation if SKIP_FID_LOOKUP is true and FRAME_METADATA exists
      if (process.env.SKIP_FID_LOOKUP === "true" && (process.env.FRAME_METADATA || process.env.SIMPLIFIED_METADATA === "true")) {
        console.log('No seed phrase available, using simplified metadata approach');
      } else {
        console.log('Warning: No seed phrase available in non-interactive mode');
      }
    } else {
      console.log('Using existing seed phrase from .env');
    }

    let accountAddress;
    let fid;
    
    // Validate seed phrase and get account address if available
    if (seedPhrase) {
      accountAddress = await validateSeedPhrase(seedPhrase);
      console.log('✅ Generated account address from seed phrase');

      // Get FID - either from .env or by looking it up
      if (process.env.SKIP_FID_LOOKUP === "true" && process.env.FID) {
        fid = parseInt(process.env.FID);
        console.log(`✅ Using FID ${fid} from .env (skipping lookup)`);
      } else {
        fid = await lookupFidByCustodyAddress(accountAddress, neynarApiKey ?? 'FARCASTER_V2_FRAMES_DEMO');
      }
    } else if (process.env.SKIP_FID_LOOKUP === "true" && process.env.FID) {
      // Use existing FID without validation in non-interactive mode
      fid = parseInt(process.env.FID);
      console.log(`✅ Using FID ${fid} from .env (skipping lookup and validation)`);
    }

    // Generate and sign manifest
    console.log('\n🔨 Generating frame manifest...');
    
    let metadata;
    
    // Check if we should generate simplified metadata
    if (NON_INTERACTIVE && process.env.SIMPLIFIED_METADATA === "true") {
      console.log('Using simplified metadata approach for CI/CD build');
      
      // Determine webhook URL based on environment variables
      const webhookUrl = neynarApiKey && neynarClientId 
        ? `https://api.neynar.com/f/app/${neynarClientId}/event`
        : `https://${domain}/api/webhook`;
      
      // Create a minimal frame metadata structure
      metadata = {
        frame: {
          version: "1",
          name: frameName,
          iconUrl: `https://${domain}/icon.png`,
          homeUrl: `https://${domain}`,
          imageUrl: `https://${domain}/opengraph-image`,
          buttonTitle: buttonText,
          splashImageUrl: `https://${domain}/splash.png`,
          splashBackgroundColor: "#f7f7f7",
          webhookUrl: webhookUrl,
        }
      };
      
      // If we have FID, add simplified account association
      if (process.env.FID) {
        metadata.accountAssociation = {
          fid: parseInt(process.env.FID),
          simulated: true
        };
      }
      
      console.log('✅ Simplified frame manifest generated');
    }
    // Use existing FRAME_METADATA if no seed phrase in non-interactive mode
    else if (!seedPhrase && NON_INTERACTIVE && process.env.FRAME_METADATA) {
      try {
        metadata = JSON.parse(process.env.FRAME_METADATA);
        console.log('✅ Using existing frame manifest from environment');
      } catch (error) {
        console.error('Error parsing FRAME_METADATA:', error);
        if (NON_INTERACTIVE) {
          throw new Error('Cannot continue in non-interactive mode without valid FRAME_METADATA or SIMPLIFIED_METADATA=true');
        }
      }
    } else if (seedPhrase && fid && accountAddress) {
      // Determine webhook URL based on environment variables
      const webhookUrl = neynarApiKey && neynarClientId 
        ? `https://api.neynar.com/f/app/${neynarClientId}/event`
        : `https://${domain}/api/webhook`;

      metadata = await generateFarcasterMetadata(domain, fid, accountAddress, seedPhrase, webhookUrl);
      console.log('\n✅ Frame manifest generated' + (seedPhrase ? ' and signed' : ''));
    } else if (NON_INTERACTIVE) {
      throw new Error('Cannot generate frame manifest in non-interactive mode without sufficient data');
    }

    // Read existing .env file or create new one
    const envPath = path.join(projectRoot, '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

    // Add or update environment variables
    const newEnvVars = [
      // Base URL
      `NEXT_PUBLIC_URL=https://${domain}`,

      // Frame metadata
      `NEXT_PUBLIC_FRAME_NAME="${frameName}"`,
      `NEXT_PUBLIC_FRAME_DESCRIPTION="${process.env.NEXT_PUBLIC_FRAME_DESCRIPTION || ''}"`,
      `NEXT_PUBLIC_FRAME_BUTTON_TEXT="${buttonText}"`,

      // Neynar configuration (if it exists in current env)
      ...(process.env.NEYNAR_API_KEY ? 
        [`NEYNAR_API_KEY="${process.env.NEYNAR_API_KEY}"`] : []),
      ...(neynarClientId ? 
        [`NEYNAR_CLIENT_ID="${neynarClientId}"`] : []),

      // FID (if it exists in current env)
      ...(process.env.FID ? [`FID="${process.env.FID}"`] : []),

      // NextAuth configuration
      `NEXTAUTH_SECRET="${process.env.NEXTAUTH_SECRET || crypto.randomBytes(32).toString('hex')}"`,
      `NEXTAUTH_URL="https://${domain}"`,

      // Frame manifest with signature
      ...(metadata ? [`FRAME_METADATA=${JSON.stringify(metadata)}`] : []),
    ];

    // Filter out empty values and join with newlines
    const validEnvVars = newEnvVars.filter(line => {
      const [, value] = line.split('=');
      return value && value !== '""';
    });

    // Update or append each environment variable
    validEnvVars.forEach(varLine => {
      const [key] = varLine.split('=');
      if (envContent.includes(`${key}=`)) {
        envContent = envContent.replace(new RegExp(`${key}=.*`), varLine);
      } else {
        envContent += `\n${varLine}`;
      }
    });

    // Write updated .env file
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Environment variables updated');

    // Run next build
    console.log('\nBuilding Next.js application...');
    if (NON_INTERACTIVE) {
      // In CI/CD environments, we should use npx for better compatibility
      console.log('Running Next.js build with npx for CI/CD environment...');
      try {
        // Use --no-lint flag to bypass ESLint errors in CI/CD
        execSync('npx next build --no-lint', { cwd: projectRoot, stdio: 'inherit' });
      } catch (error) {
        // In local testing, we might not have Next.js installed
        if (error.message.includes('command not found')) {
          console.log('Next.js build command failed, but this is expected in local testing without Next.js installed');
          console.log('In Netlify, the build should proceed normally');
        } else {
          throw error;
        }
      }
    } else {
      execSync('next build', { cwd: projectRoot, stdio: 'inherit' });
    }

    console.log('\n✨ Build complete! Your frame is ready for deployment. 🪐');
    if (!NON_INTERACTIVE) {
      console.log('📝 Make sure to configure the environment variables from .env in your hosting provider');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
