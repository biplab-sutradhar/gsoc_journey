// main.js - Homepage and routing functionality
document.addEventListener('DOMContentLoaded', function() {
    const blogListContainer = document.querySelector('.blog-list');
    
    if (blogListContainer) {
        loadHomepage();
    }
});

// Homepage: Load cards from blogs.json
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
                    <h3 class="card-title">${item.title}</h3>
                    <p class="card-description">${item.description}</p>
                </div>
            `;
            
            blogListContainer.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading homepage:', error);
        const blogListContainer = document.querySelector('.blog-list');
        if (blogListContainer) {
            blogListContainer.innerHTML = '<p class="error">Error loading content.</p>';
        }
    }
}
