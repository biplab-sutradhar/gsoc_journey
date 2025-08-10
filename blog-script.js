// blog-script.js - Dedicated script for blog.html
document.addEventListener('DOMContentLoaded', function() {
    const blogContainer = document.querySelector('.blog-container');
    
    // Get data file from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const dataFile = urlParams.get('data');
    
    if (dataFile && blogContainer) {
        loadBlogPosts(dataFile);
    } else {
        console.error('No data file specified or blog container not found');
    }
});

// Load and display blog posts
async function loadBlogPosts(dataFile) {
    try {
        const response = await fetch(dataFile);
        const blogPosts = await response.json();
        
        console.log('Loaded blog posts:', blogPosts);
        
        const container = document.querySelector('.blog-container');
        container.innerHTML = '';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'blog-header';
        header.innerHTML = `
            <h1>Technical Blog</h1>
            <p>My development experiences and technical insights</p>
        `;
        container.appendChild(header);
        
        // Create controls
        const controls = document.createElement('div');
        controls.className = 'blog-controls';
        // controls.innerHTML = `
        //     <button class="control-btn" onclick="expandAllPosts()">Expand All</button>
        //     <button class="control-btn" onclick="collapseAllPosts()">Collapse All</button>
        // `;
        container.appendChild(controls);
        
        // Create blog posts container
        const postsContainer = document.createElement('div');
        postsContainer.className = 'blog-posts-container';
        
        // Process each blog post
        blogPosts.forEach((post, index) => {
            const postElement = createBlogPost(post, index);
            postsContainer.appendChild(postElement);
        });
        
        container.appendChild(postsContainer);
        
    } catch (error) {
        console.error('Error loading blog posts:', error);
        document.querySelector('.blog-container').innerHTML = 
            '<p class="error-message">Error loading blog posts.</p>';
    }
}

// Create individual blog post element
function createBlogPost(post, index) {
    const postWrapper = document.createElement('div');
    postWrapper.className = 'blog-post-wrapper';
    
    // Create collapsible header
    const postHeader = document.createElement('div');
    postHeader.className = 'blog-post-header';
    postHeader.innerHTML = `
        <h2 class="post-title">${post.title}</h2>
        <div class="post-meta">
            <span class="post-date">${post.date}</span>
        </div>
        <p class="post-description">${post.description}</p>
        <span class="expand-icon">▼</span>
    `;
    
    // Create collapsible content
    const postContent = document.createElement('div');
    postContent.className = 'blog-post-content collapsed';
    postContent.innerHTML = `
        <div class="post-content-inner">
            ${parseMarkdownContent(post.content)}
        </div>
    `;
    
    // Add click handler for expand/collapse
    postHeader.addEventListener('click', function() {
        togglePost(postContent, postHeader);
    });
    
    postWrapper.appendChild(postHeader);
    postWrapper.appendChild(postContent);
    
    return postWrapper;
}

// Toggle individual post
function togglePost(contentElement, headerElement) {
    const isCollapsed = contentElement.classList.contains('collapsed');
    const icon = headerElement.querySelector('.expand-icon');
    
    if (isCollapsed) {
        contentElement.classList.remove('collapsed');
        icon.textContent = '▲';
        headerElement.classList.add('expanded');
    } else {
        contentElement.classList.add('collapsed');
        icon.textContent = '▼';
        headerElement.classList.remove('expanded');
    }
}

// Parse markdown content with proper formatting
function parseMarkdownContent(content) {
    if (!content) return '<p>No content available.</p>';
    
    // Split content into paragraphs
    const paragraphs = content.split('\n\n');
    let htmlContent = '';
    
    paragraphs.forEach(paragraph => {
        if (paragraph.trim() === '') return;
        
        // Handle headers
        if (paragraph.startsWith('### ')) {
            const headerText = parseInlineMarkdown(paragraph.substring(4));
            htmlContent += `<h3 class="content-h3">${headerText}</h3>`;
        }
        else if (paragraph.startsWith('## ')) {
            const headerText = parseInlineMarkdown(paragraph.substring(3));
            htmlContent += `<h2 class="content-h2">${headerText}</h2>`;
        }
        else if (paragraph.startsWith('# ')) {
            const headerText = parseInlineMarkdown(paragraph.substring(2));
            htmlContent += `<h1 class="content-h1">${headerText}</h1>`;
        }
        // Handle numbered lists
        else if (/^\d+\./.test(paragraph)) {
            const listItems = paragraph.split(/\n\d+\.\s*/);
            const firstItem = listItems.shift(); // Remove empty first item
            htmlContent += '<ol class="content-ordered-list">';
            if (firstItem && firstItem.trim()) {
                htmlContent += `<li>${parseInlineMarkdown(firstItem)}</li>`;
            }
            listItems.forEach(item => {
                if (item.trim()) {
                    htmlContent += `<li>${parseInlineMarkdown(item)}</li>`;
                }
            });
            htmlContent += '</ol>';
        }
        // Handle bullet lists
        else if (paragraph.includes('\n- ')) {
            const listItems = paragraph.split('\n- ');
            htmlContent += '<ul class="content-bullet-list">';
            listItems.forEach(item => {
                if (item.trim()) {
                    // Remove leading dash if present
                    const cleanItem = item.replace(/^-\s*/, '').trim();
                    if (cleanItem) {
                        htmlContent += `<li>${parseInlineMarkdown(cleanItem)}</li>`;
                    }
                }
            });
            htmlContent += '</ul>';
        }
        // Handle code blocks
        else if (paragraph.includes('```')) {
            const codeMatch = paragraph.match(/```(\w+)?\n?([\s\S]*?)```/);
            if (codeMatch) {
                const language = codeMatch[1] || 'text';
                const code = codeMatch[2];
                htmlContent += `
                    <div class="code-block">
                        <div class="code-header">${language}</div>
                        <pre><code>${escapeHtml(code)}</code></pre>
                    </div>
                `;
            } else {
                htmlContent += `<p class="content-paragraph">${parseInlineMarkdown(paragraph)}</p>`;
            }
        }
        // Regular paragraphs
        else {
            htmlContent += `<p class="content-paragraph">${parseInlineMarkdown(paragraph)}</p>`;
        }
    });
    
    return htmlContent;
}

// Parse inline markdown (links, bold, italic, code)
function parseInlineMarkdown(text) {
    if (!text) return '';
    
    // Handle links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="content-link">$1</a>');
    
    // Handle bold **text**
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong class="content-bold">$1</strong>');
    
    // Handle italic *text*
    text = text.replace(/\*([^*]+)\*/g, '<em class="content-italic">$1</em>');
    
    // Handle inline code `code`
    text = text.replace(/`([^`]+)`/g, '<code class="content-code">$1</code>');
    
    // Handle plain URLs
    text = text.replace(/(^|[^"])(https?:\/\/[^\s$$]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer" class="content-link">$2</a>');
    
    // Handle line breaks
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Control functions
function expandAllPosts() {
    document.querySelectorAll('.blog-post-content.collapsed').forEach(content => {
        content.classList.remove('collapsed');
    });
    document.querySelectorAll('.expand-icon').forEach(icon => {
        icon.textContent = '▲';
    });
    document.querySelectorAll('.blog-post-header').forEach(header => {
        header.classList.add('expanded');
    });
}

function collapseAllPosts() {
    document.querySelectorAll('.blog-post-content').forEach(content => {
        content.classList.add('collapsed');
    });
    document.querySelectorAll('.expand-icon').forEach(icon => {
        icon.textContent = '▼';
    });
    document.querySelectorAll('.blog-post-header').forEach(header => {
        header.classList.remove('expanded');
    });
}

// Optional: Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        expandAllPosts();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && window.getSelection().toString() === '') {
        e.preventDefault();
        collapseAllPosts();
    }
});
