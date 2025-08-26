// src/components/maps/SearchInput.tsx
import { useEffect, useRef, useState } from "react";

type Props = {
  value?: string;
  onChange: (v: string) => void;
  delay?: number;
  placeholder?: string;
  className?: string;
};

export default function SearchInput({
  value = "",
  onChange,
  delay = 250,
  placeholder,
  className,
}: Props) {
  const [localText, setLocalText] = useState(value);
  const [isComposing, setIsComposing] = useState(false);
  const tRef = useRef<number | null>(null);

  // 부모 값이 리셋될 때 동기화
  useEffect(() => {
    setLocalText(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (tRef.current) window.clearTimeout(tRef.current);
    };
  }, []);

  const debounceEmit = (v: string) => {
    if (tRef.current) window.clearTimeout(tRef.current);
    tRef.current = window.setTimeout(() => onChange(v), delay);
  };

  return (
    <input
      className={className ?? "w-full border rounded px-2 py-1 text-sm"}
      value={localText}
      placeholder={placeholder}
      onChange={(e) => {
        const v = e.target.value;
        setLocalText(v);          
        if (!isComposing) {
          debounceEmit(v);      
        }
      }}
      onCompositionStart={() => setIsComposing(true)}
      onCompositionEnd={(e) => {
        setIsComposing(false);
        const v = e.currentTarget.value;
        setLocalText(v);
        onChange(v);             
      }}
    />
  );
}
