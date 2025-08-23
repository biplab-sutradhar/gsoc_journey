 
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

### Step 2: Run Tests

```
animint2:::tests_init()
animint2:::tests_run()
```

### Step 3: Choose a Small Task

Start with something manageable:
- Fix a documentation typo
- Port a gallery example
- Improve a JavaScript tooltip
- Add a simple unit test

### Step 4: Make Your Changes

Edit files in these directories:
- **R code:** `R/` folder
- **JavaScript/HTML:** `inst/htmljs/` folder
- **Tests:** `tests/testthat/` folder

### Step 5: Add Tests

Write tests using `testthat`. For browser tests, use Chromote-based integration (these run on CI).

### Step 6: Build and Check

```
R CMD build .
R CMD check animint2_*.tar.gz
```

### Step 7: Submit Your Contribution

1. Commit your changes
2. Push to your fork
3. Open a pull request

**Include in your PR:**
- What you changed
- Why it helps
- A minimal example showing your changes

## Core Development Loop

Remember: **clone → run → fix → test → PR**

Keep changes small and focused for easier review.

## Adding a Data Visualization to the Gallery

### Create Your Visualization

1. **Install animint2:**

```
install.packages("animint2")
# or development version:
remotes::install_github("animint/animint2")
```

2. **Create your visualization:**

```
viz <- animint(
  list_of_ggplots,
  title = "My Visualization",
  source = "https://link.to/your_code.R"
)
```
*Note: The `source` parameter should link to your code so others can review it.*

3. **Deploy your visualization:**

```
animint2pages(viz, "your_new_repo_name")
```

4. **Add a screenshot:** Place a file named `Capture.PNG` in the `gh-pages` branch of your repository.

### Add to the Official Gallery

1. **Fork the gallery:** Fork `animint/gallery` and ensure it has a `gh-pages` branch

2. **Clone your fork:**

```
git clone git@github.com:YOUR_USERNAME/gallery ~/R/gallery
```

3. **Add your repository:** Add `YOUR_USERNAME/your_new_repo_name` to `repos.txt`

4. **Update the gallery:**

```
animint2::update_gallery()
```

5. **Submit:** Push changes and open a PR from your fork's `gh-pages` to `animint/gallery` `gh-pages`. Include the preview URL.

## Testing with Chromote

### Requirements

- Google Chrome (not Chromium)
- Chromote package
- RStudio 2024.04.0+735 or later

### Setup

```
install.packages("chromote")
remotes::install_github("animint/animint2@chromote-testing")
```

### Running Tests

From `animint2/tests/testthat`:

```
library(testthat)
library(animint2)
library(RSelenium)
library(XML)

source("helper-functions.R")
source("helper-HTML.R")
source("helper-plot-data.r")

tests_init()
tests_run()
```

View test results at: `http://localhost:4848/animint-htmltest/`

## Test Categories

- **CRAN tests:** Fast checks for CRAN compatibility
- **Renderer tests:** DOM/SVG validation using Chromote
- **Compiler tests:** Output validation from `animint2dir()` and `animint2pages()`

## Tips for Success

- **Keep PRs small:** Small, focused changes are easier to review
- **Provide examples:** Include reproducible examples in your PR
- **Use live previews:** Deploy with `animint2pages()` and GitHub Pages to show your work
- **Write tests:** Use existing helper functions in `tests/testthat/helper-*.R`
- **Check coverage:** Use Codecov reports to identify areas needing tests

## Getting Help

- Browse existing issues on GitHub
- Check the gallery for examples
- Review helper functions in the test suite
- Start with documentation improvements if you're new to the codebase

Happy contributing! 🎉
"
---
