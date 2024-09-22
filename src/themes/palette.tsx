import { PaletteOptions } from '@mui/material'

declare module '@mui/material/styles/createPalette' {
  interface Palette {
    highlight: {
      background: string
      border: string
    }
    icon: {
      primary: string
    }
    dark: string
    gray: {
      extraLight: string
      light: string
      middle: string
      dark: string
      extraDark: string
      pattern: string
      noises: string
    }
    gold: {
      extraLight: string
      light: string
      middle: string
      dark: string
      extraDark: string
      pattern: string
      noises: string
      darkNoises: string
      lightNoises: string
    }
  }

  interface PaletteOptions {
    highlight: {
      background: string
      border: string
    }
    icon: {
      primary: string
    }
    dark: string
    gray: {
      extraLight: string
      light: string
      middle: string
      dark: string
      extraDark: string
      pattern: string
      noises: string
    }
    gold: {
      extraLight: string
      light: string
      middle: string
      dark: string
      extraDark: string
      pattern: string
      noises: string
      darkNoises: string
      lightNoises: string
    }
  }
}

export const customPalette = {
  background: {
    default: 'white',
  },
  primary: {
    main: '#C4996C',
    contrastText: '#28282a',
    dark: 'rgba(161, 136, 106, 1)',
    light: 'rgba(229, 195, 151, 1)',
  },
  success: {
    main: 'rgba(171, 212, 140, 1)',
    contrastText: 'rgba(255,255,255,0.9)',
    dark: 'rgba(27, 94, 32, 1)',
  },
  error: {
    main: 'rgba(212, 98, 98, 1)',
    contrastText: 'rgba(255,255,255, 0.9)',
    dark: 'rgba(164, 45, 45, 1)',
    light: 'rgba(223, 139, 139, 1)',
  },
  warning: {
    main: 'rgba(212, 183, 98, 1)',
    dark: 'rgba(230, 81, 0, 1)',
  },
  highlight: {
    background: 'rgba(42, 162, 202, 0.08)',
    border: 'rgba(42, 162, 202, 0.3)',
  },
  icon: {
    primary: 'rgba(0, 0, 0, 0.54)',
  },
  text: {
    primary: 'rgba(40, 40, 42, 1)',
    secondary: 'rgba(0,0,0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  grey: {
    200: 'rgba(205, 206, 208, 1)',
    300: 'rgba(142, 142, 146, 1)',
    400: 'rgba(0, 0, 0, 0.38)',
    500: 'rgba(0, 0, 0, 0.6)',
    600: 'rgba(0, 0, 0, 0.12)',
    900: 'rgba(117, 117, 117, 1)',
  },
  dark: 'rgba(40, 40, 42, 1)',
  info: {
    main: '#e5f3fa',
  },
  gray: {
    extraLight: 'rgba(244, 244, 244, 1)',
    light: 'rgba(205, 206, 208, 1)',
    middle: 'rgba(142, 142, 146, 1)',
    dark: 'rgba(91, 91, 96, 1)',
    extraDark: 'rgba(40, 40, 42, 1)',
    pattern: 'rgba(255, 255, 255, 1)',
    noises: 'rgba(244, 244, 244, 1)',
  },
  gold: {
    extraLight: 'rgba(244, 244, 244, 1)',
    light: 'rgba(205, 206, 208, 1)',
    middle: 'rgba(232, 192, 145, 1)',
    dark: 'rgba(196, 153, 108, 1)',
    extraDark: 'rgba(164, 123, 79, 1)',
    pattern: 'rgba(255, 255, 255, 1)',
    noises: 'rgba(244, 244, 244, 1)',
    darkNoises: 'rgba(205, 163, 112, 1)',
    lightNoises: 'rgba(244, 244, 244, 1)',
  },
} as const satisfies PaletteOptions
