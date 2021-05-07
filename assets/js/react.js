import { EsriProvider } from 'leaflet-geosearch';
const provider = new EsriProvider();
// add to leaflet
import { GeoSearchControl } from 'leaflet-geosearch';
map.addControl(
    new GeoSearchControl({
        provider,
    }),
);