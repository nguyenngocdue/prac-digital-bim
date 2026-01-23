"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import {
  TilesAttributionOverlay,
  TilesPlugin,
  TilesRenderer,
} from "3d-tiles-renderer/r3f";
import { WGS84_ELLIPSOID } from "3d-tiles-renderer";
import {
  GLTFExtensionsPlugin,
  GoogleCloudAuthPlugin,
  TileCompressionPlugin,
  TilesFadePlugin,
  UpdateOnChangePlugin,
} from "3d-tiles-renderer/plugins";
import { useThree } from "@react-three/fiber";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

const dracoLoader = new DRACOLoader().setDecoderPath(
  "https://www.gstatic.com/draco/v1/decoders/"
);

const googleMapsApiKey =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY ||
  process.env.VITE_GOOGLE_MAP_API_KEY ||
  "";

type GooglePhotorealisticTilesProps = {
  lat: number;
  lon: number;
  altitude?: number;
  heading?: number;
};

const latLonToCartesian = (lat: number, lon: number, altitude = 0) => {
  const a = WGS84_ELLIPSOID.radius.x;
  const b = WGS84_ELLIPSOID.radius.z;
  const e2 = 1 - (b * b) / (a * a);

  const latRad = THREE.MathUtils.degToRad(lat);
  const lonRad = THREE.MathUtils.degToRad(lon);

  const sinLat = Math.sin(latRad);
  const cosLat = Math.cos(latRad);
  const nu = a / Math.sqrt(1 - e2 * sinLat * sinLat);

  const x = (nu + altitude) * cosLat * Math.cos(lonRad);
  const y = (nu + altitude) * cosLat * Math.sin(lonRad);
  const z = (nu * (1 - e2) + altitude) * sinLat;

  return new THREE.Vector3(x, y, z);
};

export const GooglePhotorealisticTiles = ({
  lat,
  lon,
  altitude = 0,
  heading = 0,
}: GooglePhotorealisticTilesProps) => {
  const { camera, gl, size } = useThree();
  const tilesRef = useRef<any>(null);

  const tilesUrl = useMemo(() => {
    if (!googleMapsApiKey) return null;
    return `https://tile.googleapis.com/v1/3dtiles/root.json?key=${googleMapsApiKey}`;
  }, [googleMapsApiKey]);

  const globeTransform = useMemo(() => {
    const ecefPosition = latLonToCartesian(lat, lon, altitude);
    const distance = Math.sqrt(
      ecefPosition.x * ecefPosition.x +
        ecefPosition.y * ecefPosition.y +
        ecefPosition.z * ecefPosition.z
    );
    const lonRad = (((lon + 180) % 360) * Math.PI) / 180;
    const ecefPointNormalized = ecefPosition.clone().normalize();
    const rotationX = -Math.PI / 2;
    const rotationY = Math.PI / 2 - Math.asin(ecefPointNormalized.z);
    const rotationZ = -lonRad;
    return {
      rotation: [rotationX, rotationY, rotationZ] as [number, number, number],
      position: [0, -distance, 0] as [number, number, number],
      headingRotation: (heading * Math.PI) / 180,
    };
  }, [lat, lon, altitude, heading]);

  if (!tilesUrl) {
    return null;
  }

  useEffect(() => {
    camera.near = 0.1;
    camera.far = 1_000_000_000;
    camera.position.set(0, 600, 1200);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  useEffect(() => {
    const tiles = tilesRef.current as any;
    if (!tiles) return;
    tiles.optimizeForLatLon = true;
    tiles.loadSiblings = true;
    tiles.skipLevelOfDetail = true;
    tiles.setCamera(camera);
    tiles.setResolutionFromRenderer(camera, gl);
  }, [camera, gl, size]);

  return (
    <group
      rotation={[
        globeTransform.rotation[0],
        globeTransform.rotation[1] + globeTransform.headingRotation,
        globeTransform.rotation[2],
      ]}
      position={globeTransform.position}
      renderOrder={1}
    >
      <TilesRenderer
        ref={tilesRef}
        dispose={() => true}
        url={tilesUrl}
      >
        <TilesPlugin
          plugin={GoogleCloudAuthPlugin}
          args={[{ apiToken: googleMapsApiKey, autoRefreshToken: true }]}
        />
        <TilesPlugin plugin={GLTFExtensionsPlugin} dracoLoader={dracoLoader} />
        <TilesPlugin plugin={TileCompressionPlugin} />
        <TilesPlugin plugin={UpdateOnChangePlugin} />
        <TilesPlugin plugin={TilesFadePlugin} />
        <TilesAttributionOverlay />
      </TilesRenderer>
    </group>
  );
};
