'use client';

import styled, { Interpolation } from 'styled-components';

type StyledContainerProps = {
    children: React.ReactNode;
    styles?: Interpolation<React.CSSProperties>;
};

export const StyledContainer = styled.div<StyledContainerProps>`
    max-width: calc(1440px + 10rem);
    width: 100%;
    padding: 0 5rem;
    ${({ styles }) => styles}
`;
