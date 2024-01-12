'use client'

import React, { ReactNode } from 'react'
import { Interpolation } from 'styled-components'

import { StyledContainer } from './container.style'

type ContainerProps = {
  children: ReactNode
  styles?: Interpolation<React.CSSProperties>
}

const Container: React.FC<ContainerProps> = ({ children, styles }) => {
  return (
    <StyledContainer className='container' styles={styles}>
      {children}
    </StyledContainer>
  )
}

export default Container
