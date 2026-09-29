import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

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
              } catch (e: any) {
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
        } catch (e: any) {
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
            } catch (e: any) {
              console.warn(`Could not parse metadata from ${fileName}:`, e.message);
            }

            artPieces.push(artConfig);
          }

          // Write the generated art manifest
          const artManifestPath = path.join(artDir, 'manifest.json');
          try {
            fs.writeFileSync(artManifestPath, JSON.stringify(artPieces, null, 2));
            console.log(`Generated art manifest with ${artPieces.length} pieces`);
          } catch (e: any) {
            console.warn('Could not write art manifest.json:', e.message);
          }
        } catch (e: any) {
          console.warn('Could not scan art directory:', e.message);
        }
      }
    }
  };
}

// Clean URLs for blog posts and projects, as real files: after the build, copy the built post.html to
// dist/blog/<slug>/index.html for every post, and the built project.html to dist/projects/<folder>/<page>
// for every page of every project. Any static host serves these; no server rewrites are needed.
// In `npm run dev` there is no dist/, so a small middleware does the same mapping on the fly.
function cleanUrlPages() {
  const toProjectShell = (url: string) => url.startsWith('/projects/');
  const toPostPage = (url: string) => /^\/blog\/[^/?#]+\/?(\?.*)?$/.test(url);

  return {
    name: 'clean-url-pages',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: () => void) => {
        const url: string = req.url || '';
        // Mirrors the vercel.json redirect: a raw project URL opened as a page goes to the shell.
        if (url.startsWith('/content/projects/') && req.headers['sec-fetch-dest'] === 'document') {
          res.statusCode = 307;
          res.setHeader('Location', url.replace(/^\/content/, ''));
          res.end();
          return;
        }
        if (toPostPage(url)) req.url = '/post.html';
        else if (toProjectShell(url)) req.url = '/project.html';
        next();
      });
    },
    writeBundle(options: { dir?: string }) {
      const outDir = options.dir || path.resolve(__dirname, 'dist');
      const postHtml = fs.readFileSync(path.join(outDir, 'post.html'), 'utf-8');
      const projectHtml = fs.readFileSync(path.join(outDir, 'project.html'), 'utf-8');
      const writePage = (relPath: string, html: string) => {
        const target = path.join(outDir, relPath);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, html);
      };

      const blogManifest = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'public/content/blog/manifest.json'), 'utf-8'));
      for (const post of blogManifest) {
        const slug = post.fileName.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
        writePage(path.join('blog', slug, 'index.html'), postHtml);
      }

      const projectsDir = path.resolve(__dirname, 'public/content/projects');
      const htmlFilesIn = (dir: string): string[] => fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
        entry.isDirectory() ? htmlFilesIn(path.join(dir, entry.name)).map(f => path.join(entry.name, f))
          : entry.name.endsWith('.html') ? [entry.name] : []);
      let shellCount = 0;
      for (const folder of fs.readdirSync(projectsDir, { withFileTypes: true }).filter(d => d.isDirectory())) {
        // index.html always, so /projects/<folder>/ resolves even when the entry point is app.html/main.html
        const pages = new Set(['index.html', ...htmlFilesIn(path.join(projectsDir, folder.name))]);
        for (const page of pages) {
          writePage(path.join('projects', folder.name, page), projectHtml);
          shellCount++;
        }
      }
      console.log(`Wrote ${blogManifest.length} blog post pages and ${shellCount} project shell pages`);
    },
  };
}

export default defineConfig(() => {
    return {
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      plugins: [generateManifests(), cleanUrlPages()],
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
            post: path.resolve(__dirname, 'post.html'),
            project: path.resolve(__dirname, 'project.html'),
            projects: path.resolve(__dirname, 'projects.html'),
            resume: path.resolve(__dirname, 'resume.html'),
          }
        }
      }
    };
});