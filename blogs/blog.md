 
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

---
id: 2
title: "How to Contribute to Animint2"
date: August 23, 2025
description: "A short, hands-on guide for new contributors: quick context + an actionable checklist to clone, run, edit, test, build, publish gallery entries, and open a PR."
contents:"

# How to Contribute to Animint2

Contributing to animint2 is a great way to learn R package development and interactive visualization. Animint2 is an R package for animated, interactive graphics inspired by ggplot2.

## Quick Start Checklist

### Step 1: Set Up Your Environment

```
git clone https://github.com/animint/animint2.git
cd animint2
```

```
# Install dependencies
remotes::install_deps(dependencies = TRUE)
devtools::load_all()
```

### Step 2: Choose a Small Task

Start with something manageable:

* Add documentation
* Add a simple unit test

### Step 3: Make Your Changes

Edit files in these directories:

* **R code:** `R/` folder
* **JavaScript/HTML:** `inst/htmljs/` folder
* **Tests:** `tests/testthat/` folder

### Step 4: Add Tests

Write tests using `testthat`. For browser tests, use Chromote-based integration (these run on CI).

### Step 5: Build and Check

```
R CMD build .
R CMD check animint2_*.tar.gz
```

### Step 6: Run Tests [ref](https://github.com/animint/animint2/wiki/Testing)

From `animint2/tests/testthat`:

```
library(testthat)
library(animint2)
library(RSelenium)
library(XML)

source("helper-functions.R")
source("helper-HTML.R")
source("helper-plot-data.r")

# initialize chromote + server
tests_init()

# run all tests
tests_run()

# run specific tests
tests_run(filter="axis-rotate")

# run only renderer tests
tests_run(filter="renderer")
```

## Test Categories

* **CRAN tests:** Fast checks for CRAN compatibility
* **Renderer tests:** DOM/SVG validation using Chromote
 **Compiler tests:** Output validation from `animint2dir()` and `animint2pages()`

 and You can also run a specific file with ` testthat::test_file("filename")`

### Step 7: Submit Your Contribution

1. Commit your changes
2. Push to your fork
3. Open a pull request

**Include in your PR:**

* What you changed
* Why it helps
* A minimal example showing your changes

## Core Development Loop

Remember: **clone → run → fix → test → PR**

Keep changes small and focused for easier review.

## Adding a Data Visualization to the Gallery [ref](https://github.com/animint/gallery/)

### Make a Data Viz

1. **Install animint2 (>= 2023.11.21):**

```
install.packages("animint2")
# or development version:
remotes::install_github("animint/animint2")
```

2. **Create a viz object:**

```
viz <- animint(
  ggplots,
  title = "data viz title",
  source = "https://link.to/your_code.R"
)
```

*Options:*

* **title:** A short description of your viz.
* **source:** URL linking to your code (required for gallery).

3. **Deploy to GitHub Pages:**

```
animint2pages(viz, "new_github_repo")
```

This creates a GitHub repository with your viz deployed in the `gh-pages` branch.

4. **Add a screenshot:** Take a screenshot of your viz, save as `Capture.PNG`, and add it to the `gh-pages` branch.

### Add Your Data Viz to the Gallery

1. **Fork the gallery repo:** Fork `animint/gallery` and ensure it has a `gh-pages` branch.

2. **Clone your fork:**

```
git clone git@github.com:YOUR_GITHUB_USERNAME/gallery ~/R/gallery
```

3. **Add your repo:** Append `YOUR_GITHUB_USERNAME/new_github_repo` to `repos.txt` (use the same repo name from `animint2pages`).

4. **Update and push:**

```
animint2::update_gallery()
```

5. **Preview & PR:** After a few minutes, your gallery will be visible at:

```
https://YOUR_GITHUB_USERNAME.github.io/gallery/
```

Then open a pull request from your fork's `gh-pages` branch to `animint/gallery:gh-pages`. Include the preview URL in your PR description so reviewers can see the rendered gallery.


## Tips for Success

* **Keep PRs small:** Small, focused changes are easier to review
* **Provide examples:** Include reproducible examples in your PR
* **Use live previews:** Deploy with `animint2pages()` and GitHub Pages to show your work
* **Write tests:** Use existing helper functions in `tests/testthat/helper-*.R`
* **Check coverage:** Use Codecov reports to identify areas needing tests

## Getting Help

* Browse existing issues on GitHub
* Check the gallery for examples
* Review helper functions in the test suite
* Start with documentation improvements if you're new to the codebase

### Happy contributing! 🎉
"
---
