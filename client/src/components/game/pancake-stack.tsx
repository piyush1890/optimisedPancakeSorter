import { useEffect, useRef } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

interface PancakeStackProps {
  arrangement: number[];
  onFlip: (index: number) => void;
  isAnimating: boolean;
  setIsAnimating: (value: boolean) => void;
}

export function PancakeStack({ arrangement, onFlip, isAnimating, setIsAnimating }: PancakeStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const pancakesRef = useRef<THREE.Mesh[]>([]);
  const groupRef = useRef<THREE.Group>();

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Position camera
    camera.position.z = 10;
    camera.position.y = 2;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Create main group for all pancakes
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Create pancakes
    arrangement.forEach((size, index) => {
      const geometry = new THREE.BoxGeometry(size * 2, 0.5, 2);
      const material = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color(`hsl(${size * 40}, 70%, 50%)`),
        specular: 0x404040,
        shininess: 30
      });

      const pancake = new THREE.Mesh(geometry, material);
      pancake.position.y = index * 0.6;
      group.add(pancake);
      pancakesRef.current.push(pancake);
    });

    // Add lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

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
        flipPancakes(clickedIndex);
      }
    }

    containerRef.current.addEventListener('click', handleClick);
    return () => containerRef.current?.removeEventListener('click', handleClick);
  }, [isAnimating]);

  const flipPancakes = (index: number) => {
    if (isAnimating || !groupRef.current) return;
    setIsAnimating(true);

    const stackHeight = 0.6; // Height between pancakes

    // Create a temporary group for the flipping pancakes
    const flipGroup = new THREE.Group();
    const pancakesToFlip = pancakesRef.current.slice(0, index + 1);

    // Calculate the center position for the flip group
    const centerY = (index * stackHeight) / 2;
    flipGroup.position.y = centerY;

    // Move pancakes to flip group, maintaining relative positions
    pancakesToFlip.forEach((pancake, i) => {
      const newPosition = new THREE.Object3D();
      newPosition.position.copy(pancake.position);
      newPosition.position.y -= centerY;  // Adjust position relative to flip group's center
      pancake.position.copy(newPosition.position);
      flipGroup.add(pancake);
    });

    groupRef.current.add(flipGroup);

    // Animate the flip
    gsap.to(flipGroup.rotation, {
      z: Math.PI,
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => {
        // Reset the rotation and reposition pancakes
        flipGroup.rotation.z = 0;

        // Reposition pancakes in reverse order
        pancakesToFlip.forEach((pancake, i) => {
          const newY = (index - i) * stackHeight;
          pancake.position.y = newY;
          groupRef.current!.add(pancake);
        });

        flipGroup.removeFromParent();
        setIsAnimating(false);
        onFlip(index);
      }
    });
  };

  return <div ref={containerRef} className="w-full h-screen" />;
}