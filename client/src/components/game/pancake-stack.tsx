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

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);
    
    camera.position.z = 10;
    
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

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
      scene.add(pancake);
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
    if (isAnimating) return;
    setIsAnimating(true);

    const pancakesToFlip = pancakesRef.current.slice(0, index + 1);
    
    gsap.to(pancakesToFlip.map(p => p.rotation), {
      x: Math.PI,
      duration: 1,
      ease: "power2.inOut",
      stagger: {
        from: "end",
        amount: 0.2
      },
      onComplete: () => {
        pancakesToFlip.forEach(p => {
          p.rotation.x = 0;
        });
        setIsAnimating(false);
        onFlip(index);
      }
    });
  };

  return <div ref={containerRef} className="w-full h-screen" />;
}
