// blog-script.js - Simple blog functionality
document.addEventListener('DOMContentLoaded', function() {
    const blogContainer = document.querySelector('.blog-container');
    
    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const dataFile = urlParams.get('data');
    const postId = urlParams.get('post');
    
    if (dataFile && blogContainer) {
        if (postId) {
            loadIndividualPost(dataFile, postId);
        } else {
            loadBlogTitles(dataFile);
        }
    } else {
        console.error('Blog data not found');
    }
});

// Load all blog titles
async function loadBlogTitles(dataFile) {
    try {
        const response = await fetch(dataFile);
        const blogPosts = await response.json();
        
        const container = document.querySelector('.blog-container');
        container.innerHTML = `
            <div class="blog-header">
                <h1>Blog Posts</h1>
                <p>My development experiences and insights</p>
               
            </div>
        `;
        
        const blogList = document.createElement('div');
        blogList.className = 'blog-list-titles';
        
        blogPosts.forEach(post => {
            const blogCard = document.createElement('div');
            blogCard.className = 'blog-title-card';
            blogCard.onclick = () => {
                window.location.href = `blog.html?data=${dataFile}&post=${post.id}`;
            };
            
            blogCard.innerHTML = `
                <h2>${post.title}</h2>
                <div class="blog-date">${post.date}</div>
                <div class="blog-preview">${post.description}</div>
            `;
            
            blogList.appendChild(blogCard);
        });
        
        container.appendChild(blogList);
        
    } catch (error) {
        console.error('Error loading blog posts:', error);
        document.querySelector('.blog-container').innerHTML = 
            '<div class="error-message">Error loading blog posts.</div>';
    }
}

// Load individual blog post
async function loadIndividualPost(dataFile, postId) {
    try {
        const response = await fetch(dataFile);
        const blogPosts = await response.json();
        
        const post = blogPosts.find(p => p.id == postId);
        if (!post) {
            throw new Error('Blog post not found');
        }
        
        const container = document.querySelector('.blog-container');
        container.innerHTML = `
            <div class="blog-navigation">
                <button class="nav-home-btn" onclick="window.location.href='blog.html?data=${dataFile}'">← Back to Blog</button>
               
            </div>
            
            <div class="blog-post-header-single">
                <h1>${post.title}</h1>
                <div class="blog-date">${post.date}</div>
                <div class="blog-description">${post.description}</div>
            </div>
            
            <div class="blog-post-content-single">
                ${formatContent(post.content)}
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading blog post:', error);
        document.querySelector('.blog-container').innerHTML = 
            '<div class="error-message">Blog post not found.</div>';
    }
}

// Simple content formatting - only handles basic markdown
function formatContent(content) {
    if (!content) return '<p>No content available.</p>';
    
    // Split into paragraphs
    const paragraphs = content.split('\n\n');
    let html = '';
    
    paragraphs.forEach(paragraph => {
        if (paragraph.trim() === '') return;
        
        // Handle headers
        if (paragraph.startsWith('### ')) {
            html += `<h3>${parseSimpleMarkdown(paragraph.substring(4))}</h3>`;
        } else if (paragraph.startsWith('## ')) {
            html += `<h2>${parseSimpleMarkdown(paragraph.substring(3))}</h2>`;
        } else if (paragraph.startsWith('# ')) {
            html += `<h1>${parseSimpleMarkdown(paragraph.substring(2))}</h1>`;
        } else {
            // Regular paragraph
            html += `<p>${parseSimpleMarkdown(paragraph)}</p>`;
        }
    });
    
    return html;
}

// Simple markdown parser - only bold and links
function parseSimpleMarkdown(text) {
    if (!text) return '';
    
    // Handle links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Handle bold **text**
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Handle line breaks
    text = text.replace(/\n/g, '<br>');
    
    return text;
}
