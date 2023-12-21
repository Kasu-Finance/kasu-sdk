import { ReactHTML, ReactNode, createElement } from 'react';
import './typography.scss';

type TypographyProps = {
    children: ReactNode;
    variant: keyof Pick<
        ReactHTML,
        'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
    >;
    className?: string;
};

const Typography: React.FC<TypographyProps> = ({ children, className, variant }) => {
    return createElement(variant, { className }, children);
};

export default Typography;
