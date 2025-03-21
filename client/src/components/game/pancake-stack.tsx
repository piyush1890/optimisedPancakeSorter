import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { soundEffect } from "@/lib/sound";

interface PancakeStackProps {
  arrangement: number[];
  onFlip: (index: number) => void;
  isAnimating: boolean;
  setIsAnimating: (value: boolean) => void;
  isVictory?: boolean;
  targetIndex?: number; // New prop for highlighting target pancake
}

export function PancakeStack({
  arrangement,
  onFlip,
  isAnimating,
  setIsAnimating,
  isVictory = false,
  targetIndex
}: PancakeStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const pancakesRef = useRef<THREE.Mesh[]>([]);
  const groupRef = useRef<THREE.Group>();
  const outlineRef = useRef<THREE.LineSegments | null>(null);

  // Setup scene and renderer
  useEffect(() => {
    if (!containerRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a3a);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Position camera
    camera.position.set(0, 2, 10);
    camera.lookAt(0, 0, 0);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Create main group
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a4e,
      roughness: 0.6,
      metalness: 0.3
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.8;
    ground.receiveShadow = true;
    scene.add(ground);

    // Lighting
    const mainLight = new THREE.DirectionalLight(0xffffff, 2);
    mainLight.position.set(5, 10, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -10;
    mainLight.shadow.camera.right = 10;
    mainLight.shadow.camera.top = 10;
    mainLight.shadow.camera.bottom = -10;
    scene.add(mainLight);

    const ambientLight = new THREE.AmbientLight(0x6666ff, 1.0);
    scene.add(ambientLight);

    const rimLight = new THREE.DirectionalLight(0x4444ff, 0.8);
    rimLight.position.set(-5, 3, -5);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(0, 2, 8);
    scene.add(fillLight);

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    function handleResize() {
      if (!cameraRef.current || !rendererRef.current) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    }
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Create or update pancakes when arrangement changes
  useEffect(() => {
    if (!groupRef.current || !sceneRef.current) return;

    // Remove existing pancakes
    pancakesRef.current.forEach(pancake => {
      groupRef.current!.remove(pancake);
      pancake.geometry.dispose();
      (pancake.material as THREE.Material).dispose();
    });
    pancakesRef.current = [];

    // Create new pancakes based on current arrangement
    arrangement.forEach((size, index) => {
      const shape = new THREE.Shape();
      const width = size * 2;
      const depth = 2;
      const radius = 0.2;

      shape.moveTo(-width / 2 + radius, -depth / 2);
      shape.lineTo(width / 2 - radius, -depth / 2);
      shape.quadraticCurveTo(width / 2, -depth / 2, width / 2, -depth / 2 + radius);
      shape.lineTo(width / 2, depth / 2 - radius);
      shape.quadraticCurveTo(width / 2, depth / 2, width / 2 - radius, depth / 2);
      shape.lineTo(-width / 2 + radius, depth / 2);
      shape.quadraticCurveTo(-width / 2, depth / 2, -width / 2, depth / 2 - radius);
      shape.lineTo(-width / 2, -depth / 2 + radius);
      shape.quadraticCurveTo(-width / 2, -depth / 2, -width / 2 + radius, -depth / 2);

      const extrudeSettings = {
        steps: 1,
        depth: 0.4,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelOffset: 0,
        bevelSegments: 5
      };

      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(`hsl(${size * 40}, 70%, 50%)`),
        roughness: 0.4,
        metalness: 0.1
      });

      const pancake = new THREE.Mesh(geometry, material);
      pancake.position.y = index * 0.6;
      pancake.castShadow = true;
      pancake.receiveShadow = true;
      pancake.rotation.x = Math.PI / 2;
      groupRef.current!.add(pancake);
      pancakesRef.current.push(pancake);

      // Add highlight effect if this is the target pancake
      if (targetIndex !== undefined && index === targetIndex) {
        const geometry = pancake.geometry as THREE.ExtrudeGeometry;

        // Create a custom geometry for front edges only
        const positions = [];
        const vertices = [];

        // Get the front face vertices
        geometry.getAttribute('position').array.forEach((value, i) => {
          if (i % 3 === 0) {
            vertices.push([
              geometry.getAttribute('position').array[i],
              geometry.getAttribute('position').array[i + 1],
              geometry.getAttribute('position').array[i + 2]
            ]);
          }
        });

        // Create edges for the front face only (y > 0)
        vertices.forEach((vertex, i) => {
          if (vertex[1] > 0) { // Only consider vertices on the front face
            const nextVertex = vertices[(i + 1) % vertices.length];
            if (nextVertex[1] > 0) { // If next vertex is also on front face
              positions.push(...vertex, ...nextVertex);
            }
          }
        });

        const edgesGeometry = new THREE.BufferGeometry();
        edgesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

        const lineMaterial = new THREE.LineBasicMaterial({
          color: 0xffffff,
          linewidth: 2,
          transparent: true,
          opacity: 0.8
        });

        const outline = new THREE.LineSegments(edgesGeometry, lineMaterial);
        outline.rotation.copy(pancake.rotation);
        outline.position.copy(pancake.position);
        outline.scale.multiplyScalar(1.02); // Slightly larger to avoid z-fighting

        // Remove previous outline if exists
        if (outlineRef.current) {
          groupRef.current!.remove(outlineRef.current);
          outlineRef.current.geometry.dispose();
          (outlineRef.current.material as THREE.Material).dispose();
        }

        groupRef.current!.add(outline);
        outlineRef.current = outline;

        // Animate the outline
        gsap.to(outline.scale, {
          x: 1.05,
          y: 1.05,
          z: 1.05,
          duration: 0.5,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut"
        });
      }
    });
  }, [arrangement, targetIndex]);

  // Handle click events
  useEffect(() => {
    if (!containerRef.current || !rendererRef.current) return;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function handleClick(event: MouseEvent) {
      if (isAnimating) return;

      const rect = rendererRef.current!.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current!);
      const intersects = raycaster.intersectObjects(pancakesRef.current);

      if (intersects.length > 0) {
        const clickedIndex = pancakesRef.current.indexOf(intersects[0].object as THREE.Mesh);

        if (targetIndex === undefined || clickedIndex === targetIndex) {
          // Remove highlight before starting flip animation
          if (outlineRef.current) {
            groupRef.current!.remove(outlineRef.current);
            outlineRef.current.geometry.dispose();
            (outlineRef.current.material as THREE.Material).dispose();
            outlineRef.current = null;
          }

          soundEffect.playClick();
          flipPancakes(clickedIndex);
        } else {
          // Bounce animation for wrong clicks
          const wrongPancake = pancakesRef.current[clickedIndex];
          const originalY = wrongPancake.position.y;

          gsap.to(wrongPancake.position, {
            y: originalY + 0.2,
            duration: 0.1,
            ease: "power2.out",
            yoyo: true,
            repeat: 1
          });
        }
      }
    }

    containerRef.current.addEventListener('click', handleClick);
    return () => containerRef.current?.removeEventListener('click', handleClick);
  }, [isAnimating, targetIndex]);

  // Add victory dance animation
  useEffect(() => {
    if (isVictory && groupRef.current && !isAnimating) {
      setIsAnimating(true);
      soundEffect.playVictory();

      // Create a bouncy victory animation
      const tl = gsap.timeline({
        onComplete: () => setIsAnimating(false),
      });

      // First, smoothly increase the spacing between pancakes
      pancakesRef.current.forEach((pancake, i) => {
        const baseY = i * 0.6; // Original Y position
        tl.to(pancake.position, {
          y: baseY * 2, // Double the spacing for more dramatic effect
          duration: 0.8,
          ease: "power2.inOut"
        }, 0); // Start all spacing animations at the same time
      });

      // Then start the continuous bouncing animations
      pancakesRef.current.forEach((pancake, i) => {
        // Random values for more varied animation
        const randomY = 1 + Math.random() * 1.5;
        const randomX = (Math.random() - 0.5) * 2;
        const randomZ = (Math.random() - 0.5) * 2;

        // Bounce animation with random horizontal movement
        tl.to(pancake.position, {
          y: `+=${randomY}`,
          x: `+=${randomX}`,
          z: `+=${randomZ}`,
          duration: 0.3, // Fast animation
          ease: "power2.out",
          yoyo: true,
          repeat: -1, // Infinite repeat
          repeatDelay: 0 // No delay between repeats for continuous motion
        }, 0.8); // Start after spacing animation completes

        // Add a subtle wobble effect
        tl.to(pancake.rotation, {
          x: pancake.rotation.x + (Math.random() - 0.5) * 0.2,
          z: pancake.rotation.z + (Math.random() - 0.5) * 0.2,
          duration: 0.6, // Fast rotation
          ease: "back.inOut(2)", // Smoother rotation transition
          yoyo: true,
          repeat: -1
        }, 0.8); // Start rotation at the same time as bouncing
      });
    }
  }, [isVictory, isAnimating, setIsAnimating]);


  const flipPancakes = (index: number) => {
    if (isAnimating || !groupRef.current) return;
    setIsAnimating(true);

    const stackHeight = 0.6;
    const liftHeight = 3;

    const flipGroup = new THREE.Group();
    const pancakesToFlip = pancakesRef.current.slice(index);
    const pivotY = (index + 1 + pancakesToFlip.length) / 2.0 * stackHeight;
    flipGroup.position.y = pivotY;

    const finalPositions = pancakesToFlip.map((_, i) => ({
      pancake: pancakesToFlip[pancakesToFlip.length - 1 - i],
      finalY: (index + i) * stackHeight
    }));

    pancakesToFlip.forEach((pancake, i) => {
      const relativeY = pancake.position.y - pivotY;
      pancake.position.y = relativeY;
      flipGroup.add(pancake);
    });

    groupRef.current.add(flipGroup);

    const tl = gsap.timeline({
      onComplete: () => {
        flipGroup.rotation.x = 0;

        finalPositions.forEach(({ pancake, finalY }) => {
          pancake.position.y = finalY;
          groupRef.current!.add(pancake);
        });

        pancakesRef.current.sort((a, b) => a.position.y - b.position.y);
        flipGroup.removeFromParent();
        setIsAnimating(false);
        onFlip(index);
      }
    });

    tl.to(flipGroup.rotation, {
      x: Math.PI,
      duration: 0.7,
      ease: "power1.inOut"
    });

    tl.to(flipGroup.position, {
      y: `+=${liftHeight}`,
      duration: 0.35,
      ease: "power2.out"
    }, 0);

    tl.to(flipGroup.position, {
      y: pivotY,
      duration: 0.35,
      ease: "power2.in"
    }, 0.35);
  };

  return <div ref={containerRef} className="w-full h-screen" />;
}