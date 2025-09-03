 
---
id: 1
title: "From RSelenium to Chromote: Modernizing Animint2's Shiny Test Stack"
date: August 10, 2025
description: "A deep dive into migrating browser automation tests in animint2, highlighting challenges, solutions, and lessons learned during GSoC."
contents:"
### From RSelenium to Chromote: Modernizing Animint2's Shiny Test Stack 

Hey everyone! As part of my **GSoC 2025** project with animint2, I've been working on improving the testing infrastructure. One of the key tasks was migrating our tests from **RSelenium** to **Chromote**.

 The Problem with RSelenium
RSelenium has been a staple for browser automation in R, but it comes with baggage. It's often **flaky**, requires a separate Selenium server, and can lead to silent failures especially in CI environments.

 Why Chromote?
Chromote is a lightweight R package that interfaces directly with headless Chrome via the DevTools protocol. It's **faster**, doesn't need external servers, and aligns with modern tools like shinytest2.

Migration Steps
- Inventory tests: examples/shiny, shiny-WorldBank, RMarkdown visualizations  
- Create helpers `start_shiny_app()` and `start_rmd_app()`  
- Use **callr** for background processes  
- Integrate **ChromoteSession** for stability  
- Fix CI workflow issues  

 Results
The suite now runs properly.  
Key lesson: reuse sessions and fixed ports for stability.

Check out the full PR: [GitHub Pull Request](https://github.com/animint/animint2/pull/209)


What's your experience with R testing tools? Feel free to reach out!
"
---

