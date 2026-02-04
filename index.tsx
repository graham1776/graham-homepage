/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface Project {
    folderName: string;
    title: string;
    description: string;
    thumbnail?: string;
    entryPoint?: string;
}

interface BlogManifestEntry {
    fileName: string;
    title: string;
    date: string; // Expecting YYYY-MM-DD
    snippet: string;
}

/**
 * Applies inline Markdown formatting to a string.
 * Supports: bold, italic, links.
 * @param text The string to format.
 * @returns HTML string with inline formatting.
 */
function applyInlineMarkdown(text: string): string {
    let inlineHtml = text;
    // Links [text](url) - Must be first to avoid issues with * or _ in URLs/text
    inlineHtml = inlineHtml.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );
    // Bold (**text** or __text__)
    inlineHtml = inlineHtml.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    inlineHtml = inlineHtml.replace(/__(.*?)__/g, '<strong>$1</strong>');
    // Italics (*text* or _text_)
    inlineHtml = inlineHtml.replace(/\*(.*?)\*/g, '<em>$1</em>');
    inlineHtml = inlineHtml.replace(/_(.*?)_/g, '<em>$1</em>');
    return inlineHtml;
}

/**
 * Basic Markdown to HTML converter.
 * Supports: H1-H3, Paragraphs, Unordered Lists, Ordered Lists,
 * and inline formats (bold, italic, links via applyInlineMarkdown).
 * @param md Markdown string.
 * @returns HTML string.
 */
function markdownToHtml(md: string): string {
    const lines = md.split('\n');
    let html = '';
    let inList = false;
    let listType: 'ul' | 'ol' | null = null;
    let paragraphBuffer: string[] = [];

    function flushParagraph() {
        if (paragraphBuffer.length > 0) {
            // Join with space for lines broken mid-sentence in MD, then apply inline.
            html += `<p>${applyInlineMarkdown(paragraphBuffer.join(' ').trim())}</p>\n`;
            paragraphBuffer = [];
        }
    }

    function closeList() {
        if (inList) {
            // Ensure any text collected for a paragraph *before* closing list is flushed
            // This isn't typical for Markdown lists but handles edge cases if text lines are mixed.
            flushParagraph(); 
            html += (listType === 'ul' ? '</ul>\n' : '</ol>\n');
            inList = false;
            listType = null;
        }
    }

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Headings
        if (line.startsWith('# ')) { flushParagraph(); closeList(); html += `<h1>${applyInlineMarkdown(line.substring(2).trim())}</h1>\n`; continue; }
        if (line.startsWith('## ')) { flushParagraph(); closeList(); html += `<h2>${applyInlineMarkdown(line.substring(3).trim())}</h2>\n`; continue; }
        if (line.startsWith('### ')) { flushParagraph(); closeList(); html += `<h3>${applyInlineMarkdown(line.substring(4).trim())}</h3>\n`; continue; }

        // Unordered List Item (matches *, -, +)
        const ulMatch = line.match(/^(\*|-|\+) (.*)/);
        if (ulMatch) {
            flushParagraph();
            if (!inList || listType !== 'ul') {
                if (inList && listType === 'ol') { html += `</ol>\n`; } // Close previous OL
                html += '<ul>\n';
                inList = true;
                listType = 'ul';
            }
            html += `<li>${applyInlineMarkdown(ulMatch[2].trim())}</li>\n`;
            continue;
        }

        // Ordered List Item
        const olMatch = line.match(/^(\d+)\. (.*)/);
        if (olMatch) {
            flushParagraph();
            if (!inList || listType !== 'ol') {
                if (inList && listType === 'ul') { html += `</ul>\n`; } // Close previous UL
                html += '<ol>\n';
                inList = true;
                listType = 'ol';
            }
            html += `<li>${applyInlineMarkdown(olMatch[2].trim())}</li>\n`;
            continue;
        }
        
        // If we were in a list and current line is not a list item and not empty, it means the list ended.
        // A non-list item line signals the end of the current list.
        if (inList && line.trim() !== '' && !ulMatch && !olMatch) {
            closeList();
        }

        if (line.trim() === '') { // Blank line
            flushParagraph();
            closeList(); // Also close list if followed by blank line
        } else {
            paragraphBuffer.push(line); // Collect lines for a paragraph
        }
    }

    flushParagraph(); // Flush any remaining paragraph
    closeList(); // Close any list at the end of doc

    return html.trim();
}


/**
 * Loads Markdown content from a file, converts it to HTML, and injects it into a target element.
 * @param filePath Path to the Markdown file.
 * @param targetElementId ID of the DOM element to inject HTML into.
 * @param loadingMessageClass CSS class of the loading message element (optional).
 */
async function loadMarkdownContent(filePath: string, targetElementId: string, loadingMessageClass: string = 'loading-message') {
    const targetElement = document.getElementById(targetElementId);
    if (!targetElement) {
        // Target element doesn't exist on this page, so silently return.
        return;
    }

    const loadingElement = targetElement.querySelector(`.${loadingMessageClass}`);

    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for ${filePath}`);
        }
        const markdown = await response.text();
        const htmlContent = markdownToHtml(markdown);
        
        if (loadingElement) {
            loadingElement.remove();
        }
        targetElement.innerHTML = htmlContent;

    } catch (error) {
        console.error(`Failed to load Markdown content from '${filePath}':`, error);
        if (loadingElement) {
            loadingElement.remove();
        }
        targetElement.innerHTML = `<p class="error-message">Sorry, couldn't load content from ${filePath}.</p>`;
    }
}


async function loadProjects() {
    const projectGrid = document.querySelector('.project-grid');
    const loadingMessageElement = projectGrid?.querySelector('.loading-message');
    const projectsSubmenu = document.getElementById('projects-submenu');

    // If neither the grid (for projects.html) nor the submenu (for all pages) exists, do nothing.
    // This check is a bit redundant given the sidebar is on all pages, but good for robustness.
    if (!projectGrid && !projectsSubmenu) {
        // console.log('Neither project grid nor submenu found. Skipping project loading.');
        return;
    }
    
    if (projectsSubmenu) {
        projectsSubmenu.innerHTML = ''; // Clear existing submenu items before loading
    }

    try {
        const response = await fetch('content/projects/manifest.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} loading project manifest`);
        }
        const projects: Project[] = await response.json();

        if (projectGrid && loadingMessageElement) { // Only remove loading message if projectGrid exists
            loadingMessageElement.remove();
        }


        if (projects.length === 0) {
            if (projectGrid) { // Only update projectGrid if it exists
                projectGrid.innerHTML = '<p>No projects found yet. Stay tuned!</p>';
            }
            // Still populate submenu even if no projects, maybe with a "No projects" message or empty
             if (projectsSubmenu) {
                 const listItem = document.createElement('li');
                 listItem.textContent = 'No projects yet.';
                 listItem.style.fontStyle = 'italic';
                 listItem.style.color = '#777';
                 projectsSubmenu.appendChild(listItem);
             }
            return;
        }

        projects.forEach(project => {
            const projectUrl = `content/projects/${project.folderName}/${project.entryPoint || 'index.html'}`;

            // Populate project grid in the main content (only if projectGrid exists on the page)
            if (projectGrid) {
                const card = document.createElement('article');
                card.className = 'project-card';

                let thumbnailHtml = '';
                if (project.thumbnail) {
                    const thumbnailUrl = `content/projects/${project.folderName}/${project.thumbnail}`;
                    thumbnailHtml = `<img src="${thumbnailUrl}" alt="${project.title} thumbnail" class="project-thumbnail">`;
                }

                card.innerHTML = `
                    ${thumbnailHtml}
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <a href="${projectUrl}" class="btn-view-project" aria-label="View project: ${project.title}" target="_blank" rel="noopener noreferrer">View Project</a>
                `;
                projectGrid.appendChild(card);
            }

            // Populate projects submenu in the sidebar (if projectsSubmenu exists)
            if (projectsSubmenu) {
                const listItem = document.createElement('li');
                const link = document.createElement('a');
                link.href = projectUrl;
                link.textContent = project.title;
                link.target = '_blank'; // Open project in new tab
                link.rel = 'noopener noreferrer';
                listItem.appendChild(link);
                projectsSubmenu.appendChild(listItem);
            }
        });

    } catch (error) {
        console.error('Failed to load projects:', error);
         if (projectGrid && loadingMessageElement) {
            loadingMessageElement.remove();
        }
        if (projectGrid) { // Only update projectGrid if it exists
            projectGrid.innerHTML = '<p class="error-message">Sorry, there was an issue loading projects. Please try again later.</p>';
        }
         if (projectsSubmenu) { // Update submenu with error message too
            const listItem = document.createElement('li');
            listItem.textContent = 'Error loading projects.';
            listItem.style.color = '#d9534f';
            projectsSubmenu.appendChild(listItem);
        }
    }
}

function setupProjectsToggle() {
    const toggleButton = document.getElementById('projects-toggle-btn');
    const submenu = document.getElementById('projects-submenu');
    const expanderIcon = toggleButton?.querySelector('.expander-icon');

    if (!toggleButton || !submenu || !expanderIcon) {
        // Sidebar elements not found, likely not an issue if on a page without sidebar
        return;
    }

    toggleButton.addEventListener('click', () => {
        const isExpanded = toggleButton.getAttribute('aria-expanded') === 'true';
        toggleButton.setAttribute('aria-expanded', String(!isExpanded));
        submenu.hidden = isExpanded; // Toggle hidden attribute
        expanderIcon.textContent = isExpanded ? '▼' : '▲';
    });
}


async function loadBlogSummaries() {
    const container = document.getElementById('blog-posts-container');
    if (!container) {
        // Blog container doesn't exist on this page, so silently return.
        return;
    }

    const loadingElement = container.querySelector('.loading-message');

    try {
        const response = await fetch('content/blog/manifest.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for blog manifest`);
        }
        const posts: BlogManifestEntry[] = await response.json();

        if (loadingElement) {
            loadingElement.remove();
        }

        if (posts.length === 0) {
            container.innerHTML = '<p>No blog posts yet. Check back soon!</p>';
            return;
        }
        
        // Sort posts by date, newest first
        posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


        posts.forEach(post => {
            const postElement = document.createElement('article');
            postElement.className = 'blog-post-summary';

            const postDate = new Date(post.date);
            const formattedDate = postDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC' // Ensure consistent date interpretation
            });

            // For now, "Read More" links to #. Later, this would link to a full post page.
            const postLink = '#'; // Placeholder until full blog post viewing is implemented


            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <p class="post-meta">Published on <time datetime="${post.date}">${formattedDate}</time></p>
                <p>${post.snippet}</p>
                <a href="${postLink}" class="btn-read-more" aria-label="Read more about ${post.title}">Read More</a>
            `;
            container.appendChild(postElement);
        });

    } catch (error) {
        console.error('Failed to load blog summaries:', error);
        if (loadingElement) {
            loadingElement.remove();
        }
        container.innerHTML = '<p class="error-message">Sorry, there was an issue loading blog posts.</p>';
    }
}

interface ArtPiece {
    fileName: string;
    title: string;
    description: string;
}

async function loadArtPieces() {
    const artGrid = document.querySelector('.art-grid');
    if (!artGrid) {
        return;
    }

    const loadingElement = artGrid.querySelector('.loading-message');

    try {
        const response = await fetch('content/art/manifest.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for art manifest`);
        }
        const artPieces: ArtPiece[] = await response.json();

        if (loadingElement) {
            loadingElement.remove();
        }

        // Clear existing placeholder content
        artGrid.innerHTML = '';

        if (artPieces.length === 0) {
            artGrid.innerHTML = '<p>No art pieces yet. Drop some .js files in the content/art folder!</p>';
            return;
        }

        artPieces.forEach(piece => {
            const artItem = document.createElement('article');
            artItem.className = 'art-item';

            const canvasId = `canvas-${piece.fileName.replace('.js', '')}`;
            
            artItem.innerHTML = `
                <h3>${piece.title}</h3>
                <p>${piece.description}</p>
                <canvas id="${canvasId}" width="300" height="200" style="border: 1px solid #ddd; cursor: pointer;"></canvas>
                <button class="btn-expand-art" data-filename="${piece.fileName}" data-canvas-id="${canvasId}">View Full Size</button>
            `;
            
            artGrid.appendChild(artItem);

            // Load and execute the art script
            loadArtScript(piece.fileName, canvasId);
        });

        // Add click handlers for full-size viewing
        artGrid.addEventListener('click', handleArtClick);

    } catch (error) {
        console.error('Failed to load art pieces:', error);
        if (loadingElement) {
            loadingElement.remove();
        }
        artGrid.innerHTML = '<p class="error-message">Sorry, there was an issue loading art pieces.</p>';
    }
}

// Use Vite's glob import to bundle all art modules at build time
const artModules = import.meta.glob('./public/content/art/*.js');

async function loadArtScript(fileName: string, canvasId: string) {
    try {
        const modulePath = `./public/content/art/${fileName}`;
        const moduleLoader = artModules[modulePath];

        if (!moduleLoader) {
            throw new Error(`Art module not found: ${fileName}`);
        }

        const module = await moduleLoader() as { render?: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void };
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        const ctx = canvas.getContext('2d');

        if (canvas && ctx && module.render) {
            module.render(canvas, ctx);
        }
    } catch (error) {
        console.error(`Failed to load art script ${fileName}:`, error);
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#f0f0f0';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = '#999';
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Error loading art', canvas.width / 2, canvas.height / 2);
            }
        }
    }
}

function handleArtClick(event: Event) {
    const target = event.target as HTMLElement;
    if (target.classList.contains('btn-expand-art')) {
        const fileName = target.getAttribute('data-filename');
        const canvasId = target.getAttribute('data-canvas-id');
        if (fileName && canvasId) {
            openArtModal(fileName, canvasId);
        }
    }
}

function openArtModal(fileName: string, originalCanvasId: string) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'art-modal';
    modal.innerHTML = `
        <div class="art-modal-content">
            <div class="art-modal-controls">
                <button class="art-modal-close">&times;</button>
                <button class="art-regenerate-btn">Regenerate</button>
            </div>
            <canvas id="modal-${originalCanvasId}" width="800" height="600"></canvas>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Load art in modal canvas
    const modalCanvasId = `modal-${originalCanvasId}`;
    loadArtScript(fileName, modalCanvasId);
    
    // Close modal handlers
    const closeBtn = modal.querySelector('.art-modal-close');
    closeBtn?.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Regenerate button handler
    const regenerateBtn = modal.querySelector('.art-regenerate-btn');
    regenerateBtn?.addEventListener('click', () => {
        const canvas = document.getElementById(modalCanvasId) as HTMLCanvasElement;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Clear the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Reload the art script for a new iteration
                loadArtScript(fileName, modalCanvasId);
            }
        }
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}


document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear().toString();
    }

    // Functions that should run on all pages because their elements (sidebar, footer) are on all pages
    // or they have internal checks for page-specific elements.
    loadProjects(); // Populates sidebar submenu always, and .project-grid if on projects.html
    setupProjectsToggle(); // For the sidebar project expander

    // Page-specific content loading based on element existence
    if (document.getElementById('about-content')) {
        loadMarkdownContent('content/about.md', 'about-content');
    }

    if (document.getElementById('blog-posts-container')) {
        loadBlogSummaries();
    }

    if (document.querySelector('.art-grid')) {
        loadArtPieces();
    }
    
    // Example for if 'Now' page were to load from markdown dynamically:
    // if (document.getElementById('now-content-dynamic')) { // Assume <div id="now-content-dynamic"> on now.html
    //    loadMarkdownContent('content/now.md', 'now-content-dynamic');
    // }

    console.log("Personal website script loaded and initialized on:", window.location.pathname);
});