import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";
import { soundEffect } from "@/lib/sound";

interface PancakeStackProps {
  arrangement: number[];
  onFlip: (index: number) => void;
  isAnimating: boolean;
  setIsAnimating: (value: boolean) => void;
  isVictory?: boolean;  // New prop for victory state
}

export function PancakeStack({ arrangement, onFlip, isAnimating, setIsAnimating, isVictory = false }: PancakeStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const pancakesRef = useRef<THREE.Mesh[]>([]);
  const groupRef = useRef<THREE.Group>();

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
    ground.position.y = -0.5;
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

      shape.moveTo(-width/2 + radius, -depth/2);
      shape.lineTo(width/2 - radius, -depth/2);
      shape.quadraticCurveTo(width/2, -depth/2, width/2, -depth/2 + radius);
      shape.lineTo(width/2, depth/2 - radius);
      shape.quadraticCurveTo(width/2, depth/2, width/2 - radius, depth/2);
      shape.lineTo(-width/2 + radius, depth/2);
      shape.quadraticCurveTo(-width/2, depth/2, -width/2, depth/2 - radius);
      shape.lineTo(-width/2, -depth/2 + radius);
      shape.quadraticCurveTo(-width/2, -depth/2, -width/2 + radius, -depth/2);

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
    });
  }, [arrangement]);

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
        soundEffect.playClick();
        const clickedIndex = pancakesRef.current.indexOf(intersects[0].object as THREE.Mesh);
        flipPancakes(clickedIndex);
      }
    }

    containerRef.current.addEventListener('click', handleClick);
    return () => containerRef.current?.removeEventListener('click', handleClick);
  }, [isAnimating]);

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
          y: baseY * 1.5, // Increase spacing by 50%
          duration: 0.5,
          ease: "power2.inOut"
        }, 0); // Start all spacing animations at the same time
      });

      // Then start the continuous bouncing animations
      pancakesRef.current.forEach((pancake) => {
        // Bounce animation with dynamic random movement
        tl.to(pancake.position, {
          y: `random(${pancake.position.y + 0.5}, ${pancake.position.y + 2})`,
          x: "random(-1, 1)",
          z: "random(-1, 1)",
          duration: 0.3,
          ease: "power2.inOut",
          yoyo: true,
          repeat: -1,
          modifiers: {
            y: gsap.utils.unitize(y => Number(y)), // Ensure proper number conversion
            x: gsap.utils.unitize(x => Number(x)),
            z: gsap.utils.unitize(z => Number(z))
          }
        }, 0.5); // Start after spacing animation

        // Add a dynamic wobble effect
        tl.to(pancake.rotation, {
          x: "random(-0.2, 0.2)",
          z: "random(-0.2, 0.2)",
          duration: 0.4,
          ease: "power1.inOut",
          yoyo: true,
          repeat: -1,
          modifiers: {
            x: gsap.utils.unitize(x => pancake.rotation.x + Number(x)),
            z: gsap.utils.unitize(z => pancake.rotation.z + Number(z))
          }
        }, 0.5);
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

    const pivotY = (index + pancakesToFlip.length) / 2 * stackHeight;
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