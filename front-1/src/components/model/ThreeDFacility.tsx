import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

type Props = { modelUrl: string };

function FacilityModel({ modelUrl }: Props) {
  const { scene } = useGLTF(modelUrl);
  return <primitive object={scene} scale={0.01} />;
}

export default function Facility3D({ modelUrl }: Props) {
  return (
    <div className="h-80 w-full bg-black rounded-xl shadow">
      <Canvas camera={{ position: [5, 5, 5] }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <FacilityModel modelUrl={modelUrl} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
