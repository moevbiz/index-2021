import 'leaflet';
import "leaflet-active-area";
import { LatLng } from 'leaflet';

const mapOptions = {
    zoomControl: false,
    minZoom: 11,
    // maxBounds: L.latLngBounds(corner1, corner2),
}

export class Map {
    constructor(selector, data) {
        this.$map = L.map(selector, mapOptions)
        .setView([48.2082, 16.3738], 13)
        .setActiveArea('activeArea', true, true)

        L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/256/{z}/{x}/{y}@2x?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            id: 'independentspaceindex/ckq0l4uvd0is918k0ksrqdrcq',
            accessToken: 'pk.eyJ1IjoiaW5kZXBlbmRlbnRzcGFjZWluZGV4IiwiYSI6ImNrNW1tbjA5bDAza24zZXBkanFlc2ppcTQifQ.JnL1exWS78WBLlZrXn6BuQ'
        }).addTo(this.$map);

        this.markers = [];
        this.data = data;

        this.init();
    }
    
    addMarkers() {
        this.markerLayerGroup = L.featureGroup();
        this.data.forEach(dat => {
            let marker = L.marker(new LatLng(dat.lat, dat.lng), {
                title: dat.uid,
                icon: L.divIcon({
                    className: `marker-icon`,
                    html: `<span>${dat.name}</span>`,
                    iconSize: new L.Point(20, 20),
                }),
            });
            this.markers.push(marker);
            this.markerLayerGroup.addLayer(marker);
            // marker.addTo(this.$map);
        });
        this.markerLayerGroup.addTo(this.$map);
        // this.$map.setMaxBounds(this.markerLayerGroup.getBounds())
    }
    init() {
        this.addMarkers();
    }
}