# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the marketing website for iBurnApp.com, a Burning Man mobile app. The site is built with Jekyll and hosted on GitHub Pages, serving as a landing page to promote the iOS and Android apps.

## Development Commands

### Setup
```bash
bundle install
```

### Local Development
```bash
bundle exec jekyll serve
```
This starts a local development server, typically at http://localhost:4000

## Architecture

### Jekyll Structure
- `_config.yml` - Jekyll configuration with site metadata, analytics IDs, and social media handles
- `_includes/` - Reusable HTML partials:
  - `head.html` - HTML head with analytics (Google, Facebook, Twitter)
  - `intro_header.html` - Hero section with app download links
  - `banner_footer.html` - Call-to-action banner and footer
  - `social_buttons.html` - Social media buttons component
- `index.html` - Main landing page with Jekyll front matter
- `privacy.html` - Privacy policy page

### Static Assets
- `css/` - Bootstrap and custom landing page styles
- `js/` - jQuery and Bootstrap JavaScript
- `font-awesome-4.1.0/` - Font Awesome icon library
- `img/` - Screenshots, app store badges, background images
- `fonts/` - Web fonts

### Content Strategy
The site promotes three key features:
1. Accurate offline mapping of Burning Man
2. Intelligent event guide with 2,300+ events
3. Free and open source software philosophy

### Third-Party Integrations
- Google Analytics (ID in _config.yml)
- Facebook Pixel tracking
- Twitter conversion tracking
- App Store and Google Play download links

## Key Files to Modify

### Content Updates
- `_config.yml` - Update year, analytics IDs, social handles
- `_includes/intro_header.html` - Update main headline and year
- `index.html` - Update feature descriptions and statistics
- `_includes/banner_footer.html` - Update copyright year

### Styling
- `css/landing-page.css` - Custom styles for the landing page
- Background images in `img/` directory

## GitHub Pages Deployment

The site automatically deploys to GitHub Pages when changes are pushed to the master branch. No build step required beyond Jekyll's built-in processing.