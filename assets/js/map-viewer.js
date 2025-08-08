// Map Viewer with PMTiles support
class MapViewer {
    constructor(containerId, year = '2025') {
        this.containerId = containerId;
        this.year = year;
        this.map = null;
    }
    
    async initialize(centerLat, centerLng, markerTitle) {
        try {
            // Register PMTiles protocol
            let protocol = new pmtiles.Protocol();
            maplibregl.addProtocol('pmtiles', protocol.tile);
            
            // Load the style JSON
            const styleUrl = `/data/${this.year}/map/styles/iburn-light.json`;
            const styleResponse = await fetch(styleUrl);
            const style = await styleResponse.json();
            
            // Initialize map with iBurn vector style
            this.map = new maplibregl.Map({
                container: this.containerId,
                style: style,
                center: [centerLng, centerLat],
                zoom: 14,
                attributionControl: false
            });
            
            // Add navigation controls
            this.map.addControl(new maplibregl.NavigationControl(), 'top-right');
            
            // Add marker
            new maplibregl.Marker({ color: '#ff0000' })
                .setLngLat([centerLng, centerLat])
                .setPopup(new maplibregl.Popup().setHTML(`<b>${markerTitle}</b>`))
                .addTo(this.map);
            
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
            
            // Add marker
            new maplibregl.Marker({ color: '#ff0000' })
                .setLngLat([centerLng, centerLat])
                .setPopup(new maplibregl.Popup().setHTML(`<b>${markerTitle}</b>`))
                .addTo(this.map);
                
        } catch (fallbackError) {
            console.error('Fallback map also failed:', fallbackError);
            // Hide map if it completely fails
            document.getElementById('map-container').style.display = 'none';
        }
    }
}