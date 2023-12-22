'use client';

import React, { ReactNode } from 'react';
import { StyledContainer } from './container.style';
import { Interpolation } from 'styled-components';

type ContainerProps = {
    children: ReactNode;
    styles?: Interpolation<React.CSSProperties>;
};

const Container: React.FC<ContainerProps> = ({ children, styles }) => {
    return (
        <StyledContainer className='container' styles={styles}>
            {children}
        </StyledContainer>
    );
};

export default Container;
