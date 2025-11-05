'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface PropertyViewer3DProps {
  modelData: {
    floors: number;
    roofType: 'flat' | 'gabled' | 'hipped';
    color: string;
    hasGarage: boolean;
  };
}

export default function PropertyViewer3D({ modelData }: PropertyViewer3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(15, 12, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    const groundGeometry = new THREE.PlaneGeometry(50, 50);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x7cb342,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const houseColor = new THREE.Color(modelData.color);
    const houseMaterial = new THREE.MeshStandardMaterial({ 
      color: houseColor,
      roughness: 0.7,
      metalness: 0.1
    });

    const floorHeight = 3;
    const houseWidth = 10;
    const houseDepth = 8;

    for (let i = 0; i < modelData.floors; i++) {
      const floorGeometry = new THREE.BoxGeometry(houseWidth, floorHeight, houseDepth);
      const floor = new THREE.Mesh(floorGeometry, houseMaterial);
      floor.position.y = (floorHeight / 2) + (i * floorHeight);
      floor.castShadow = true;
      floor.receiveShadow = true;
      scene.add(floor);

      const windowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x87ceeb,
        transparent: true,
        opacity: 0.6,
        roughness: 0.1,
        metalness: 0.9
      });

      const windowSize = 1.2;
      const windowPositions = [
        { x: -houseWidth / 2 + 0.01, y: (floorHeight / 2) + (i * floorHeight), z: -2, rotY: Math.PI / 2 },
        { x: -houseWidth / 2 + 0.01, y: (floorHeight / 2) + (i * floorHeight), z: 2, rotY: Math.PI / 2 },
        { x: houseWidth / 2 - 0.01, y: (floorHeight / 2) + (i * floorHeight), z: -2, rotY: -Math.PI / 2 },
        { x: houseWidth / 2 - 0.01, y: (floorHeight / 2) + (i * floorHeight), z: 2, rotY: -Math.PI / 2 },
      ];

      windowPositions.forEach(pos => {
        const windowGeometry = new THREE.PlaneGeometry(windowSize, windowSize);
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(pos.x, pos.y, pos.z);
        window.rotation.y = pos.rotY;
        scene.add(window);
      });
    }

    const roofY = modelData.floors * floorHeight;
    const roofMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8b4513,
      roughness: 0.9,
      metalness: 0.1
    });

    if (modelData.roofType === 'flat') {
      const roofGeometry = new THREE.BoxGeometry(houseWidth, 0.3, houseDepth);
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.y = roofY + 0.15;
      roof.castShadow = true;
      scene.add(roof);
    } else if (modelData.roofType === 'gabled') {
      const roofShape = new THREE.Shape();
      roofShape.moveTo(-houseWidth / 2, 0);
      roofShape.lineTo(0, 2.5);
      roofShape.lineTo(houseWidth / 2, 0);
      roofShape.lineTo(-houseWidth / 2, 0);

      const extrudeSettings = {
        steps: 1,
        depth: houseDepth,
        bevelEnabled: false
      };

      const roofGeometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.set(0, roofY, -houseDepth / 2);
      roof.castShadow = true;
      scene.add(roof);
    } else if (modelData.roofType === 'hipped') {
      const roofGeometry = new THREE.ConeGeometry(houseWidth * 0.7, 3, 4);
      const roof = new THREE.Mesh(roofGeometry, roofMaterial);
      roof.position.y = roofY + 1.5;
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      scene.add(roof);
    }

    if (modelData.hasGarage) {
      const garageWidth = 4;
      const garageHeight = 2.5;
      const garageDepth = 5;
      
      const garageGeometry = new THREE.BoxGeometry(garageWidth, garageHeight, garageDepth);
      const garageMaterial = new THREE.MeshStandardMaterial({ 
        color: houseColor.clone().multiplyScalar(0.9),
        roughness: 0.7,
        metalness: 0.1
      });
      const garage = new THREE.Mesh(garageGeometry, garageMaterial);
      garage.position.set(houseWidth / 2 + garageWidth / 2, garageHeight / 2, 0);
      garage.castShadow = true;
      garage.receiveShadow = true;
      scene.add(garage);

      const doorGeometry = new THREE.PlaneGeometry(3, 2);
      const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
      const door = new THREE.Mesh(doorGeometry, doorMaterial);
      door.position.set(houseWidth / 2 + garageWidth / 2, 1, garageDepth / 2 + 0.01);
      scene.add(door);
    }

    const doorGeometry = new THREE.BoxGeometry(1.5, 2.5, 0.2);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 1.25, houseDepth / 2 + 0.1);
    door.castShadow = true;
    scene.add(door);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
      controls.dispose();
    };
  }, [modelData]);

  return (
    <div ref={containerRef} className="w-full h-[500px] rounded-lg overflow-hidden shadow-lg" />
  );
}
