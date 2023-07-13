'use client'

import Image from 'next/image'

import Head from 'next/head'
import * as React from 'react';
import Map from 'react-map-gl';

import DeckGL from '@deck.gl/react/typed';
import {ScatterplotLayer} from '@deck.gl/layers/typed';

const MAPBOX_TOKEN = 'pk.eyJ1Ijoicm9oaXRndWNjaWphY2tzb24iLCJhIjoiY2xrMHFpZGdjMGV2ZTNkbzMxa241OGhrYyJ9.9gYs1v4W-A3s4tfLcwHJrA'


export default function Home() {
  return (
    <main>

      <Head>
        <title>WebGL visualization</title>
        <meta name="description" content="Visualize Traffic Dataset with WebGL" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
          zoom: 14
        }}
        style={{width: '100vw', height: '100vh'}}
        mapStyle="mapbox://styles/mapbox/dark-v9"
      />
    </main>
  )
}
