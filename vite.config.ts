import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';

function generateManifests() {
  return {
    name: 'generate-manifests',
    buildStart() {
      // Generate projects manifest
      const projectsDir = path.resolve(__dirname, 'public/content/projects');
      const projects = [];

      if (fs.existsSync(projectsDir)) {
        try {
          const folders = fs.readdirSync(projectsDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name);

          for (const folderName of folders) {
            const folderPath = path.join(projectsDir, folderName);
            let projectConfig = {
              folderName,
              title: folderName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              description: `Project: ${folderName}`,
              entryPoint: 'index.html'
            };

            // Check for project.json config file
            const configPath = path.join(folderPath, 'project.json');
            if (fs.existsSync(configPath)) {
              try {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
                projectConfig = { ...projectConfig, ...config, folderName };
              } catch (e) {
                console.warn(`Invalid project.json in ${folderName}:`, e.message);
              }
            }

            // Check for common entry points
            const entryPoints = ['index.html', 'app.html', 'main.html'];
            for (const entry of entryPoints) {
              if (fs.existsSync(path.join(folderPath, entry))) {
                projectConfig.entryPoint = entry;
                break;
              }
            }

            projects.push(projectConfig);
          }

          // Write the generated manifest
          const manifestPath = path.join(projectsDir, 'manifest.json');
          try {
            fs.writeFileSync(manifestPath, JSON.stringify(projects, null, 2));
            console.log(`Generated projects manifest with ${projects.length} projects`);
          } catch (e) {
            console.warn('Could not write projects manifest.json (permission denied). Using existing manifest.');
          }
        } catch (e) {
          console.warn('Could not scan projects directory:', e.message);
        }
      }

      // Generate art manifest
      const artDir = path.resolve(__dirname, 'public/content/art');
      const artPieces = [];

      if (fs.existsSync(artDir)) {
        try {
          const files = fs.readdirSync(artDir, { withFileTypes: true })
            .filter(dirent => dirent.isFile() && dirent.name.endsWith('.js'))
            .map(dirent => dirent.name);

          for (const fileName of files) {
            const filePath = path.join(artDir, fileName);
            const baseName = fileName.replace('.js', '');
            
            let artConfig = {
              fileName,
              title: baseName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              description: `Generative art: ${baseName}`
            };

            // Try to extract metadata from the JS file
            try {
              const content = fs.readFileSync(filePath, 'utf-8');
              const metadataMatch = content.match(/export\s+const\s+metadata\s*=\s*({[^}]+})/);
              if (metadataMatch) {
                const metadataStr = metadataMatch[1];
                // Simple regex-based parsing for basic metadata
                const titleMatch = metadataStr.match(/title\s*:\s*["']([^"']+)["']/);
                const descMatch = metadataStr.match(/description\s*:\s*["']([^"']+)["']/);
                if (titleMatch) artConfig.title = titleMatch[1];
                if (descMatch) artConfig.description = descMatch[1];
              }
            } catch (e) {
              console.warn(`Could not parse metadata from ${fileName}:`, e.message);
            }

            artPieces.push(artConfig);
          }

          // Write the generated art manifest
          const artManifestPath = path.join(artDir, 'manifest.json');
          try {
            fs.writeFileSync(artManifestPath, JSON.stringify(artPieces, null, 2));
            console.log(`Generated art manifest with ${artPieces.length} pieces`);
          } catch (e) {
            console.warn('Could not write art manifest.json:', e.message);
          }
        } catch (e) {
          console.warn('Could not scan art directory:', e.message);
        }
      }
    }
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      plugins: [generateManifests()],
      build: {
        rollupOptions: {
          input: {
            main: path.resolve(__dirname, 'index.html'),
            art: path.resolve(__dirname, 'art.html'),
            blog: path.resolve(__dirname, 'blog.html'),
            businessIdeas: path.resolve(__dirname, 'business-ideas.html'),
            contact: path.resolve(__dirname, 'contact.html'),
            links: path.resolve(__dirname, 'links.html'),
            now: path.resolve(__dirname, 'now.html'),
            projects: path.resolve(__dirname, 'projects.html'),
            resume: path.resolve(__dirname, 'resume.html'),
          }
        }
      }
    };
});