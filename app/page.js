'use client'

import Image from 'next/image'

import Head from 'next/head'
//import * as React from 'react';
import Map from 'react-map-gl';

import React, { useState, useEffect } from 'react';

import DeckGL from '@deck.gl/react/typed';

import {ScatterplotLayer} from '@deck.gl/layers';
new ScatterplotLayer({});

import {HexagonLayer} from '@deck.gl/aggregation-layers';
new HexagonLayer({});

import {TripsLayer} from '@deck.gl/geo-layers';
new TripsLayer({});


const MAPBOX_TOKEN = 'pk.eyJ1Ijoicm9oaXRndWNjaWphY2tzb24iLCJhIjoiY2xrMHFpZGdjMGV2ZTNkbzMxa241OGhrYyJ9.9gYs1v4W-A3s4tfLcwHJrA'

const getDataset = (city) => {
  switch (city) {
    case 'la':
      return {
        data: 'https://data.lacity.org/resource/6rrh-rzua.json?$limit=150000&$WHERE=within_box(location_1, 33.7035, -118.6682, 34.8233, -117.6464) AND location_1 IS NOT NULL',
        getPosition: d => [parseFloat(d.location_1.longitude), parseFloat(d.location_1.latitude)],
      };
    case 'nyc':
      return {
        data: 'https://data.cityofnewyork.us/resource/5rq2-4hqu.json?$limit=50000&boroname=Manhattan',
        getPosition: d => [parseFloat(d.longitude), parseFloat(d.latitude)],
      };
    default:
      throw new Error('Invalid dataset!');
  }
};


const hexagonLayer = (city) => {
  const dataset = getDataset(city);
  return new HexagonLayer({
    id: 'hexagon-layer',
    data: dataset.data,
    getPosition: dataset.getPosition,
    pickable: true,
    extruded: true,
    radius: 75,
    elevationScale: 10,
    opacity: 0.2, 
    colorRange: [
      [255,255,178],
      [254,217,118],
      [254,178,76],
      [253,141,60],
      [240,59,32],
      [189, 0, 38],
    ],
  });
};

const scatterplotLayer = (city) => {
  const dataset = getDataset(city);
  return new ScatterplotLayer({
    id: 'scatterplot-layer',
    data: dataset.data,
    getPosition: dataset.getPosition,
    getRadius: d => Math.sqrt(d.exits),
    pickable: true,
    opacity: 0.8,
    stroked: true,
    filled: true,
    radiusScale: 6,
    radiusMinPixels: 1,
    radiusMaxPixels: 100,
    lineWidthMinPixels: 1,
    getFillColor: d => [255, 140, 0],
    getLineColor: d => [255, 0, 0],
  });
};


export default function Home() {

  const [selectedDataset, setSelectedDataset] = useState('nyc');
  const [selectedLayer, setSelectedLayer] = useState('scatterplot');


  //const layer = selectedLayer === 'scatterplot' ? scatterplotLayer(selectedDataset) : hexagonLayer(selectedDataset);

  const [layers, setLayers] = useState([]);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    switch (selectedLayer) {
      case 'scatterplot':
        if (ref) clearInterval(ref);
        setLayers([scatterplotLayer(selectedDataset)]);
        break;
      case 'hexagon':
        if (ref) clearInterval(ref);
        setLayers([hexagonLayer(selectedDataset)]);
        break;
      case 'trips':
        const timer = setInterval(() => { 
          setLayers([
            new TripsLayer({
              id: 'trips',
              data:
                'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/trips-v7.json',
              getPath: (d) => {
                return d.path;
              },
              getTimestamps: (d) => {
                return d.timestamps;
              },
              getColor: (d) => {
                return d.vendor === 0 ? [252, 192, 30] : [23, 184, 190];
              },
              opacity: 0.8,
              widthMinPixels: 4,
              rounded: true,
              trailLength: 180,
              currentTime: (performance.now() % 20000) / 10,
              shadowEnabled: false,
            }),
          ]);
        }, 50);
        console.log({ timer });
        setRef(timer);
        break;
      default:
        throw new Error('Invalid layer');
    }
  }, [selectedLayer, selectedDataset]);



  const handleLayerChange = (x) => {
    const newSelectedLayer = x.target.value;
    setSelectedLayer(newSelectedLayer);
  };

  const handleDatasetChange = (x) => {
    const newSelectedDataset = x.target.value;
    setSelectedDataset(newSelectedDataset);
  };

  return (
    <main>

      <DeckGL
          layers={[layers]}
          controller
          initialViewState={{
            longitude: -74.0021069,
            latitude: 40.7423867,
            zoom: 12
          }}
          id="deckgl-overlay"
        >
          <div style={{ position: 'absolute', height: 60, width: '100%', backgroundColor: 'rgba(174, 182, 191, 0.2)', justifyContent: 'center',display: 'flex', flexDirection: 'row', alignItems: 'center', padding: 16, gap: 8 }}>
            <h2 style={{color:'#FFA500'}}>Choose your Layer and Data!</h2> <br/>
            <select onChange={handleLayerChange} value={selectedLayer} style={{ backgroundColor: 'rgba(174, 182, 191, 0.2)', color: '#FFA500', padding: '8px', border: 'none' }}>
              <option value="scatterplot">Scatterplot Layer</option>
              <option value="hexagon" >Hexagon Layer</option>
              <option value="trips" >Traffic Layer</option>
            </select>
            <span style={{color:'#FFA500'}}>Dataset: </span>
              {selectedLayer === 'trips' ? (
                <div style={{color:'#FFA500'}}>NYC</div>
              ) : (
              <select onChange={handleDatasetChange} value={selectedDataset} style={{ backgroundColor: 'rgba(174, 182, 191, 0.2)', color: '#FFA500', padding: '8px', border: 'none' }}>
                <option value="la">LA Active Businesses</option>
                <option value="nyc">NYC Trees</option>
              </select>
            )}
          </div>
          <Map
            mapboxAccessToken={MAPBOX_TOKEN}
            style={{ width: '100vw', height: '100vh' }}
            mapStyle="mapbox://styles/mapbox/dark-v9"
          />
        </DeckGL>



      <Head>
        <title>WebGL visualization</title>
        <meta name="description" content="Visualize Traffic Dataset with WebGL" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
          zoom: 14
        }}
        style={{width: '100vw', height: '100vh'}}
        mapStyle="mapbox://styles/mapbox/dark-v9"
      /> */}
    </main>
  )
}
