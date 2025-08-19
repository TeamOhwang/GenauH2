import { forwardRef, ReactNode } from "react";


//import { Button, Text } from "@/components/ui";   외부 imports 


type Variant = "title" | "body" | "caption";

type OwnProps = {
  children: ReactNode;
  variant?: Variant;
  color?: string;
  style?: React.CSSProperties; // 인라인만 허용
};

type TextProps = Omit<
  React.HTMLAttributes<HTMLSpanElement>,
  "className" | "style" | "children"
> & OwnProps;

const fontSizeByVariant: Record<Variant, number> = {
  title: 20,
  body: 14,
  caption: 12,
};

const Text = forwardRef<HTMLSpanElement, TextProps>(
  ({ children, variant = "body", color = "#111", style, ...rest }, ref) => {
    return (
      <span
        ref={ref}
        {...rest} // id, aria-*, data-* 등 모두 OK
        style={{
          margin: 0,
          color,
          fontSize: fontSizeByVariant[variant],
          lineHeight: 1.4,
          fontWeight: variant === "title" ? "bold" : "normal",
          ...style,
        }}
      >
        {children}
      </span>
    );
  }
);

export default Text;
