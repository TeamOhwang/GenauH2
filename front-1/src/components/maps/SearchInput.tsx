
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
  const [text, setText] = useState(value);
  const [isComposing, setIsComposing] = useState(false);
  const tRef = useRef<number | null>(null);

  useEffect(() => { setText(value); }, [value]);
  useEffect(() => () => { if (tRef.current) window.clearTimeout(tRef.current); }, []);

  const emit = (v: string) => {
    if (tRef.current) window.clearTimeout(tRef.current);
    tRef.current = window.setTimeout(() => onChange(v), delay);
  };

  return (
    <input
      className={className ?? "w-full border rounded px-2 py-1 text-sm"}
      value={text}
      placeholder={placeholder}
      onChange={(e) => {
        const v = e.target.value;
        setText(v);
        if (!isComposing) emit(v);
      }}
      onCompositionStart={() => setIsComposing(true)}
      onCompositionEnd={(e) => {
        setIsComposing(false);
        const v = (e.target as HTMLInputElement).value;
        setText(v);   
        emit(v);      
      }}
    />
  );
}
