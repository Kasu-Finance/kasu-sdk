import { ReactNode } from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary';
    className?: string;
    children?: ReactNode;
};

const Button: React.FC<ButtonProps> = ({ children, className, ...rest }) => {
    return <button {...rest}>{children}</button>;
};

export default Button;
