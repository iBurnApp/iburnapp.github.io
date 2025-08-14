# TODO - iBurnApp.com Website Improvements

## Security Updates (Critical)

### 1. Update jQuery (HIGH PRIORITY)
- **Current**: jQuery 1.11.0 (2014)
- **Target**: jQuery 3.7.1 or migrate to vanilla JS
- **Security Issues**: Known XSS vulnerabilities, prototype pollution
- **Impact**: All pages use jQuery

### 2. Update Bootstrap (HIGH PRIORITY)
- **Current**: Bootstrap 3.2.0 (2014)
- **Target**: Bootstrap 5.3.3
- **Security Issues**: Multiple security vulnerabilities fixed since v3
- **Breaking Changes**: Major migration required (grid system, JS components)
- **Alternative**: Consider migrating to a lighter CSS framework

### 3. Update Font Awesome
- **Current**: Font Awesome 4.1.0 (2014)
- **Target**: Font Awesome 6.5.1
- **Benefits**: Many new icons, better performance, tree-shaking support
- **Migration**: Icon class names have changed (fa → fas/far/fab)

## Privacy & Documentation Updates

### 1. Update Privacy Policy
- Remove outdated references:
  - Parse Analytics (deprecated)
  - HockeyApp (now App Center, being sunset)
  - Facebook Pixel (removed in this update)
- Add:
  - Google Analytics 4 disclosure
  - Current data collection practices

### 2. Update CLAUDE.md
- Remove references to:
  - Universal Analytics (replaced with GA4)
  - Facebook Pixel tracking
  - Twitter conversion tracking (not found in code)
- Add:
  - GA4 configuration details
  - Privacy-focused analytics settings

## Performance Improvements

### 1. Use CDNs for Libraries
- Consider using CDN versions with SRI (Subresource Integrity) for:
  - jQuery (if kept)
  - Bootstrap
  - Font Awesome
- Benefits: Better caching across sites, reduced server load

### 2. Optimize Assets
- Minify CSS/JS if not already done
- Optimize images (consider WebP format)
- Implement lazy loading for images

## Modern Web Standards

### 1. Remove IE8/9 Support Code
- Remove HTML5 shiv and Respond.js
- These browsers are long obsolete

### 2. Consider Progressive Enhancement
- Add service worker for offline support
- Implement Web App Manifest for installability

## Analytics Enhancements

### 1. Custom Events (Optional)
- Track app store link clicks
- Track social media interactions
- Track map interactions
- Track deeplink usage

## Notes
- GA4 migration completed on 2025-08-14
- Facebook Pixel removed on 2025-08-14
- All library updates should be tested thoroughly due to breaking changes
- Consider a staging environment for testing major updates