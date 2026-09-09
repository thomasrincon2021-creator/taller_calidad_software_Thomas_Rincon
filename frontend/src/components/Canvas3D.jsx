import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Center, Environment, OrbitControls, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';

const tintaAColor = {
  Blanco: '#ffffff',
  Negro: '#09090b',
  Dorado: '#fbbf24'
};

function ImagenEstampado({ imagen, position, rotation = [0, 0, 0], index, onMove, onInteraction, invertirHorizontal = false }) {
  const { url, escala = 1, rotacion = 0, geometria = 'cuadrado', x = 0, y = 0 } = typeof imagen === 'string' ? { url: imagen } : imagen;
  const texture = useTexture(url);
  const arrastre = useRef(null);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
  }, [texture]);

  const posicion = [position[0] + x * 0.6, position[1] + y * 0.9, position[2]];
  const rotacionVisual = [rotation[0], rotation[1], rotation[2] + (rotacion * Math.PI) / 180];
  const mover = (event) => {
    if (!arrastre.current) return;
    event.stopPropagation();
    const deltaX = (event.point.x - arrastre.current.x) / 0.5;
    const deltaY = (event.point.y - arrastre.current.y) / 0.5;
    onMove(index, {
      x: Math.max(-4, Math.min(4, arrastre.current.originalX + deltaX)),
      y: Math.max(-5, Math.min(5, arrastre.current.originalY + deltaY))
    });
  };
  const iniciar = (event) => {
    event.stopPropagation();
    arrastre.current = { x: event.point.x, y: event.point.y, originalX: x, originalY: y };
    onInteraction(true);
    event.target.setPointerCapture?.(event.pointerId);
  };
  const terminar = (event) => {
    event.stopPropagation();
    arrastre.current = null;
    onInteraction(false);
    event.target.releasePointerCapture?.(event.pointerId);
  };

  const forma = geometria || 'cuadrado';
  const ancho = forma === 'rectangular' ? 0.62 * escala : 0.45 * escala;
  const alto = forma === 'rectangular' ? 0.28 * escala : 0.45 * escala;
  const rotacionForma = forma === 'rombo' ? Math.PI / 4 : 0;

  return (
    <group position={posicion} rotation={rotacionVisual} renderOrder={2}>
      <mesh position={[0, 0, 0.035]} rotation={[0, 0, rotacionForma]}>
        {forma === 'circulo' ? (
          <circleGeometry args={[0.22 * escala, 64]} />
        ) : (
          <planeGeometry args={[ancho, alto]} />
        )}
        <meshBasicMaterial map={texture} transparent depthWrite depthTest side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={-1} />
      </mesh>
      <mesh position={[0, 0, 0.025]} onPointerDown={iniciar} onPointerMove={mover} onPointerUp={terminar}>
        <planeGeometry args={[Math.max(1.1, 0.45 * escala + 0.45), Math.max(1.1, 0.45 * escala + 0.45)]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} depthTest={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function TextoEstampado({ texto, position, rotation = [0, 0, 0], estilo = {}, fraseId, desplazamiento = {}, onMove, onInteraction }) {
  const arrastre = useRef(null);
  const { color = '#ffffff', fuente = 'Arial', tamano = 48 } = estilo;
  const { x = 0, y = 0, escala = 1, rotacion = 0 } = desplazamiento;
  const textura = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 256;
    const contexto = canvas.getContext('2d');
    contexto.clearRect(0, 0, canvas.width, canvas.height);
    contexto.font = `900 ${tamano}px "${fuente}"`;
    contexto.textAlign = 'center';
    contexto.textBaseline = 'middle';
    contexto.strokeStyle = '#000000';
    contexto.lineWidth = 10;
    contexto.strokeText(texto, canvas.width / 2, canvas.height / 2, 950);
    contexto.fillStyle = color;
    contexto.fillText(texto, canvas.width / 2, canvas.height / 2, 950);
    const mapa = new THREE.CanvasTexture(canvas);
    mapa.colorSpace = THREE.SRGBColorSpace;
    return mapa;
  }, [texto, color, fuente, tamano]);

  if (!texto?.trim()) return null;

  const rotacionVisual = [
    rotation[0],
    rotation[1],
    rotation[2] + (rotacion * Math.PI) / 180
  ];

  const limitar = (valor, min, max) => Math.max(min, Math.min(max, valor));

  return (
    <mesh
      position={[position[0] + x * 0.6, position[1] + y * 0.9, position[2]]}
      rotation={rotacionVisual}
      renderOrder={3}
      onPointerDown={(event) => {
        event.stopPropagation();
        arrastre.current = {
          inicioX: event.point.x,
          inicioY: event.point.y,
          origenX: x,
          origenY: y,
          ultimoX: x,
          ultimoY: y
        };
        event.target.setPointerCapture?.(event.pointerId);
        onInteraction(true);
      }}
      onPointerMove={(event) => {
        if (!arrastre.current) return;
        event.stopPropagation();

        const dx = (event.point.x - arrastre.current.inicioX) * 0.7;
        const dy = (event.point.y - arrastre.current.inicioY) * 0.7;
        const nuevoX = limitar(arrastre.current.origenX + dx, -4, 4);
        const nuevoY = limitar(arrastre.current.origenY + dy, -5, 5);

        if (Math.abs(nuevoX - arrastre.current.ultimoX) < 0.001 && Math.abs(nuevoY - arrastre.current.ultimoY) < 0.001) {
          return;
        }

        arrastre.current.ultimoX = nuevoX;
        arrastre.current.ultimoY = nuevoY;

        onMove(fraseId, {
          x: nuevoX,
          y: nuevoY
        });
      }}
      onPointerUp={(event) => {
        event.stopPropagation();
        arrastre.current = null;
        event.target.releasePointerCapture?.(event.pointerId);
        onInteraction(false);
      }}
      onPointerCancel={(event) => {
        event.stopPropagation();
        arrastre.current = null;
        event.target.releasePointerCapture?.(event.pointerId);
        onInteraction(false);
      }}
    >
      <planeGeometry args={[0.82 * escala, 0.21 * escala]} />
      <meshBasicMaterial map={textura} transparent depthWrite depthTest side={THREE.DoubleSide} polygonOffset polygonOffsetFactor={-1} />
    </mesh>
  );
}

function ZonaEstampado({ ubicacion, imagenes, frases, posicionesFrases, estiloTexto, estiloTextoFrente, estiloTextoAtras, onMoveImage, onMoveText, onInteraction, profundidad }) {
  const esPantalon = ubicacion.startsWith('pantalon-');
  const esEspaldaPantalon = esPantalon && ubicacion.includes('espalda');
  const esAmbos = ubicacion.includes('ambos');
  const frente = [0, 0.38, profundidad];
  const espalda = [0, 0.38, -profundidad];
  const rotacionEspalda = [0, Math.PI, 0];
  const mangaIzquierda = [-0.48, 0.34, 0.05];
  const mangaDerecha = [0.48, 0.34, 0.05];
  const mostrarFrente = ['pecho', 'frente', 'ambos'].includes(ubicacion) || (esPantalon && !esEspaldaPantalon);
  const mostrarEspalda = ['espalda', 'ambos'].includes(ubicacion) || esEspaldaPantalon;
  const mostrarMangas = ['mangas', 'completo'].includes(ubicacion);

  const posicionPantalon = (index) => {
    const profundidadZona = esEspaldaPantalon ? -profundidad : profundidad;
    return [index % 2 === 0 ? -0.16 : 0.16, esEspaldaPantalon ? -0.25 : 0.10, profundidadZona];
  };

  const posicionImagen = (index) => esPantalon
    ? posicionPantalon(index)
    : [frente[0] + (index - (imagenes.length - 1) / 2) * 0.2, frente[1], frente[2]];

  const posicionFrase = esPantalon
    ? [0, esEspaldaPantalon ? -0.18 : 0.10, esEspaldaPantalon ? -profundidad : profundidad]
    : [frente[0], frente[1] - 0.48, frente[2] + 0.01];

  return (
    <group>
      {esPantalon && !esAmbos && imagenes.map((imagen, index) => (
        <ImagenEstampado key={`pantalon-${imagen.url}-${index}`} imagen={imagen} index={index} onMove={onMoveImage} onInteraction={onInteraction} position={posicionImagen(index)} rotation={esEspaldaPantalon ? rotacionEspalda : [0, 0, 0]} invertirHorizontal={esEspaldaPantalon} />
      ))}
      {esPantalon && esAmbos && imagenes.slice(0, 1).map((imagen, index) => (
        <ImagenEstampado key={`pantalon-frente-${imagen.url}-${index}`} imagen={imagen} index={index} onMove={onMoveImage} onInteraction={onInteraction} position={posicionImagen(index)} />
      ))}
      {esPantalon && esAmbos && imagenes.slice(1, 2).map((imagen, index) => (
        <ImagenEstampado key={`pantalon-espalda-${imagen.url}-${index}`} imagen={imagen} index={1} onMove={onMoveImage} onInteraction={onInteraction} position={[posicionImagen(index)[0], posicionImagen(index)[1], -profundidad]} rotation={rotacionEspalda} invertirHorizontal />
      ))}
      {mostrarFrente && !esPantalon && <TextoEstampado texto={frases.principal || frases.adelante || frases.ladoA} fraseId={frases.principal ? 'principal' : frases.adelante ? 'adelante' : 'ladoA'} desplazamiento={posicionesFrases.principal || posicionesFrases.adelante || posicionesFrases.ladoA} position={posicionFrase} estilo={estiloTextoFrente || estiloTexto} onMove={onMoveText} onInteraction={onInteraction} />}

      {!esPantalon && mostrarFrente && !esAmbos && imagenes.map((imagen, index) => (
        <ImagenEstampado key={`frente-${imagen.url}-${index}`} imagen={imagen} index={index} onMove={onMoveImage} onInteraction={onInteraction} position={posicionImagen(index)} />
      ))}
      {!esPantalon && mostrarFrente && esAmbos && imagenes.slice(0, 1).map((imagen, index) => (
        <ImagenEstampado key={`frente-ambos-${imagen.url}-${index}`} imagen={imagen} index={index} onMove={onMoveImage} onInteraction={onInteraction} position={posicionImagen(index)} />
      ))}
      {!esPantalon && mostrarEspalda && !esAmbos && imagenes.map((imagen, index) => (
        <ImagenEstampado key={`espalda-${imagen.url}-${index}`} imagen={imagen} index={index} onMove={onMoveImage} onInteraction={onInteraction} position={[espalda[0] + (index - 1) * 0.2, espalda[1], espalda[2]]} rotation={rotacionEspalda} invertirHorizontal />
      ))}
      {!esPantalon && mostrarEspalda && esAmbos && imagenes.slice(1, 2).map((imagen, index) => (
        <ImagenEstampado key={`espalda-ambos-${imagen.url}-${index}`} imagen={imagen} index={1} onMove={onMoveImage} onInteraction={onInteraction} position={[espalda[0], espalda[1], espalda[2]]} rotation={rotacionEspalda} invertirHorizontal />
      ))}
      {esPantalon && <TextoEstampado texto={frases.principal || frases.adelante || frases.ladoA} fraseId={frases.principal ? 'principal' : frases.adelante ? 'adelante' : 'ladoA'} desplazamiento={posicionesFrases.principal || posicionesFrases.adelante || posicionesFrases.ladoA} position={posicionFrase} rotation={esEspaldaPantalon ? rotacionEspalda : [0, 0, 0]} estilo={estiloTextoFrente || estiloTexto} onMove={onMoveText} onInteraction={onInteraction} />}
      {esPantalon && esAmbos && <TextoEstampado texto={frases.atras || frases.ladoB || frases.principal} fraseId={frases.atras ? 'atras' : frases.ladoB ? 'ladoB' : 'principal'} desplazamiento={posicionesFrases.atras || posicionesFrases.ladoB || posicionesFrases.principal} position={[posicionFrase[0], posicionFrase[1], -profundidad]} rotation={rotacionEspalda} estilo={estiloTextoAtras || estiloTexto} onMove={onMoveText} onInteraction={onInteraction} />}
      {!esPantalon && mostrarEspalda && <TextoEstampado texto={frases.atras || frases.ladoB || frases.principal} fraseId={frases.atras ? 'atras' : frases.ladoB ? 'ladoB' : 'principal'} desplazamiento={posicionesFrases.atras || posicionesFrases.ladoB || posicionesFrases.principal} position={[espalda[0], espalda[1] - 0.48, espalda[2] - 0.01]} rotation={rotacionEspalda} estilo={estiloTextoAtras || estiloTexto} onMove={onMoveText} onInteraction={onInteraction} />}

    </group>
  );
}

function ModeloPrenda({ rutaModelo, colorPrenda, ubicacion, imagenes, frases, posicionesFrases, estiloTexto, estiloTextoFrente, estiloTextoAtras, onMoveImage, onMoveText, onInteraction, profundidad }) {
  const { scene } = useGLTF(rutaModelo);
  const escena = useMemo(() => {
    const clon = scene.clone(true);

    clon.traverse((objeto) => {
      if (!objeto.isMesh) return;

      const materialesOriginales = Array.isArray(objeto.material)
        ? objeto.material
        : [objeto.material].filter(Boolean);

      const materialesClonados = materialesOriginales.map((material) => material.clone());
      objeto.material = materialesClonados.length > 1 ? materialesClonados : materialesClonados[0];

      const materialesFinales = Array.isArray(objeto.material)
        ? objeto.material
        : [objeto.material].filter(Boolean);

      materialesFinales.forEach((material) => {
        if (!material) return;
        if (material.color) material.color.set(colorPrenda);
        if (material.emissive) material.emissive.set(colorPrenda);
        material.roughness = 0.72;
        material.metalness = 0.05;
      });
    });

    return clon;
  }, [scene, colorPrenda]);

  return (
    <group>
      <primitive object={escena} />
      <ZonaEstampado ubicacion={ubicacion} imagenes={imagenes} frases={frases} posicionesFrases={posicionesFrases} estiloTexto={estiloTexto} estiloTextoFrente={estiloTextoFrente} estiloTextoAtras={estiloTextoAtras} onMoveImage={onMoveImage} onMoveText={onMoveText} onInteraction={onInteraction} profundidad={profundidad} />
    </group>
  );
}

function Cargando() {
  return (
    <mesh>
      <boxGeometry args={[0.25, 0.25, 0.25]} />
      <meshStandardMaterial color="#dc2626" wireframe />
    </mesh>
  );
}

export default function Canvas3D({ rutaModelo = '/modelos/camiseta_base.glb', ubicacion = 'pecho', imagenes = [], colorPrenda = '#3f3f46', frases = {}, posicionesFrases = {}, estiloTexto = {}, estiloTextoFrente = null, estiloTextoAtras = null, archivoImagen = null, onMoveImage = () => {}, onMoveText = () => {}, height = 480 }) {
  const imagenesFinales = archivoImagen ? [archivoImagen, ...imagenes] : imagenes;
  const profundidad = rutaModelo.includes('pantalon') ? 0.23 : rutaModelo.includes('hoodies') ? 0.30 : 0.37;
  const [arrastrando, setArrastrando] = React.useState(false);

  return (
    <div style={{ width: '100%', height: `${height}px`, backgroundColor: '#18181b', borderRadius: '0.75rem', overflow: 'hidden' }}>
      <Canvas camera={{ position: [0, 0.4, 2.2], fov: 45 }}>
        <ambientLight intensity={2.2} />
        <directionalLight position={[5, 5, 5]} intensity={3} />
        <directionalLight position={[-5, 3, 4]} intensity={2} />
        <Environment preset="studio" />
        <Suspense fallback={<Cargando />}>
          <Center>
            <ModeloPrenda rutaModelo={rutaModelo} colorPrenda={colorPrenda} ubicacion={ubicacion} imagenes={imagenesFinales} frases={frases} posicionesFrases={posicionesFrases} estiloTexto={estiloTexto} estiloTextoFrente={estiloTextoFrente} estiloTextoAtras={estiloTextoAtras} onMoveImage={onMoveImage} onMoveText={onMoveText} onInteraction={setArrastrando} profundidad={profundidad} />
          </Center>
        </Suspense>
        <OrbitControls enabled={!arrastrando} enableZoom minDistance={1} maxDistance={3.5} target={[0, 0.2, 0]} />
      </Canvas>
    </div>
  );
}

useGLTF.preload('/modelos/camiseta_base.glb');
useGLTF.preload('/modelos/hoodies_base.glb');
useGLTF.preload('/modelos/pantalon_base.glb');
