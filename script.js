document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const body = document.body;
  const sidebar = document.getElementById('sidebar');
  const weekNav = document.getElementById('week-nav');
  const journalContainer = document.getElementById('journal-container');

  // Theme toggle
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    localStorage.setItem('theme', body.classList.contains('light-mode') ? 'light' : 'dark');
    themeToggle.textContent = body.classList.contains('light-mode') ? '🌙' : '☀️';
  });

  // Load saved theme (default dark)
  if (localStorage.getItem('theme') === 'light') {
    body.classList.add('light-mode');
    themeToggle.textContent = '🌙';
  } else {
    themeToggle.textContent = '☀️';
  }

  // Sidebar toggle
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    // body.classList.toggle('sidebar-collapsed');
    body.classList.toggle('blurred'); // Toggles the blurred class
  });

  // Load journal entries
  fetch('journal.json')
    .then(response => response.json())
    .then(entries => {
      entries.forEach((entry, index) => {
        // Navigation link
        const navItem = document.createElement('li');
        const navLink = document.createElement('a');
        navLink.href = `#week-${index}`;
        navLink.textContent = entry.title;
        navLink.addEventListener('click', (event) => {
          event.preventDefault(); // Prevent default anchor behavior

          // Scroll to the corresponding journal entry
          const targetEntry = document.getElementById(`week-${index}`);
          targetEntry.scrollIntoView({ behavior: 'smooth', block: 'start' });

          // Temporarily change the background color
          targetEntry.style.backgroundColor = 'rgba(0, 212, 255, 0.2)'; // Highlight color
          setTimeout(() => {
            targetEntry.style.backgroundColor = ''; // Reset background color after 2 seconds
          }, 2000);

          // Update active link styling
          document.querySelectorAll('#week-nav a').forEach(link => link.classList.remove('active'));
          navLink.classList.add('active');
        });
        navItem.appendChild(navLink);
        weekNav.appendChild(navItem);

        // Journal entry
        const entryDiv = document.createElement('div');
        entryDiv.className = 'journal-entry collapsed'; // Add 'collapsed' class initially
        entryDiv.id = `week-${index}`;

        const title = document.createElement('h2');
        title.textContent = entry.title;

        // Add toggle icon
        const toggleIcon = document.createElement('button');
        toggleIcon.textContent = '▼'; // Default collapsed icon
        toggleIcon.style.cursor = 'pointer';
        // toggleIcon.style.border = "1px solid #ccc"; 
        toggleIcon.style.backgroundColor = "transparent";
        toggleIcon.style.padding = '0.2rem 0.5rem'; // Add padding for better appearance
        toggleIcon.style.borderRadius = '4px'; // Rounded corners
        toggleIcon.style.marginLeft = '2rem'; // Add spacing
        toggleIcon.addEventListener('click', () => {
          entryDiv.classList.toggle('collapsed');
          toggleIcon.textContent = entryDiv.classList.contains('collapsed') ? '▼' : '▲'; // Update icon based on state
        });

        title.appendChild(toggleIcon); // Append the icon to the title

        const date = document.createElement('p');
        date.className = 'date';
        date.textContent = entry.date;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'content';

        ['whatIDid', 'progress', 'learnings', 'nextWeekGoals'].forEach(section => {
          if (entry[section]) {
            const sectionTitle = document.createElement('h3');
            sectionTitle.textContent = section.charAt(0).toUpperCase() + section.slice(1).replace(/([A-Z])/g, ' $1');
            const sectionContent = document.createElement(entry[section].type === 'list' ? 'ul' : 'p');
            if (entry[section].type === 'list') {
              entry[section].items.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                sectionContent.appendChild(li);
              });
            } else {
              sectionContent.textContent = entry[section].content;
            }
            contentDiv.appendChild(sectionTitle);
            contentDiv.appendChild(sectionContent);
          }
        });

        entryDiv.appendChild(title);
        entryDiv.appendChild(date);
        entryDiv.appendChild(contentDiv);
        journalContainer.appendChild(entryDiv);
      });
    })
    .catch(error => {
      console.error('Error:', error);
      journalContainer.innerHTML = '<p>Failed to load entries. Please try again.</p>';
    });
});