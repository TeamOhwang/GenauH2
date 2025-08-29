import { useState } from "react";
import { Range } from "react-range";
import * as React from "react";

export default function TimeSlider({ dataLength }: { dataLength: number }) {
  const STEP = 1;
  const MIN = 0;
  const MAX = dataLength > 1 ? dataLength - 1 : 0; 
  const [values, setValues] = useState([0, MAX]);

  // 데이터가 0개 또는 1개일 때는 Range 안 보여줌
  if (dataLength <= 1) {
    return (
      <div className="text-gray-400 text-center text-sm">
        슬라이더를 표시할 데이터가 부족합니다.
      </div>
    );
  }

  return (
    <Range
      step={STEP}
      min={MIN}
      max={MAX}
      values={values}
      onChange={setValues}
      renderTrack={({ props, children }) => (
        <div
          {...props}
          className="h-2 bg-slate-700 rounded cursor-pointer flex items-center"
        >
          {React.Children.map(children, (child, index) => (
            <div key={index} style={{ flex: 1 }}>
              {child}
            </div>
          ))}
        </div>
      )}
      renderThumb={({ props, index }) => (
        <div
          {...props}
          key={index}
          className="h-4 w-4 bg-cyan-400 rounded-full shadow"
        />
      )}
    />
  );
}
