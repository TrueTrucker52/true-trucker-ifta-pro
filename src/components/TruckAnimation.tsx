import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';

const TruckModel = () => {
  return (
    <mesh rotation={[0, Math.PI / 4, 0]}>
      <boxGeometry args={[2, 1, 4]} />
      <meshStandardMaterial color="hsl(var(--primary))" />
      <mesh position={[0, 0.5, -1.5]}>
        <boxGeometry args={[1.8, 0.8, 1]} />
        <meshStandardMaterial color="hsl(var(--secondary))" />
      </mesh>
      {/* Wheels */}
      <mesh position={[-0.7, -0.7, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.7, -0.7, 1.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-0.7, -0.7, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.7, -0.7, -1.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </mesh>
  );
};

export const TruckAnimation = () => {
  return (
    <motion.div 
      className="w-full h-64 relative"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
    >
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} />
        <directionalLight position={[0, 10, 5]} intensity={1} />
        <TruckModel />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
      </Canvas>
      
      {/* Enhanced truck animation with vibrant colors */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center bg-gradient-hero rounded-lg"
        animate={{ 
          scale: [1, 1.02, 1],
          boxShadow: [
            '0 0 20px hsl(var(--primary) / 0.3)',
            '0 0 40px hsl(var(--secondary) / 0.4)',
            '0 0 20px hsl(var(--accent) / 0.3)'
          ]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          animate={{ 
            rotateY: [0, 15, -15, 0],
            scale: [1, 1.15, 1],
            y: [0, -5, 0]
          }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Truck className="h-20 w-20 text-white drop-shadow-2xl" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};