import { motion } from "framer-motion";

type Props = {
  imageUrl: string;
  alt: string;
};

export default function FacilityImage({ imageUrl, alt }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-gray-300 rounded-xl shadow p-3 flex items-center justify-center"
    >
      <div className="w-full aspect-[4/2] overflow-hidden rounded-lg">
        <img src={imageUrl} alt={alt} className="w-full h-full object-cover" />
      </div>
    </motion.div>
  );
}
