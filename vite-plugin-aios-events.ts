// Vite Plugin - AIOS Events Server
// Serves events from .aios-events/events.jsonl to the Virtual Office
import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

interface AIOSEventsPluginOptions {
  eventsDir?: string;
  eventsFile?: string;
  commandsFile?: string;
}

export function aiosEventsPlugin(options: AIOSEventsPluginOptions = {}): Plugin {
  const {
    eventsDir = '.aios-events',
    eventsFile = 'events.jsonl',
    commandsFile = 'commands.jsonl'
  } = options;

  const eventsPath = path.resolve(process.cwd(), eventsDir, eventsFile);
  const commandsPath = path.resolve(process.cwd(), eventsDir, commandsFile);
  const eventsDirPath = path.resolve(process.cwd(), eventsDir);

  // Ensure events directory exists
  const ensureEventsDir = () => {
    if (!fs.existsSync(eventsDirPath)) {
      fs.mkdirSync(eventsDirPath, { recursive: true });
    }
  };

  return {
    name: 'aios-events',

    configureServer(server) {
      // Serve events endpoint
      server.middlewares.use('/api/aios-events', (req, res) => {
        if (req.method !== 'GET') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        try {
          const url = new URL(req.url || '', `http://${req.headers.host}`);
          const since = parseInt(url.searchParams.get('since') || '0', 10);

          if (!fs.existsSync(eventsPath)) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end('[]');
            return;
          }

          const content = fs.readFileSync(eventsPath, 'utf-8');
          const events = content
            .split('\n')
            .filter(Boolean)
            .map((line) => {
              try {
                return JSON.parse(line);
              } catch {
                return null;
              }
            })
            .filter((event) => event && event.timestamp > since);

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(events));
        } catch (error) {
          console.error('[aios-events] Error reading events:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Failed to read events' }));
        }
      });

      // Receive commands endpoint
      server.middlewares.use('/api/aios-commands', (req, res) => {
        if (req.method === 'OPTIONS') {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk.toString();
        });

        req.on('end', () => {
          try {
            ensureEventsDir();
            const command = JSON.parse(body);

            // Append command to file
            fs.appendFileSync(commandsPath, JSON.stringify(command) + '\n');

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({ success: true, timestamp: Date.now() }));
          } catch (error) {
            console.error('[aios-events] Error writing command:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Failed to write command' }));
          }
        });
      });

      // Status endpoint
      server.middlewares.use('/api/aios-status', (_req, res) => {
        const status = {
          connected: fs.existsSync(eventsPath),
          eventsFile: eventsPath,
          commandsFile: commandsPath,
          lastModified: fs.existsSync(eventsPath)
            ? fs.statSync(eventsPath).mtime.toISOString()
            : null
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify(status));
      });

      console.log('[aios-events] Plugin initialized');
      console.log(`[aios-events] Events file: ${eventsPath}`);
      console.log(`[aios-events] Commands file: ${commandsPath}`);
    }
  };
}

export default aiosEventsPlugin;
