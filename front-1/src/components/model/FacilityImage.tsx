type Props = {
  imageUrl: string;
  alt: string;
};

export default function FacilityImage({ imageUrl, alt }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-3 flex items-center justify-center">
      {/* 비율 고정 6:4 (3:2) */}
      <div className="w-full aspect-[3/2] overflow-hidden rounded-lg">
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
