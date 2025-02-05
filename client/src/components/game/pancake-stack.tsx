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

    // Position camera for better view of flipping animation
    camera.position.set(0, 4, 8);
    camera.lookAt(0, 0, 0);

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
    // Get pancakes from clicked index to the top (not from bottom to clicked index)
    const pancakesToFlip = pancakesRef.current.slice(index);

    // Calculate the pivot point for the flip
    const pivotY = (index * stackHeight);
    flipGroup.position.y = pivotY;

    // Move pancakes to flip group, adjusting their positions relative to pivot
    pancakesToFlip.forEach((pancake, i) => {
      const relativeY = pancake.position.y - pivotY;
      pancake.position.y = relativeY;
      flipGroup.add(pancake);
    });

    groupRef.current.add(flipGroup);

    // Create a GSAP timeline for the sequence of animations
    const tl = gsap.timeline({
      onComplete: () => {
        // Reset the rotation
        flipGroup.rotation.x = 0;

        // Reposition pancakes in reverse order starting from the clicked index
        const reversedPancakes = [...pancakesToFlip].reverse();
        reversedPancakes.forEach((pancake, i) => {
          pancake.position.y = (index + i) * stackHeight;
          groupRef.current!.add(pancake);
        });

        flipGroup.removeFromParent();
        setIsAnimating(false);
        onFlip(index);
      }
    });

    // Add sequential animations to the timeline
    tl.to(flipGroup.position, {
      y: pivotY + 2, // Lift up
      duration: 0.3,
      ease: "power2.out"
    })
    .to(flipGroup.rotation, {
      x: Math.PI, // Flip
      duration: 0.6,
      ease: "power2.inOut"
    })
    .to(flipGroup.position, {
      y: pivotY, // Drop back
      duration: 0.3,
      ease: "bounce.out"
    });
  };

  return <div ref={containerRef} className="w-full h-screen" />;
}