// script.js - Journal JSON functionality only
document.addEventListener('DOMContentLoaded', function() {
    const journalContainer = document.querySelector('.journal-container');
    
    // Check current page and load journal content
    const urlParams = new URLSearchParams(window.location.search);
    const dataFile = urlParams.get('data');
    const contentType = urlParams.get('type');
    
    if (dataFile && journalContainer && contentType === 'journal') {
        loadJournalContent(dataFile);
    }
});

// Load journal content from JSON
async function loadJournalContent(dataFile) {
    try {
        const response = await fetch(dataFile);
        const journalEntries = await response.json();
        const container = document.querySelector('.journal-container');
        
        loadJournalEntries(journalEntries, container);
    } catch (error) {
        console.error('Error loading journal:', error);
        document.querySelector('.journal-container').innerHTML = 
            '<p class="error">Error loading journal entries.</p>';
    }
}

// Load journal entries with collapsible functionality
function loadJournalEntries(entries, container) {
    const header = document.createElement('div');
    header.className = 'journal-header';
    header.innerHTML = `
        <h1 class="journal-main-title">GSoC 2025 Weekly Journal</h1>
        <p class="journal-subtitle">My weekly progress updates and learnings during Google Summer of Code</p>
    `;
    container.appendChild(header);

    entries.forEach((entry, index) => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'journal-entry collapsible-entry';
        entryDiv.id = `week-${index + 1}`;

        const entryHeader = document.createElement('div');
        entryHeader.className = 'entry-header';
        entryHeader.innerHTML = `
            <h2 class="entry-title">${entry.title}</h2>
            <span class="entry-date">${entry.date}</span>
        `;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'entry-content collapsed';
        
        let contentHtml = '';
        
        if (entry.whatIDid) {
            contentHtml += '<h3>What I Did</h3>';
            contentHtml += formatStructuredContent(entry.whatIDid, 'whatIDid');
        }
        
        if (entry.progress) {
            contentHtml += '<h3>Progress Made</h3>';
            contentHtml += formatStructuredContent(entry.progress, 'progress');
        }
        
        if (entry.learnings) {
            contentHtml += '<h3>Key Learnings</h3>';
            contentHtml += formatStructuredContent(entry.learnings, 'learnings');
        }
        
        if (entry.nextWeekGoals) {
            contentHtml += '<h3>Next Week Goals</h3>';
            contentHtml += formatStructuredContent(entry.nextWeekGoals, 'nextWeekGoals');
        }

        contentDiv.innerHTML = contentHtml;

        // Add click handler for collapsible functionality
        entryHeader.addEventListener('click', function() {
            contentDiv.classList.toggle('collapsed');
            entryDiv.classList.toggle('expanded');
        });

        entryDiv.appendChild(entryHeader);
        entryDiv.appendChild(contentDiv);
        container.appendChild(entryDiv);
    });
}

// Enhanced structured content formatter for journal entries
function formatStructuredContent(contentObj, sectionType = 'default') {
    if (contentObj && contentObj.type === 'list' && contentObj.items) {
        const listClass = getListClassForSection(sectionType);
        return `<ul class="${listClass}">
            ${contentObj.items.map(item => `<li>${parseMarkdown(item)}</li>`).join('')}
        </ul>`;
    } else if (contentObj && contentObj.type === 'text' && contentObj.content) {
        const paragraphClass = getParagraphClassForSection(sectionType);
        return `<div class="${paragraphClass}">
            ${parseMarkdown(contentObj.content)}
        </div>`;
    } else if (typeof contentObj === 'string') {
        const paragraphClass = getParagraphClassForSection(sectionType);
        return `<div class="${paragraphClass}">
            ${parseMarkdown(contentObj)}
        </div>`;
    }
    
    return '<p class="error">Content format not supported.</p>';
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

// Enhanced markdown parser
function parseMarkdown(text) {
    if (!text) return '';

    // Preserve code blocks
    const codeBlocks = [];
    text = text.replace(/``````/g, function(match, lang, code) {
        const index = codeBlocks.length;
        codeBlocks.push({ lang: lang || '', code: code });
        return `%%%CODEBLOCK${index}%%%`;
    });

    // Handle inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Handle links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Handle bold **text**
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Handle italic *text*
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Restore code blocks
    text = text.replace(/%%%CODEBLOCK(\d+)%%%/g, function(match, index) {
        const block = codeBlocks[index];
        return `<pre><code class="language-${block.lang}">${escapeHtml(block.code)}</code></pre>`;
    });

    return text;
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
