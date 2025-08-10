// script.js - Complete implementation with enhanced markdown parsing and collapsible functionality

document.addEventListener('DOMContentLoaded', function() {
    const blogListContainer = document.querySelector('.blog-list');
    const journalContainer = document.querySelector('.journal-container');
    const blogContainer = document.querySelector('.blog-container');
    
    // Check current page and load appropriate content
    const urlParams = new URLSearchParams(window.location.search);
    const dataFile = urlParams.get('data');
    const contentType = urlParams.get('type');
    
    if (dataFile && (journalContainer || blogContainer)) {
        // Load individual content based on type
        loadContent(dataFile, contentType);
    } else if (blogListContainer) {
        // Load homepage with two cards
        loadHomepage();
    }
});

// Homepage: Load simplified two-card layout
async function loadHomepage() {
    try {
        const response = await fetch('blogs.json');
        const items = await response.json();
        
        const blogListContainer = document.querySelector('.blog-list');
        blogListContainer.innerHTML = '';
        
        items.forEach(item => {
            const card = document.createElement('a');
            
            // Route based on content type
            if (item.type === 'journal') {
                card.href = `journal.html?data=${item.file}&type=${item.type}`;
            } else if (item.type === 'blog-collection') {
                card.href = `blog.html?data=${item.file}&type=${item.type}`;
            }
            
            card.className = `blog-card ${item.type}`;
            card.innerHTML = `
                <div class="card-content">
                    <h3>${item.title}</h3>
                    <p class="card-description">${item.description}</p>
                </div>
            `;
            blogListContainer.appendChild(card);
        });
        
        console.log('Homepage loaded successfully');
    } catch (error) {
        console.error('Error loading homepage:', error);
        document.querySelector('.blog-list').innerHTML = '<p class="error-message">Error loading content.</p>';
    }
}

// Load content based on type
async function loadContent(dataFile, contentType) {
    try {
        const response = await fetch(dataFile);
        const data = await response.json();
        
        console.log('Loaded content:', data);
        
        const container = document.querySelector('.journal-container') || 
                         document.querySelector('.blog-container');
        container.innerHTML = '';
        
        if (contentType === 'journal') {
            // Load journal entries (weekly updates)
            loadJournalEntries(data, container);
        } else if (contentType === 'blog-collection') {
            // Load blog collection (multiple blog posts)
            loadBlogCollection(data, container);
        } else {
            throw new Error('Unknown content type');
        }
        
    } catch (error) {
        console.error('Error loading content:', error);
        const container = document.querySelector('.journal-container') || 
                         document.querySelector('.blog-container');
        container.innerHTML = '<p class="error-message">Error loading content.</p>';
    }
}

// Load journal entries with collapsible functionality
function loadJournalEntries(entries, container) {
    const header = document.createElement('div');
    header.className = 'journal-header';
    header.innerHTML = `
        <h1>GSoC 2025 Weekly Journal</h1>
        <p>My weekly progress updates and learnings during Google Summer of Code</p>
    `;
    container.appendChild(header);
    
    entries.forEach((entry, index) => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'journal-entry collapsible-entry';
        entryDiv.id = `week-${index + 1}`;
        
        // Create collapsible header
        const entryHeader = document.createElement('div');
        entryHeader.className = 'entry-header';
        entryHeader.innerHTML = `
            <h2>${entry.title}</h2>
            <p class="entry-date">${entry.date}</p>
            <span class="expand-icon">▼</span>
        `;
        
        // Create collapsible content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'entry-content collapsed';
        
        let contentHtml = '';
        if (entry.whatIDid) {
            contentHtml += '<h3>What I Did</h3>';
            contentHtml += formatStructuredContent(entry.whatIDid);
        }
        if (entry.progress) {
            contentHtml += '<h3>Progress Made</h3>';
            contentHtml += formatStructuredContent(entry.progress);
        }
        if (entry.learnings) {
            contentHtml += '<h3>Key Learnings</h3>';
            contentHtml += formatStructuredContent(entry.learnings);
        }
        if (entry.nextWeekGoals) {
            contentHtml += '<h3>Next Week Goals</h3>';
            contentHtml += formatStructuredContent(entry.nextWeekGoals);
        }
        
        contentDiv.innerHTML = contentHtml;
        
        // Add click handler for collapsible functionality
        entryHeader.addEventListener('click', function() {
            const isExpanded = !contentDiv.classList.contains('collapsed');
            contentDiv.classList.toggle('collapsed');
            const icon = entryHeader.querySelector('.expand-icon');
            icon.textContent = isExpanded ? '▼' : '▲';
            entryDiv.classList.toggle('expanded');
        });
        
        entryDiv.appendChild(entryHeader);
        entryDiv.appendChild(contentDiv);
        container.appendChild(entryDiv);
    });
}

// Load blog collection with expandable titles
function loadBlogCollection(blogs, container) {
    const header = document.createElement('div');
    header.className = 'blog-header';
    header.innerHTML = `
        <h1>Technical Blog</h1>
        <p>My development experiences and technical insights</p>
    `;
    container.appendChild(header);
    
    // Create blog list with titles only
    const blogList = document.createElement('div');
    blogList.className = 'blog-list-titles';
    
    blogs.forEach((blog, index) => {
        const blogTitle = document.createElement('div');
        blogTitle.className = 'blog-title-card';
        blogTitle.innerHTML = `
            <h2>${blog.title}</h2>
            <p class="blog-preview">${blog.description}</p>
            <span class="blog-date">${blog.date}</span>
            <span class="expand-icon">▼</span>
        `;
        
        // Create hidden content
        const blogContent = document.createElement('div');
        blogContent.className = 'blog-full-content collapsed';
        blogContent.innerHTML = `
            <div class="blog-content">${formatContent(blog.content)}</div>
        `;
        
        // Add click handler
        blogTitle.addEventListener('click', function() {
            const isExpanded = !blogContent.classList.contains('collapsed');
            blogContent.classList.toggle('collapsed');
            const icon = blogTitle.querySelector('.expand-icon');
            icon.textContent = isExpanded ? '▼' : '▲';
            blogTitle.classList.toggle('expanded');
        });
        
        blogList.appendChild(blogTitle);
        blogList.appendChild(blogContent);
    });
    
    container.appendChild(blogList);
}

// Enhanced markdown parsing function - CORRECTED VERSION
function parseMarkdown(text) {
    if (!text) return '';
    
    // Process links [text](url) - FIXED REGEX
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Process bold **text**
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Process italic *text*
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Process headers ### text
    text = text.replace(/^###\s(.+)$/gm, '<h3>$1</h3>');
    text = text.replace(/^##\s(.+)$/gm, '<h2>$1</h2>');
    text = text.replace(/^#\s(.+)$/gm, '<h1>$1</h1>');
    
    // Process inline code `code`
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Process strikethrough ~~text~~
    text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    
    // Convert URLs to clickable links (for plain URLs not already in markdown links)
    const urlRegex = /(^|[^"])(https?:\/\/[^\s\)]+)/g;
    text = text.replace(urlRegex, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');
    
    // Convert email addresses
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
    text = text.replace(emailRegex, '<a href="mailto:$1">$1</a>');
    
    // Process line breaks
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

// Format structured content (for journal)
function formatStructuredContent(contentObj) {
    if (contentObj && contentObj.type === 'list' && contentObj.items) {
        return `<ul>${contentObj.items.map(item => `<li>${parseMarkdown(item)}</li>`).join('')}</ul>`;
    } else if (contentObj && contentObj.type === 'text' && contentObj.content) {
        return `<p>${parseMarkdown(contentObj.content)}</p>`;
    } else if (typeof contentObj === 'string') {
        return `<p>${parseMarkdown(contentObj)}</p>`;
    }
    return '<p>Content format not supported.</p>';
}

// Enhanced content formatting with proper markdown parsing
function formatContent(content) {
    if (typeof content !== 'string') return '<p>Invalid content format.</p>';
    
    return content
        .split('\n\n')
        .map(paragraph => {
            if (paragraph.trim() === '') return '';
            
            // Handle headers (before markdown parsing to avoid conflicts)
            if (paragraph.startsWith('### ')) {
                return `<h3>${parseMarkdown(paragraph.substring(4))}</h3>`;
            }
            if (paragraph.startsWith('## ')) {
                return `<h2>${parseMarkdown(paragraph.substring(3))}</h2>`;
            }
            if (paragraph.startsWith('# ')) {
                return `<h1>${parseMarkdown(paragraph.substring(2))}</h1>`;
            }
            
            // Handle code blocks (don't parse markdown inside code)
            if (paragraph.includes('```')) {
                const codeMatch = paragraph.match(/```(\w+)?\n?([\s\S]*?)```/);
                if (codeMatch) {
                    const language = codeMatch[1] || '';
                    const code = codeMatch[2];
                    return `<pre><code class="language-${language}">${escapeHtml(code)}</code></pre>`;
                }
            }
            
            // Handle lists
            if (paragraph.includes('\n- ')) {
                const items = paragraph.split('\n- ').filter(item => item.trim());
                return `<ul>${items.map(item => `<li>${parseMarkdown(item)}</li>`).join('')}</ul>`;
            }
            
            // Handle numbered lists
            if (/^\d+\./.test(paragraph)) {
                const items = paragraph.split(/\n\d+\.\s*/).filter(item => item.trim());
                return `<ol>${items.map(item => `<li>${parseMarkdown(item)}</li>`).join('')}</ol>`;
            }
            
            return `<p>${parseMarkdown(paragraph)}</p>`;
        })
        .join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Utility functions for expand/collapse all
function expandAllEntries() {
    document.querySelectorAll('.entry-content.collapsed, .blog-full-content.collapsed').forEach(content => {
        content.classList.remove('collapsed');
    });
    document.querySelectorAll('.expand-icon').forEach(icon => {
        icon.textContent = '▲';
    });
    document.querySelectorAll('.collapsible-entry, .blog-title-card').forEach(entry => {
        entry.classList.add('expanded');
    });
}

function collapseAllEntries() {
    document.querySelectorAll('.entry-content, .blog-full-content').forEach(content => {
        content.classList.add('collapsed');
    });
    document.querySelectorAll('.expand-icon').forEach(icon => {
        icon.textContent = '▼';
    });
    document.querySelectorAll('.collapsible-entry, .blog-title-card').forEach(entry => {
        entry.classList.remove('expanded');
    });
}

// Navigation helpers
function goToHome() {
    window.location.href = 'index.html';
}

function goToJournal() {
    window.location.href = 'journal.html?data=blogs/gsoc2025.json&type=journal';
}

function goToBlog() {
    window.location.href = 'blog.html?data=blogs/blog.json&type=blog-collection';
}

// Search functionality (optional enhancement)
function searchContent(searchTerm) {
    const entries = document.querySelectorAll('.journal-entry, .blog-title-card');
    const term = searchTerm.toLowerCase().trim();
    
    entries.forEach(entry => {
        const text = entry.textContent.toLowerCase();
        const content = entry.nextElementSibling;
        
        if (text.includes(term)) {
            entry.style.display = 'block';
            if (content && content.classList.contains('blog-full-content')) {
                content.style.display = 'block';
            }
        } else {
            entry.style.display = 'none';
            if (content && content.classList.contains('blog-full-content')) {
                content.style.display = 'none';
            }
        }
    });
}

// Print functionality
function printContent() {
    // Expand all entries before printing
    expandAllEntries();
    
    setTimeout(() => {
        window.print();
    }, 100);
}

// Export functions for external use if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadHomepage,
        loadContent,
        loadJournalEntries,
        loadBlogCollection,
        parseMarkdown,
        formatContent,
        formatStructuredContent,
        expandAllEntries,
        collapseAllEntries,
        searchContent,
        printContent
    };
}

// Initialize any additional functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+E or Cmd+E to expand all
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            expandAllEntries();
        }
        
        // Ctrl+C or Cmd+C to collapse all (when not selecting text)
        if ((e.ctrlKey || e.metaKey) && e.key === 'c' && window.getSelection().toString() === '') {
            e.preventDefault();
            collapseAllEntries();
        }
        
        // Ctrl+H or Cmd+H to go home
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            goToHome();
        }
    });
});
