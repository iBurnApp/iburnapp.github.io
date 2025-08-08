// Map Viewer with PMTiles support
class MapViewer {
    constructor(containerId, year = '2025') {
        this.containerId = containerId;
        this.year = year;
        this.map = null;
    }
    
    async initialize(centerLat, centerLng, markerTitle) {
        return this.initializeWithZoom(centerLat, centerLng, markerTitle, 14);
    }
    
    async initializeWithZoom(centerLat, centerLng, markerTitle, zoom) {
        try {
            // Register PMTiles protocol
            let protocol = new pmtiles.Protocol();
            maplibregl.addProtocol('pmtiles', protocol.tile);
            
            // Load the style JSON
            const styleUrl = `/data/${this.year}/map/styles/iburn-light.json`;
            const styleResponse = await fetch(styleUrl);
            const style = await styleResponse.json();
            
            // Remove sprite reference since we'll load images directly
            delete style.sprite;
            
            // Fix relative URLs for glyphs based on current location
            const baseUrl = window.location.origin;
            if (style.glyphs && !style.glyphs.startsWith('http')) {
                style.glyphs = baseUrl + style.glyphs;
            }
            
            // Initialize map with iBurn vector style
            this.map = new maplibregl.Map({
                container: this.containerId,
                style: style,
                center: [centerLng, centerLat],
                zoom: zoom,
                attributionControl: false
            });
            
            // Add navigation controls
            this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
            
            // Load pin images when map is ready
            this.map.on('load', async () => {
                await this.loadPinImages();
            });
            
            // Add marker only if markerTitle is provided
            if (markerTitle) {
                new maplibregl.Marker({ color: '#ff0000' })
                    .setLngLat([centerLng, centerLat])
                    .setPopup(new maplibregl.Popup().setHTML(`<b>${markerTitle}</b>`))
                    .addTo(this.map);
            }
            
            // Handle map errors
            this.map.on('error', (e) => {
                console.error('Map error:', e);
                // Try simpler fallback without PMTiles
                this.fallbackMap(centerLat, centerLng, markerTitle);
            });
            
        } catch (error) {
            console.error('Failed to initialize map:', error);
            // Try simpler fallback
            this.fallbackMap(centerLat, centerLng, markerTitle);
        }
    }
    
    fallbackMap(centerLat, centerLng, markerTitle) {
        // Simple fallback map without PMTiles
        try {
            this.map = new maplibregl.Map({
                container: this.containerId,
                style: {
                    version: 8,
                    sources: {},
                    layers: [
                        {
                            id: 'background',
                            type: 'background',
                            paint: {
                                'background-color': '#E8E0D8' // Playa dust color from iBurn
                            }
                        }
                    ]
                },
                center: [centerLng, centerLat],
                zoom: 14,
                attributionControl: false
            });
            
            // Add simple circle to show location
            this.map.on('load', () => {
                this.map.addSource('point', {
                    'type': 'geojson',
                    'data': {
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': [centerLng, centerLat]
                        }
                    }
                });
                
                this.map.addLayer({
                    'id': 'point',
                    'type': 'circle',
                    'source': 'point',
                    'paint': {
                        'circle-radius': 10,
                        'circle-color': '#ff0000'
                    }
                });
            });
            
            // Add marker only if markerTitle is provided
            if (markerTitle) {
                new maplibregl.Marker({ color: '#ff0000' })
                    .setLngLat([centerLng, centerLat])
                    .setPopup(new maplibregl.Popup().setHTML(`<b>${markerTitle}</b>`))
                    .addTo(this.map);
            }
                
        } catch (fallbackError) {
            console.error('Fallback map also failed:', fallbackError);
            // Hide map if it completely fails
            document.getElementById('map-container').style.display = 'none';
        }
    }
    
    async loadPinImages() {
        // Map the exact pin names from iOS code
        const imageMap = {
            'Airport': 'airport',
            'Rampart': 'EmergencyClinic',
            'Center Camp Plaza': 'centerCamp',
            'center': 'center',
            'Burner Express Bus Depot': 'bus',
            'Station 3': 'firstAid',
            'Station 9': 'firstAid',
            'Playa Info': 'info',
            'Ranger Station Berlin': 'ranger',
            'Ranger Station Tokyo': 'ranger',
            'Ranger HQ': 'ranger',
            'Ice Nine Arctica': 'ice',
            'Arctica Center Camp': 'ice',
            'Ice Cubed Arctica 3': 'ice',
            'The Temple': 'temple',
            'toilet': 'toilet',
            'Artery': 'artery',
            'Yellow Bike Project': 'bike',
            'Hell Station': 'fuel',
            'Census Checkpoint': 'census',
            'BLM LE Substation': 'police',
            'Gate Actual': 'gate',
            'Box Office': 'boxOffice',
            'Greeters': 'greeters',
            // Additional common variations
            'The Man': 'center',
            'Temple': 'temple',
            'Center Camp': 'centerCamp',
            'First Aid': 'firstAid',
            'Medical': 'EmergencyClinic',
            'Emergency Clinic': 'EmergencyClinic',
            'Ice': 'ice',
            'Rangers': 'ranger',
            'Recycle': 'recycle',
            'Burner Express': 'bus'
        };
        
        const targetSize = 40; // Target size in pixels (higher for better quality, will be scaled by MapLibre)
        const loadedImages = {}; // Cache loaded images
        
        for (const [name, imageName] of Object.entries(imageMap)) {
            try {
                // Check if we already loaded this image file
                let image;
                if (loadedImages[imageName]) {
                    image = loadedImages[imageName];
                } else {
                    image = await this.loadImage(`/assets/images/pins/${imageName}.png`, targetSize);
                    loadedImages[imageName] = image;
                }
                
                if (image && !this.map.hasImage(name)) {
                    this.map.addImage(name, image);
                }
            } catch (error) {
                console.warn(`Failed to load pin image ${name} (${imageName}):`, error);
            }
        }
    }
    
    loadImage(url, targetSize = 30) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                // Scale image to target size
                const scale = targetSize / Math.max(img.width, img.height);
                const width = Math.round(img.width * scale);
                const height = Math.round(img.height * scale);
                
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const context = canvas.getContext('2d');
                context.drawImage(img, 0, 0, width, height);
                const imageData = context.getImageData(0, 0, width, height);
                resolve({
                    width: width,
                    height: height,
                    data: new Uint8Array(imageData.data)
                });
            };
            img.onerror = reject;
            img.src = url;
        });
    }
}