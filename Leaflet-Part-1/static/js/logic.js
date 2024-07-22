function createMap() {
// Create a map object.
    let myMap = L.map("map", {
        center: [15.5994, -28.6731],
        zoom: 3
    });

    // Define tile layers
    let streetMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(myMap);

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // Default layer
    streetMap.addTo(myMap);

    // Create a base layers object
    let baseLayers = {
        "Street Map": streetMap,
        "Topographical Map": topo,
    };

    // Add layer control
    L.control.layers(baseLayers).addTo(myMap);

    return myMap; // Return the map object
}

// Call createMap to initialize the map
let myMap = createMap();

// Define getColor function to return color based on depth
function getColor(depth) {
    return depth > 300 ? "#800026" :
           depth > 100 ? "#BD0026" :
           depth > 50  ? "#E31A1C" :
           depth > 20  ? "#FC4E2A" :
           depth > 10  ? "#FD8D3C" :
                         "#FEB24C";
}

function createMarkers(response) {
    let earthquakes = response.features;

    earthquakes.forEach(function (earthquake) {
        // Extract earthquake properties
        let magnitude = earthquake.properties.mag;
        let depth = earthquake.geometry.coordinates[2];
        let location = earthquake.properties.place;
        let coordinates = [earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]];

        // Determine color based on depth using getColor function
        let color = getColor(depth);

        // Create marker options
        let markerOptions = {
            radius: Math.sqrt(magnitude) * 5, // Adjust the radius based on magnitude
            fillColor: color,
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        };

        // Create marker and bind popup
        let marker = L.circleMarker(coordinates, markerOptions)
            .bindPopup(`<h3>${location}</h3><hr><p>Magnitude: ${magnitude}<br>Depth: ${depth}</p>`)
            .addTo(myMap);
    });

    // Create a legend
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'info legend');
        let depths = [-10, 10, 20, 50, 100, 300];
        
        // Title for the legend
        div.innerHTML += '<h4>Depth Legend</h4>';

        // loop through depth intervals and generate a label with a colored square for each interval
        for (let i = 0; i < depths.length; i++) {
            div.innerHTML +=
                '<div class="legend-item"><i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
                depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '</div><br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);
}

// Perform API call to USGS API and call createMarkers when it completes
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(createMarkers);

fetch('PB2002_boundaries.json')
.then(response => response.json())
.then(geojsonData => {
    // Add the GeoJSON data to the map
    L.geoJSON(geojsonData, {
        style: function (feature) {
            return { color: 'blue', weight: 2.5, opacity: 1 };
        }
    }).addTo(myMap);
})
.catch(error => console.error('Error loading the GeoJSON data:', error));