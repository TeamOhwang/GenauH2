type Props = {
  imageUrl: string;
  alt?: string;
};

export default function FacilityImage({ imageUrl, alt }: Props) {
  return (
    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl shadow flex items-center justify-center">
      <img
        src={imageUrl}   
        alt={alt || "설비 이미지"}
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
}