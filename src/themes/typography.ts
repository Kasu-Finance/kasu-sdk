import { TypographyVariantsOptions } from '@mui/material'
import { Barlow_Condensed, Open_Sans } from 'next/font/google'

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    baseLg: true
    baseLgBold: true
    baseMd: true
    baseMdBold: true
    baseSm: true
    baseSmBold: true
    baseXs: true
    baseXsBold: true
  }
}
declare module '@mui/material/styles/createTypography' {
  interface Typography {
    baseLg: TypographyStyleOptions
    baseLgBold: TypographyStyleOptions
    baseMd: TypographyStyleOptions
    baseMdBold: TypographyStyleOptions
    baseSm: TypographyStyleOptions
    baseSmBold: TypographyStyleOptions
    baseXs: TypographyStyleOptions
    baseXsBold: TypographyStyleOptions
  }

  interface TypographyOptions {
    baseLg: TypographyStyleOptions
    baseLgBold: TypographyStyleOptions
    baseMd: TypographyStyleOptions
    baseMdBold: TypographyStyleOptions
    baseSm: TypographyStyleOptions
    baseSmBold: TypographyStyleOptions
    baseXs: TypographyStyleOptions
    baseXsBold: TypographyStyleOptions
  }
}

const openSans = Open_Sans({ preload: false })
const barlowCondensed = Barlow_Condensed({
  preload: false,
  weight: ['400', '500', '600'],
})

export const primaryFontFamily = openSans.style.fontFamily
export const headingFontFamily = barlowCondensed.style.fontFamily

export const customTypography: TypographyVariantsOptions = {
  baseLg: {
    fontFamily: primaryFontFamily,
    fontWeight: 400,
    fontSize: 16,
  },
  baseLgBold: {
    fontFamily: primaryFontFamily,
    fontWeight: 700,
    fontSize: 16,
  },
  baseMd: {
    fontFamily: primaryFontFamily,
    fontWeight: 400,
    fontSize: 14,
    lineHeight: '21px',
  },
  baseMdBold: {
    fontFamily: primaryFontFamily,
    fontWeight: 600,
    fontSize: 14,
    lineHeight: '21px',
  },
  baseSm: {
    fontFamily: primaryFontFamily,
    fontWeight: 400,
    fontSize: 12,
  },
  baseSmBold: {
    fontFamily: primaryFontFamily,
    fontWeight: 700,
    fontSize: 12,
  },
  baseXs: {
    fontFamily: primaryFontFamily,
    fontWeight: 400,
    fontSize: 10,
  },
  baseXsBold: {
    fontFamily: primaryFontFamily,
    fontWeight: 700,
    fontSize: 10,
  },
  fontFamily: primaryFontFamily,
  allVariants: {
    fontFamily: primaryFontFamily,
    fontWeight: 400,
  },
  h1: {
    fontFamily: headingFontFamily,
    fontSize: 64,
    fontWeight: 600,
  },

  h2: {
    fontFamily: headingFontFamily,
    fontSize: 48,
    fontWeight: 500,
  },
  h3: {
    fontFamily: headingFontFamily,
    fontSize: 32,
    fontWeight: 500,
  },
  h4: {
    fontFamily: headingFontFamily,
    fontSize: 24,
    fontWeight: 500,
  },
  h5: {
    fontFamily: headingFontFamily,
    fontSize: 20,
    fontWeight: 500,
  },
  h6: {
    fontFamily: headingFontFamily,
    fontSize: 16,
    fontWeight: 500,
  },
}
