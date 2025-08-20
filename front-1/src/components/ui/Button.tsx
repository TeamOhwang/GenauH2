import  {forwardRef, ReactNode } from "react";

type OwnProps = {
  children: ReactNode;
  style?: React.CSSProperties; 
};

type ButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> & OwnProps;

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ type = "button", disabled = false, children, style, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        {...rest} // id, name, aria-*, data-*, form 등 모두 OK
        style={{
          padding: "8px 16px",
          fontSize: 15,
          border: "none",
          borderRadius: 6,
          backgroundColor: disabled ? "#ccc" : "#007bff",
          color: "#fff",
          cursor: disabled ? "not-allowed" : "pointer",
          ...style,
        }}
      >
        {children}
      </button>
    );
  }
);

export default Button;
