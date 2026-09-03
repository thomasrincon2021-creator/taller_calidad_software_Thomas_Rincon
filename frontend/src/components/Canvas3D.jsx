import React, { Suspense, useLayoutEffect, useMemo, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, useTexture, Decal, Environment } from '@react-three/drei';
import * as THREE from 'three';

function DecalRender({ url }) {
  const texture = useTexture(url);

  useEffect(() => {
    if (texture) {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    }
  }, [texture]);

  return (
    <Decal
      position={[0, 0.35, 0.15]} 
      rotation={[0, 0, 0]}
      scale={[0.3, 0.3, 0.3]}
      map={texture}
    />
  );
}

function EstampadoPecho({ file }) {
  const [textureUrl, setTextureUrl] = useState(null);

  useEffect(() => {
    if (!file) {
      setTextureUrl(null);
      return;
    }
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setTextureUrl(url);
      return () => URL.revokeObjectURL(url);
    } 
    if (typeof file === 'string' && file.trim() !== '') {
      setTextureUrl(file);
    }
  }, [file]);

  if (!textureUrl) return null;

  return (
    <Suspense fallback={null}>
      <DecalRender url={textureUrl} />
    </Suspense>
  );
}

function ModeloCamiseta({ rutaModelo, colorPrenda, archivoImagen }) {
  const { scene } = useGLTF(rutaModelo);

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
  clonedScene.traverse((child) => {
    if (child.isMesh) {
      const nombre = (child.name || '').toLowerCase();

      // Si identificas el nombre de la pantaloneta, la ocultas
      if (nombre.includes('pants') || nombre.includes('shorts') || nombre.includes('pantalon')) {
        child.visible = false; 
      }

      // Si identificas el cabello o extremidades
      if (nombre.includes('hair') || nombre.includes('pelo')) {
        child.material = new THREE.MeshStandardMaterial({ color: '#334155' });
      }
    }
  });
}, [clonedScene]);

  return (
    <group>
      <primitive object={clonedScene}>
        {clonedScene.children.map((child) => {
          if (child.isMesh) {
            return (
              <primitive key={child.uuid} object={child}>
                <EstampadoPecho file={archivoImagen} />
              </primitive>
            );
          }
          return null;
        })}
      </primitive>
    </group>
  );
}

function Cargando() {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[0.3, 0.3, 0.3]} />
      <meshStandardMaterial color="#3b82f6" wireframe />
    </mesh>
  );
}

export default function Canvas3D({ 
  imagenes = [], 
  colorPrenda = '#3f3f46', 
  archivoImagen = null 
}) {
  const estampaActual = archivoImagen || (imagenes && imagenes.length > 0 ? imagenes[0] : null);

  return (
    <div style={{ width: '100%', height: '480px', backgroundColor: '#18181b', borderRadius: '0.75rem', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 0.4, 2.2], fov: 45 }}>
        {/* Iluminación frontal y superior brillante */}
        <ambientLight intensity={2.8} />
        <directionalLight position={[5, 5, 5]} intensity={3.0} />
        <directionalLight position={[-5, 5, 5]} intensity={2.5} />
        <directionalLight position={[0, 2, 4]} intensity={1.5} />

        {/* Mapa de iluminación HDR neutro y claro */}
        <Environment preset="studio" />

        <Suspense fallback={<Cargando />}>
          <Center>
            <ModeloCamiseta
              rutaModelo="/modelos/camiseta_base.glb"
              colorPrenda={colorPrenda}
              archivoImagen={estampaActual}
            />
          </Center>
        </Suspense>

        <OrbitControls 
          enableZoom={true} 
          minDistance={1.0} 
          maxDistance={3.5} 
          target={[0, 0.2, 0]} 
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/modelos/camiseta_base.glb');