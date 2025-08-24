// blog-script.js - Blog MD file functionality
document.addEventListener('DOMContentLoaded', function() {
    const blogContainer = document.querySelector('.blog-container');
    
    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    let dataFile = urlParams.get('data');
    const postId = urlParams.get('post');
    const contentType = urlParams.get('type');
    
    
    // if (dataFile === 'blogs/') {
    //     dataFile = 'blogs/blog.md';
    // }
    
    if (blogContainer && contentType === 'blog-collection' && dataFile) {
        if (postId) {
            loadIndividualBlogPost(dataFile, postId);
        } else {
            loadBlogIndex(dataFile);
        }
    } else {
        console.error('Blog container not found or missing parameters');
        if (blogContainer) {
            blogContainer.innerHTML = '<p>Invalid blog parameters.</p>';
        }
    }
});

// Load blog index (list of all blog posts)
async function loadBlogIndex(dataFile) {
    try {
        const response = await fetch(dataFile);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const markdownContent = await response.text();
        const blogPosts = parseMultipleBlogPosts(markdownContent);
        
        const container = document.querySelector('.blog-container');
        container.innerHTML = ''; // Clear container
        
        // Blog header matching CSS styles
        const header = document.createElement('div');
        header.className = 'blog-header';
        header.innerHTML = `
            <h1>Blog</h1>
            <p>My development experiences and technical insights</p>
        `;
        container.appendChild(header);
        
        // Blog list container
        const blogList = document.createElement('div');
        blogList.className = 'blog-list-titles';
        
        if (blogPosts.length === 0) {
            blogList.innerHTML = '<p>No blog posts found.</p>';
        } else {
            blogPosts.forEach(post => {
                const blogTitleCard = document.createElement('div');
                blogTitleCard.className = 'blog-title-card';
                blogTitleCard.innerHTML = `
                <a href="blog.html?data=${dataFile}&type=blog-collection&post=${post.metadata.id}">    
                <h2>${post.metadata.title}</h2>
                    <div class="blog-date">${post.metadata.date}</div>
                    <p class="blog-preview">${post.metadata.description || ''}</p>
                </a>`;
                blogList.appendChild(blogTitleCard);
            });
        }
        
        container.appendChild(blogList);
        
    } catch (error) {
        console.error('Error loading blog index:', error);
        document.querySelector('.blog-container').innerHTML = '<p>Error loading blog posts.</p>';
    }
}

// Load individual blog post
async function loadIndividualBlogPost(dataFile, postId) {
    try {
        const response = await fetch(dataFile);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const markdownContent = await response.text();
        const blogPosts = parseMultipleBlogPosts(markdownContent);
        const post = blogPosts.find(p => p.metadata.id == postId);
        
        if (!post) {
            throw new Error(`Blog post with id ${postId} not found`);
        }
        
        const container = document.querySelector('.blog-container');
        container.innerHTML = `
            <div class="blog-post">
                <div class="blog-meta">
                    <a href="blog.html?data=${dataFile}&type=blog-collection" class="nav-home-btn">← Back to Blog</a>
                </div>
                
                <div class="blog-post-content-single">
                    ${parseMarkdownContent(post.content)}
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading blog post:', error);
        document.querySelector('.blog-container').innerHTML = '<p>Error loading blog post. Make sure the file exists.</p>';
    }
}

// Parse multiple blog posts from markdown content
function parseMultipleBlogPosts(markdownContent) {
    const blogPosts = [];
    
    // Split by --- that start at beginning of line
    const sections = markdownContent.split(/^---$/gm);
    
    // Process sections (skip first empty section)
    for (let i = 1; i < sections.length; i += 2) {
        const frontmatterSection = sections[i];
        
        if (frontmatterSection && frontmatterSection.includes('id:')) {
            const post = parseIndividualPost(frontmatterSection);
            if (post && post.metadata && post.metadata.id && post.metadata.title) {
                blogPosts.push(post);
            }
        }
    }
    
    return blogPosts;
}

// Parse individual post from frontmatter
function parseIndividualPost(frontmatterText) {
    try {
        const metadata = parseFrontMatter(frontmatterText);
        const content = metadata.contents || '';
        
        return {
            metadata,
            content: content.trim()
        };
    } catch (error) {
        console.error('Error parsing post:', error);
        return null;
    }
}

// Enhanced frontmatter parser that handles multi-line quoted strings
function parseFrontMatter(frontMatter) {
    const metadata = {};
    const lines = frontMatter.split('\n');
    let currentKey = null;
    let currentValue = '';
    let inMultilineString = false;
    
    lines.forEach(line => {
        line = line.trim();
        
        if (inMultilineString) {
            if (line === '"' || line === "'") {
                // End of multiline string
                inMultilineString = false;
                metadata[currentKey] = currentValue.trim();
                currentKey = null;
                currentValue = '';
            } else {
                currentValue += line + '\n';
            }
        } else {
            const match = line.match(/^(\w+):\s*(.*)$/);
            if (match) {
                let key = match[1];
                let value = match[2].trim();
                
                // Check if this starts a multiline string
                if (value === '"' || value === "'") {
                    currentKey = key;
                    currentValue = '';
                    inMultilineString = true;
                } else {
                    // Remove quotes and handle normal values
                    value = value.replace(/^["']|["']$/g, '');
                    if (key === 'id' && !isNaN(value)) {
                        value = parseInt(value);
                    }
                    metadata[key] = value;
                }
            }
        }
    });
    
    return metadata;
}

// Parse markdown content to HTML - Enhanced to match CSS styles
function parseMarkdownContent(text) {
    if (!text) return '';
    
    // First, preserve code blocks with triple backticks
    const codeBlocks = [];
    text = text.replace(/```([\s\S]*?)```/g, function(match, code) {
        const index = codeBlocks.length;
        codeBlocks.push({ code: code.trim() });
        return `%%%CODEBLOCK${index}%%%`;
    });
    
    // Split into paragraphs and process
    const paragraphs = text.split('\n\n');
    let html = '';
    
    paragraphs.forEach(paragraph => {
        paragraph = paragraph.trim();
        if (paragraph === '') return;
        
        // Handle headers
        if (paragraph.startsWith('### ')) {
            html += `<h3>${parseInlineMarkdown(paragraph.substring(4))}</h3>\n`;
        } else if (paragraph.startsWith('## ')) {
            html += `<h2>${parseInlineMarkdown(paragraph.substring(3))}</h2>\n`;
        } else if (paragraph.startsWith('# ')) {
            html += `<h1>${parseInlineMarkdown(paragraph.substring(2))}</h1>\n`;
        } else if (paragraph.startsWith('- ')) {
            // Handle bullet lists
            const listItems = paragraph.split('\n').filter(line => line.trim().startsWith('- '));
            html += '<ul>\n';
            listItems.forEach(item => {
                html += `<li>${parseInlineMarkdown(item.substring(2).trim())}</li>\n`;
            });
            html += '</ul>\n';
        } else if (paragraph.match(/^\d+\./)) {
            // Handle numbered lists
            const listItems = paragraph.split('\n').filter(line => line.match(/^\d+\./));
            html += '<ol>\n';
            listItems.forEach(item => {
                const content = item.replace(/^\d+\.\s*/, '');
                html += `<li>${parseInlineMarkdown(content)}</li>\n`;
            });
            html += '</ol>\n';
        } else if (paragraph.startsWith('%%%CODEBLOCK')) {
            // Handle code blocks
            const match = paragraph.match(/%%%CODEBLOCK(\d+)%%%/);
            if (match) {
                const index = parseInt(match[1]);
                if (codeBlocks[index]) {
                    html += `<pre><code>${escapeHtml(codeBlocks[index].code)}</code></pre>\n`;
                }
            }
        } else {
            // Regular paragraph
            html += `<p>${parseInlineMarkdown(paragraph)}</p>\n`;
        }
    });
    
    return html;
}

// Remove the incorrect code block handling from parseInlineMarkdown
function parseInlineMarkdown(text) {
    if (!text) return '';
    
    // handle `code snippets` (single backticks)
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Handle line breaks
    text = text.replace(/\n/g, '<br>');

    // Handle links - matches CSS .blog-post-content-single a styles
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Handle bold - matches CSS .blog-post-content-single strong styles
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Handle italic
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    return text;
}

// Escape HTML characters
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


// Escape HTML characters
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


//  text = text.replace(/```([\s\S]*?)```/g, function(match, p1) {
//         return `<pre><code>${p1.trim()}</code></pre>`;
//     });

// Escape HTML characters
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
