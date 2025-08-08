// Deep Link Handler - Main Logic
(function() {
    'use strict';
    
    const DEEP_LINK_TIMEOUT = 2500; // ms to wait before showing fallback
    const BRC_CENTER = { lat: 40.7864, lng: -119.2065 }; // The Man
    
    class DeepLinkHandler {
        constructor() {
            this.type = window.DEEPLINK_TYPE || 'unknown';
            this.params = new URLSearchParams(window.location.search);
            this.uid = this.extractUid();
            this.metadata = this.extractMetadata();
            this.year = this.params.get('year') || '2025';
            
            this.init();
        }
        
        extractUid() {
            // Get UID from query parameter instead of path
            return this.params.get('uid') || this.params.get('id') || null;
        }
        
        extractMetadata() {
            const metadata = {};
            for (const [key, value] of this.params.entries()) {
                metadata[key] = decodeURIComponent(value);
            }
            return metadata;
        }
        
        init() {
            // Update page metadata
            this.updatePageMeta();
            
            // Attempt deep link
            this.attemptDeepLink();
            
            // Setup fallback UI
            setTimeout(() => this.showFallback(), DEEP_LINK_TIMEOUT);
            
            // Setup event handlers
            this.setupEventHandlers();
        }
        
        updatePageMeta() {
            const title = this.metadata.title || `iBurn ${this.type}`;
            const description = this.metadata.desc || 'View on iBurn - Offline Map and Guide for Burning Man';
            const url = window.location.href;
            
            // Update meta tags
            document.getElementById('page-title').textContent = title;
            document.getElementById('meta-description').content = description;
            document.getElementById('og-title').content = title;
            document.getElementById('og-description').content = description;
            document.getElementById('og-url').content = url;
            document.getElementById('twitter-title').content = title;
            document.getElementById('twitter-description').content = description;
            
            // Update iOS Smart App Banner
            if (this.uid) {
                const appArgument = `iburn://${this.type}/${this.uid}`;
                document.getElementById('ios-app-banner').content = 
                    `app-id=388169740, app-argument=${appArgument}`;
            }
        }
        
        buildDeepLinkUrl() {
            let deepLink = `iburn://`;
            
            if (this.type === 'pin') {
                // Pin uses query parameters
                deepLink += `pin?${this.params.toString()}`;
            } else if (this.uid) {
                // Build path with UID
                deepLink += `${this.type}/${this.uid}`;
                // Add other parameters (excluding uid/id)
                const otherParams = new URLSearchParams();
                for (const [key, value] of this.params.entries()) {
                    if (key !== 'uid' && key !== 'id') {
                        otherParams.append(key, value);
                    }
                }
                if (otherParams.toString()) {
                    deepLink += `?${otherParams.toString()}`;
                }
            }
            
            return deepLink;
        }
        
        attemptDeepLink() {
            const deepLink = this.buildDeepLinkUrl();
            console.log('Attempting deep link:', deepLink);
            
            // Method 1: iframe (works on iOS)
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = deepLink;
            document.body.appendChild(iframe);
            
            // Method 2: location change (works on Android)
            setTimeout(() => {
                window.location.href = deepLink;
            }, 100);
            
            // Method 3: Intent URL for Android Chrome
            if (navigator.userAgent.match(/Android/i)) {
                const intentUrl = this.buildAndroidIntentUrl();
                setTimeout(() => {
                    window.location.href = intentUrl;
                }, 200);
            }
        }
        
        buildAndroidIntentUrl() {
            const deepLink = this.buildDeepLinkUrl();
            const encoded = encodeURIComponent(deepLink);
            return `intent://${deepLink.replace('iburn://', '')}#Intent;scheme=iburn;package=com.iburnapp.iburn3;S.browser_fallback_url=${encodeURIComponent(window.location.href)};end`;
        }
        
        showFallback() {
            // Hide loading, show content
            document.getElementById('loading-state').style.display = 'none';
            document.getElementById('content-preview').style.display = 'block';
            
            // Populate content
            this.populateContent();
            
            // Load image if available
            this.loadImage();
            
            // Initialize map if coordinates available
            if (this.metadata.lat && this.metadata.lng) {
                this.initializeMap();
            }
        }
        
        populateContent() {
            // Title
            const title = this.metadata.title || `${this.type} ${this.uid || ''}`.trim();
            document.getElementById('content-title').textContent = title;
            
            // Description
            if (this.metadata.desc) {
                document.getElementById('content-description').textContent = this.metadata.desc;
            }
            
            // Location
            if (this.metadata.addr) {
                document.getElementById('location-text').textContent = this.metadata.addr;
            } else if (this.metadata.lat && this.metadata.lng) {
                document.getElementById('location-text').textContent = 
                    `${parseFloat(this.metadata.lat).toFixed(4)}, ${parseFloat(this.metadata.lng).toFixed(4)}`;
            } else {
                document.getElementById('content-location').style.display = 'none';
            }
            
            // Event-specific details
            if (this.type === 'event') {
                this.populateEventDetails();
            }
        }
        
        populateEventDetails() {
            const eventDetails = document.getElementById('event-details');
            
            if (this.metadata.host) {
                document.getElementById('event-host').innerHTML = 
                    `<i class="fa fa-users"></i> Hosted by ${this.metadata.host}`;
            }
            
            if (this.metadata.start || this.metadata.end) {
                const timeText = this.formatEventTime();
                document.getElementById('event-time').innerHTML = 
                    `<i class="fa fa-clock-o"></i> ${timeText}`;
            }
            
            if (this.metadata.host || this.metadata.start) {
                eventDetails.style.display = 'block';
            }
        }
        
        formatEventTime() {
            const options = { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric', 
                hour: 'numeric', 
                minute: '2-digit' 
            };
            
            if (this.metadata.all_day === 'true') {
                return 'All Day Event';
            }
            
            let timeText = '';
            if (this.metadata.start) {
                const startDate = new Date(this.metadata.start);
                timeText = startDate.toLocaleString('en-US', options);
            }
            
            if (this.metadata.end) {
                const endDate = new Date(this.metadata.end);
                timeText += ' - ' + endDate.toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit' 
                });
            }
            
            return timeText;
        }
        
        loadImage() {
            // Determine image ID
            let imageId = this.uid;
            
            // For events, use host's image
            if (this.type === 'event' && this.metadata.host_id) {
                imageId = this.metadata.host_id;
            }
            
            // Skip for pins
            if (this.type === 'pin' || !imageId) {
                return;
            }
            
            const imageUrl = `/data/${this.year}/images/${imageId}.jpg`;
            const img = new Image();
            
            img.onload = () => {
                document.getElementById('preview-image').src = imageUrl;
                document.getElementById('preview-image').style.display = 'block';
                document.getElementById('image-placeholder').style.display = 'none';
                
                // Update social media image
                document.getElementById('og-image').content = window.location.origin + imageUrl;
                document.getElementById('twitter-image').content = window.location.origin + imageUrl;
            };
            
            img.onerror = () => {
                console.log('Image not found:', imageUrl);
                // Keep placeholder visible
            };
            
            img.src = imageUrl;
        }
        
        initializeMap() {
            const lat = parseFloat(this.metadata.lat);
            const lng = parseFloat(this.metadata.lng);
            
            if (isNaN(lat) || isNaN(lng)) {
                return;
            }
            
            document.getElementById('map-container').style.display = 'block';
            
            // Initialize map viewer (defined in map-viewer.js)
            const mapViewer = new MapViewer('map', this.year);
            mapViewer.initialize(lat, lng, this.metadata.title || 'Location');
        }
        
        setupEventHandlers() {
            // Open app button
            document.getElementById('open-app-btn').addEventListener('click', () => {
                this.attemptDeepLink();
            });
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => new DeepLinkHandler());
    } else {
        new DeepLinkHandler();
    }
})();