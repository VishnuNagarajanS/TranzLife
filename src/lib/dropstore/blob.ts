'use client';

import { useLayoutEffect } from 'react';
import * as THREE from 'three';
import { gsap, isTouchDevice } from './gsap';
import { Pointer } from './pointer';
import { useTicker } from './motion';
import { blobVertexHead, blobVertexMain } from './blob-shaders';

/** Height of the orthographic frustum in world units. */
export const FRUSTUM_HEIGHT = 3.5;

const HDRI = ['/hdri/px.webp', '/hdri/nx.webp', '/hdri/py.webp', '/hdri/ny.webp', '/hdri/pz.webp', '/hdri/nz.webp'];

class BlobMaterial extends THREE.MeshPhysicalMaterial {
  uniforms = {
    uLOD: { value: 0 },
    uTime: { value: 0 },
    uDisplaceNormals: { value: true },
    uSpeed: { value: 0.045 },
    uShapeDistort: { value: 0.075 },
    uShapeDistortFrequency: { value: 0.1 },
    uShapeDistortPoleStrength: { value: 1 },
    uSurfaceDistort: { value: 1.04 },
    uSurfaceDistortFrequency: { value: 4.44 },
    uSurfaceDistortPoleStrength: { value: 0.1 },
    uWavesAmount: { value: 21 },
  };

  constructor(lod: number, params: THREE.MeshPhysicalMaterialParameters = {}) {
    super(params);
    this.uniforms.uLOD.value = lod;
    // TranzLife "essence drop": forest-green body with a pale green-cream glow (gold light below).
    this.color = new THREE.Color(0x0f2a19);
    this.emissive = new THREE.Color(0xd2e2b8);
    this.roughness = 0;
    this.metalness = 0;
    this.reflectivity = 0;
    this.clearcoat = 0.8;
    this.transparent = true;
    this.opacity = 0;
  }

  onBeforeCompile(shader: THREE.WebGLProgramParametersWithUniforms) {
    Object.assign(shader.uniforms, this.uniforms);
    shader.vertexShader = `\n${blobVertexHead}\n${shader.vertexShader}\n`;
    shader.vertexShader = shader.vertexShader.replace('void main() {', `\nvoid main() {\n${blobVertexMain}\n`);
    shader.vertexShader = shader.vertexShader.replace('#include <displacementmap_vertex>', 'transformed = displacedPosition;');
    shader.vertexShader = shader.vertexShader.replace(
      '#include <defaultnormal_vertex>',
      THREE.ShaderChunk.defaultnormal_vertex.replace(
        'vec3 transformedNormal = objectNormal;',
        'vec3 transformedNormal = displacedNormal;'
      )
    );
  }
}

/** Subdivided icosphere with merged vertices so the displacement stays seamless. */
class BlobGeometry extends THREE.BufferGeometry {
  constructor(radius = 1, detail = 0) {
    super();
    const t = (1 + Math.sqrt(5)) / 2;
    const vertices = [-1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, 0, 0, -1, t, 0, 1, t, 0, -1, -t, 0, 1, -t, t, 0, -1, t, 0, 1, -t, 0, -1, -t, 0, 1];
    const indices = [
      0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6,
      8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1,
    ];
    const buffer: number[] = [];
    const push = (v: THREE.Vector3) => buffer.push(v.x, v.y, v.z);
    const get = (i: number, v: THREE.Vector3) => v.set(vertices[i * 3], vertices[i * 3 + 1], vertices[i * 3 + 2]);
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const c = new THREE.Vector3();

    for (let i = 0; i < indices.length; i += 3) {
      get(indices[i], a);
      get(indices[i + 1], b);
      get(indices[i + 2], c);
      const cols = detail + 1;
      const grid: THREE.Vector3[][] = [];
      for (let r = 0; r <= cols; r++) {
        grid[r] = [];
        const aj = a.clone().lerp(c, r / cols);
        const bj = b.clone().lerp(c, r / cols);
        const rows = cols - r;
        for (let k = 0; k <= rows; k++) grid[r][k] = k === 0 && r === cols ? aj : aj.clone().lerp(bj, k / rows);
      }
      for (let r = 0; r < cols; r++) {
        for (let k = 0; k < 2 * (cols - r) - 1; k++) {
          const j = Math.floor(k / 2);
          if (k % 2 === 0) {
            push(grid[r][j + 1]);
            push(grid[r + 1][j]);
            push(grid[r][j]);
          } else {
            push(grid[r][j + 1]);
            push(grid[r + 1][j + 1]);
            push(grid[r + 1][j]);
          }
        }
      }
    }

    const v = new THREE.Vector3();
    for (let i = 0; i < buffer.length; i += 3) {
      v.set(buffer[i], buffer[i + 1], buffer[i + 2]).normalize().multiplyScalar(radius);
      buffer[i] = v.x;
      buffer[i + 1] = v.y;
      buffer[i + 2] = v.z;
    }

    const precision = 1e4;
    const map: Record<string, number> = {};
    const index: number[] = [];
    const positions: number[] = [];
    let next = 0;
    for (let i = 0; i < buffer.length; i += 3) {
      const key = `${~~(buffer[i] * precision)},${~~(buffer[i + 1] * precision)},${~~(buffer[i + 2] * precision)},`;
      if (key in map) {
        index.push(map[key]);
      } else {
        positions.push(buffer[i], buffer[i + 1], buffer[i + 2]);
        map[key] = next;
        index.push(next++);
      }
    }
    this.setIndex(index);
    this.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    this.computeVertexNormals();
    if (detail > 0) this.normalizeNormals();
  }
}

export class Blob extends THREE.Mesh<BlobGeometry, BlobMaterial> {
  constructor(radius = 1, detail = 40) {
    const geometry = new BlobGeometry(radius, detail);
    const material = new BlobMaterial(Math.sqrt(geometry.attributes.position.count), {
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.7,
      reflectivity: 0,
      clearcoat: 0.4,
    });
    super(geometry, material);
  }
}

/* ---------------------------------------------------------- singletons --- */

let scene: THREE.Scene | undefined;
let camera: THREE.OrthographicCamera | undefined;
let renderer: THREE.WebGLRenderer | undefined;
let ambientLight: THREE.AmbientLight | undefined;
let dirLight: THREE.DirectionalLight | undefined;
let blob: Blob | undefined;

export const getAspect = () => window.innerWidth / window.innerHeight;

function ensureScene() {
  if (renderer) return;
  const aspect = getAspect();
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(
    -(FRUSTUM_HEIGHT * aspect) / 2,
    (FRUSTUM_HEIGHT * aspect) / 2,
    FRUSTUM_HEIGHT / 2,
    -FRUSTUM_HEIGHT / 2,
    -100,
    100
  );
  renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('blob-canvas') as HTMLCanvasElement,
    alpha: true,
    antialias: true,
  });
  // The original was built on a pre-r152 three.js that rendered without colour
  // management; linear output keeps the blob's whites and reflections identical.
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(3, window.devicePixelRatio));
  renderer.setClearColor(0xffffff, 0);
  ambientLight = new THREE.AmbientLight(0x000000, 0.5);
  dirLight = new THREE.DirectionalLight(0xe2c784, 0.6);
  dirLight.position.set(3, 3, 5);

  window.addEventListener('resize', () => {
    const a = getAspect();
    renderer!.setSize(window.innerWidth, window.innerHeight);
    camera!.left = -(FRUSTUM_HEIGHT * a) / 2;
    camera!.right = (FRUSTUM_HEIGHT * a) / 2;
    camera!.top = FRUSTUM_HEIGHT / 2;
    camera!.bottom = -FRUSTUM_HEIGHT / 2;
    camera!.updateProjectionMatrix();
  });
}

export function getScene() {
  ensureScene();
  return { scene: scene!, camera: camera!, renderer: renderer!, dirLight: dirLight! };
}

/** Adds the shared blob to the scene while the calling component is mounted. */
export function useBlob() {
  useLayoutEffect(() => {
    const { scene } = getScene();
    if (!blob) {
      blob = new Blob();
      blob.position.z = -10;
      blob.material.envMap = new THREE.CubeTextureLoader().load(HDRI);
      blob.material.opacity = 0;
    }
    scene.add(blob, dirLight!, ambientLight!);
    return () => {
      scene.remove(blob!);
      // Clear the last drawn frame so the blob does not linger on the next page.
      const { renderer, camera } = getScene();
      renderer.render(scene, camera);
    };
  }, []);

  return () => ({ blob: blob!, ...getScene() });
}

export const blobHdriFiles = HDRI;

/** Makes the blob drift toward the pointer, spinning faster the more it moves. */
export function useBlobChasing() {
  const getBlob = useBlob();

  useTicker((time, deltaTime) => {
    const { blob } = getBlob();
    if (!blob) return;
    const half = 0.5 * FRUSTUM_HEIGHT;
    const aspect = getAspect();
    const speed = blob.material.uniforms.uSpeed.value;
    const uniforms = blob.material.uniforms;
    // Slower than the original so the drop drifts organically rather than like liquid metal.
    const lerp = 0.035 * gsap.ticker.deltaRatio();
    let x: number;
    let y: number;
    let dx = 0;
    let dy = 0;

    if (isTouchDevice()) {
      x = gsap.utils.interpolate(blob.position.x, 0, lerp);
      y = gsap.utils.interpolate(blob.position.y, 0, lerp);
    } else {
      const pointer = Pointer.instance;
      x = gsap.utils.interpolate(blob.position.x, gsap.utils.mapRange(0, 1, -half * aspect, half * aspect, pointer.normalX), lerp);
      y = gsap.utils.interpolate(blob.position.y, gsap.utils.mapRange(0, 1, half, -half, pointer.normalY), lerp);
      dx = Math.abs(x - blob.position.x);
      dy = Math.abs(y - blob.position.y);
    }

    blob.position.x = x;
    blob.position.y = y;
    blob.rotation.z = Math.PI * (time + 5 * dy + 5 * dx) * speed;
    blob.rotation.x = Math.PI * (time + 5 * dy + 5 * dx) * speed;
    uniforms.uTime.value += 5 * dy + 5 * dx + 0.001 * deltaTime;
  });

  return getBlob;
}
