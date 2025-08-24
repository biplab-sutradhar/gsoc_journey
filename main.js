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
            
            // Route based on FILE EXTENSION, not just type
            if (item.file.endsWith('.md')) {
                if (item.type === 'journal') {
                    // MD journal files go to blog.html with special handling
                    card.href = `blog.html?data=${item.file}&type=journal-md`;
                } else {
                    // Regular blog-collection MD files
                    card.href = `blog.html?data=${item.file}&type=${item.type}`;
                }
            } else if (item.file.endsWith('.json')) {
                // JSON journal files go to journal.html
                card.href = `journal.html?data=${item.file}&type=${item.type}`;
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
        
    } catch (error) { 
        console.error('Error loading homepage:', error); 
        document.querySelector('.blog-list').innerHTML = '<p class="error-message">Error loading content.</p>'; 
    } 
}
