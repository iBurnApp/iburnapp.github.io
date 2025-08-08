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
            
            // Initialize map with simple style for Burning Man
            this.map = new maplibregl.Map({
                container: this.containerId,
                style: {
                    version: 8,
                    sources: {
                        'brc-tiles': {
                            type: 'raster',
                            tiles: [`pmtiles://${window.location.origin}/data/${this.year}/map/map-${this.year}.pmtiles/{z}/{x}/{y}`],
                            tileSize: 256,
                            attribution: 'iBurn Map Data'
                        }
                    },
                    layers: [
                        {
                            id: 'background',
                            type: 'background',
                            paint: {
                                'background-color': '#f5e6d3' // Playa dust color
                            }
                        },
                        {
                            id: 'brc-map',
                            type: 'raster',
                            source: 'brc-tiles',
                            minzoom: 0,
                            maxzoom: 22
                        }
                    ]
                },
                center: [centerLng, centerLat],
                zoom: 15,
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
                                'background-color': '#f5e6d3'
                            }
                        }
                    ]
                },
                center: [centerLng, centerLat],
                zoom: 15,
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