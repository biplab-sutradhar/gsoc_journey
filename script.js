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

// Enhanced content parsing with block-specific logic
function formatContent(content, contentType = 'blog') {
    if (typeof content !== 'string') return '<p>Invalid content format.</p>';
    
    // Different parsing logic based on content type
    switch (contentType) {
        case 'blog':
            return formatBlogContent(content);
        case 'journal':
            return formatJournalContent(content);
        default:
            return formatBlogContent(content); // Default to blog formatting
    }
}

// Blog-specific content formatting
function formatBlogContent(content) {
    return content
        .split('\n\n')
        .map(paragraph => {
            if (paragraph.trim() === '') return '';
            
            // Handle headers with enhanced styling
            if (paragraph.startsWith('### ')) {
                const headerText = parseMarkdown(paragraph.substring(4));
                return `<h3 class="blog-h3">${headerText}</h3>`;
            }
            if (paragraph.startsWith('## ')) {
                const headerText = parseMarkdown(paragraph.substring(3));
                return `<h2 class="blog-h2">${headerText}</h2>`;
            }
            if (paragraph.startsWith('# ')) {
                const headerText = parseMarkdown(paragraph.substring(2));
                return `<h1 class="blog-h1">${headerText}</h1>`;
            }
            
            // Handle code blocks with language detection
            if (paragraph.includes('```')) {
                const codeMatch = paragraph.match(/```(\w+)?\n?([\s\S]*?)```/);
                if (codeMatch) {
                    const language = codeMatch[1] || 'text';
                    const code = codeMatch[2];
                    return `<div class="code-block">
                        <div class="code-header">${language}</div>
                        <pre><code class="language-${language}">${escapeHtml(code)}</code></pre>
                    </div>`;
                }
            }
            
            // Handle numbered lists with step indicators
            if (/^\d+\./.test(paragraph)) {
                const items = paragraph.split(/\n\d+\.\s*/).filter(item => item.trim());
                return `<ol class="blog-steps">${items.map((item, index) => 
                    `<li class="step-item">
                        <span class="step-number">${index + 1}</span>
                        <div class="step-content">${parseMarkdown(item)}</div>
                    </li>`
                ).join('')}</ol>`;
            }
            
            // Handle bullet lists
            if (paragraph.includes('\n- ')) {
                const items = paragraph.split('\n- ').filter(item => item.trim());
                return `<ul class="blog-list">${items.map(item => 
                    `<li class="blog-list-item">${parseMarkdown(item)}</li>`
                ).join('')}</ul>`;
            }
            
            // Handle special callout blocks
            if (paragraph.startsWith('> ')) {
                const calloutText = parseMarkdown(paragraph.substring(2));
                return `<blockquote class="blog-callout">${calloutText}</blockquote>`;
            }
            
            // Regular paragraphs
            return `<p class="blog-paragraph">${parseMarkdown(paragraph)}</p>`;
        })
        .join('');
}

// Journal-specific content formatting (for structured weekly entries)
function formatJournalContent(content) {
    // This handles the structured journal format differently
    return content
        .split('\n\n')
        .map(paragraph => {
            if (paragraph.trim() === '') return '';
            
            // Journal headers are smaller and colored differently
            if (paragraph.startsWith('### ')) {
                return `<h3 class="journal-h3">${parseMarkdown(paragraph.substring(4))}</h3>`;
            }
            if (paragraph.startsWith('## ')) {
                return `<h2 class="journal-h2">${parseMarkdown(paragraph.substring(3))}</h2>`;
            }
            
            // Journal lists are more compact
            if (paragraph.includes('\n- ')) {
                const items = paragraph.split('\n- ').filter(item => item.trim());
                return `<ul class="journal-list">${items.map(item => 
                    `<li class="journal-list-item">${parseMarkdown(item)}</li>`
                ).join('')}</ul>`;
            }
            
            // Journal paragraphs
            return `<p class="journal-paragraph">${parseMarkdown(paragraph)}</p>`;
        })
        .join('');
}

// Enhanced structured content formatter for journal entries
function formatStructuredContent(contentObj, sectionType = 'default') {
    if (contentObj && contentObj.type === 'list' && contentObj.items) {
        const listClass = getListClassForSection(sectionType);
        return `<ul class="${listClass}">${contentObj.items.map(item => 
            `<li class="${listClass}-item">${parseMarkdown(item)}</li>`
        ).join('')}</ul>`;
    } else if (contentObj && contentObj.type === 'text' && contentObj.content) {
        const paragraphClass = getParagraphClassForSection(sectionType);
        return `<p class="${paragraphClass}">${parseMarkdown(contentObj.content)}</p>`;
    } else if (typeof contentObj === 'string') {
        const paragraphClass = getParagraphClassForSection(sectionType);
        return `<p class="${paragraphClass}">${parseMarkdown(contentObj)}</p>`;
    }
    return '<p class="content-error">Content format not supported.</p>';
}

// Helper functions for section-specific styling
function getListClassForSection(sectionType) {
    const classMap = {
        'whatIDid': 'journal-tasks-list',
        'progress': 'journal-progress-list', 
        'learnings': 'journal-learnings-list',
        'nextWeekGoals': 'journal-goals-list',
        'default': 'journal-list'
    };
    return classMap[sectionType] || classMap['default'];
}

function getParagraphClassForSection(sectionType) {
    const classMap = {
        'whatIDid': 'journal-tasks-text',
        'progress': 'journal-progress-text',
        'learnings': 'journal-learnings-text', 
        'nextWeekGoals': 'journal-goals-text',
        'default': 'journal-paragraph'
    };
    return classMap[sectionType] || classMap['default'];
}

// Updated journal entries loader with section-specific parsing
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
        
        const entryHeader = document.createElement('div');
        entryHeader.className = 'entry-header';
        entryHeader.innerHTML = `
            <h2>${entry.title}</h2>
            <p class="entry-date">${entry.date}</p>
            <span class="expand-icon">▼</span>
        `;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'entry-content collapsed';
        
        let contentHtml = '';
        if (entry.whatIDid) {
            contentHtml += '<div class="journal-section what-i-did">';
            contentHtml += '<h3 class="section-header">What I Did</h3>';
            contentHtml += formatStructuredContent(entry.whatIDid, 'whatIDid');
            contentHtml += '</div>';
        }
        if (entry.progress) {
            contentHtml += '<div class="journal-section progress-made">';
            contentHtml += '<h3 class="section-header">Progress Made</h3>';
            contentHtml += formatStructuredContent(entry.progress, 'progress');
            contentHtml += '</div>';
        }
        if (entry.learnings) {
            contentHtml += '<div class="journal-section key-learnings">';
            contentHtml += '<h3 class="section-header">Key Learnings</h3>';
            contentHtml += formatStructuredContent(entry.learnings, 'learnings');
            contentHtml += '</div>';
        }
        if (entry.nextWeekGoals) {
            contentHtml += '<div class="journal-section next-goals">';
            contentHtml += '<h3 class="section-header">Next Week Goals</h3>';
            contentHtml += formatStructuredContent(entry.nextWeekGoals, 'nextWeekGoals');
            contentHtml += '</div>';
        }
        
        contentDiv.innerHTML = contentHtml;
        
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

// Updated blog collection loader with proper content formatting
function loadBlogCollection(blogs, container) {
    if (!blogs || !Array.isArray(blogs) || blogs.length === 0) {
        container.innerHTML = '<div class="error-message">No blog posts available.</div>';
        return;
    }

    const header = document.createElement('div');
    header.className = 'blog-header';
    header.innerHTML = `<h1>Technical Blog</h1>
                        <p>My development experiences and technical insights</p>`;
    container.appendChild(header);

    const blogList = document.createElement('div');
    blogList.className = 'blog-list-titles';
    
    blogs.forEach((blog, index) => {
        if (!blog.title || !blog.content) {
            console.warn(`Blog post ${index} is missing required fields`);
            return;
        }

        const blogTitle = document.createElement('div');
        blogTitle.className = 'blog-title-card';
        blogTitle.innerHTML = `<h2>${escapeHtml(blog.title)}</h2>
                               <div class="blog-preview">${escapeHtml(blog.description || 'No description available')}</div>
                               <div class="blog-date">${escapeHtml(blog.date || 'No date')}</div>
                               <span class="expand-icon">▼</span>`;

        const blogContent = document.createElement('div');
        blogContent.className = 'blog-full-content collapsed';
        
        try {
            blogContent.innerHTML = formatContent(blog.content, 'blog');
        } catch (error) {
            console.error(`Error formatting blog content for post ${index}:`, error);
            blogContent.innerHTML = '<p class="error-message">Error loading content.</p>';
        }

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


// Enhanced markdown parsing function with improved code block handling
function parseMarkdown(text) {
    if (!text) return '';
    
    // First handle code blocks to prevent markdown parsing inside them
    const codeBlocks = [];
    text = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, function(match, language, code) {
        codeBlocks.push({language: language || 'text', code});
        return `%%%CODEBLOCK${codeBlocks.length - 1}%%%`;
    });
    
    // Process other markdown elements
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    
    // Convert URLs to links (for plain URLs not in markdown links)
    text = text.replace(/(^|\s)(https?:\/\/[^\s\)]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');
    
    // Convert email addresses
    text = text.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g, '<a href="mailto:$1">$1</a>');
    
    // Restore code blocks
    text = text.replace(/%%%CODEBLOCK(\d+)%%%/g, function(match, index) {
        const block = codeBlocks[index];
        return `<div class="code-block">
            <div class="code-header">${block.language}</div>
            <pre><code class="language-${block.language}">${escapeHtml(block.code)}</code></pre>
        </div>`;
    });
    
    // Process line breaks (but preserve them in code blocks)
    text = text.replace(/\n/g, '<br>');
    
    return text;
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