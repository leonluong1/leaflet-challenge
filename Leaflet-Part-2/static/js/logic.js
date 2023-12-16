const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";
const url2 = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
const plates_url = "https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_plates.json";
const plates_url2 = "./static/PB2002_plates.json";

const colorDomain = [-10, 10, 30, 50, 70, 90];
const colorRange = ["#8cff00", "#a0e41c", "#b3cd38", "#c7b853", "#daa36f", "#ff1400"];
const colorScale = d3.scaleThreshold(colorDomain, colorRange);

function createMap(earthquake_url, plates_url) {
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    let baseMap = {
        Street: street,
        "Topographic Map": topo
    }

    d3.json(earthquake_url).then (earthquakeData => {
        //console.log(earthquakeData.features);
        let earthquakes = L.geoJSON(earthquakeData.features, {
            onEachFeature: createPopup,
            pointToLayer: createMarker
        });

        d3.json(plates_url).then(plateData => {
            let overlayMap = {
                Earthquakes: earthquakes,
                "Tectonic Plates": L.geoJSON(plateData.features, {
                    color: "orange",
                    weight: 2,
                    fillOpacity: 0
                })
            }

            let map = L.map("map", {
                center: [40.73, -74.0059],
                zoom: 3,
                layers: [street, earthquakes]
                
            })

            L.control.layers(baseMap, overlayMap, {
                collapsed: false
            }).addTo(map);

            createLegend(map);
        })
    })
}

/*function createLayer(response) {
    response.then(response => {
        let features = response.features;
        let markers = [];
        features.forEach(feature => {
            let marker = L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], 
                createMarker(feature)).bindPopup(`<h3>Location: ${feature.properties.place}</h3><h3>Magnitude: ${feature.properties.mag}</h3>
                <h3>Depth: ${feature.geometry.coordinates[2]} km</h3><h3>Time: ${new Date(feature.properties.time)}</h3>`);
            markers.push(marker);
        })
        createMap(L.layerGroup(markers));
    })

function createMarker(feature) {
    return {
        radius: (feature.properties.mag**2)*10000,
        color: "black",
        fillColor: colorScale(feature.geometry.coordinates[2]),
        fillOpacity: 1,
        weight: 1
    }
}
}*/

function createPopup(feature, layer) {
    layer.bindPopup(`<h3>Location: ${feature.properties.place}</h3><h3>Magnitude: ${feature.properties.mag}</h3>
        <h3>Depth: ${feature.geometry.coordinates[2]} km</h3><h3>Time: ${new Date(feature.properties.time)}</h3>`);
}

function createMarker(feature, latlng) {
    let options = {
        radius: feature.properties.mag*3,
        color: "black",
        fillColor: colorScale(feature.geometry.coordinates[2]),
        fillOpacity: 1,
        weight: 1
    }
    return L.circleMarker(latlng, options);
}

function createLegend(map) {
    let info = L.control({position: "bottomright"});
    info.onAdd = function() {
        let div = L.DomUtil.create("div", "legend");
        let i = 0;
        div.innerHTML += "<h3 class=legend_header>Depth</h3>";
        colorRange.forEach(color => {
            div.innerHTML += `<svg class=color style=\"background-color: ${color}"></svg>`;
            if (i < colorDomain.length - 1)
                div.innerHTML += `<span class=range>${colorDomain[i]} - ${colorDomain[i+1]} km</span><br>`;
            else
                div.innerHTML += `<span class=range>${colorDomain[i]}+ km</span><br>`;
            i++;
        })
        return div;
    }
    info.addTo(map);
}

createMap(url2, plates_url2);