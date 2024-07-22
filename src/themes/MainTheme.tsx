import { alpha, createTheme, lighten } from '@mui/material'

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xxl: true
  }
}

declare module '@mui/material/styles/createPalette' {
  interface Palette {
    highlight: {
      background: string
      border: string
    }
    icon: {
      primary: string
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
  }
}

const primaryFontFamily = ['Barlow'].join(',')
const barlowSemiCondensedFontFamily = ['Barlow Semi Condensed'].join(',')
const condensedFontFamily = ['Barlow Condensed'].join(',')
const khmerFontFamily = ['Noto Sans Khmer'].join(',')

const primaryColor = '#e5c397'
const primaryContrastColor = '#28282a'

const customTheme = createTheme({
  palette: {
    background: {
      default: primaryContrastColor,
    },
    primary: {
      main: primaryColor,
      contrastText: primaryContrastColor,
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
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0,0,0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    grey: {
      200: 'rgba(224, 224, 224, 1)',
      300: 'rgba(0, 0, 0, 0.04)',
      400: 'rgba(0, 0, 0, 0.38)',
      500: 'rgba(0, 0, 0, 0.6)',
      600: 'rgba(0, 0, 0, 0.12)',
      900: 'rgba(117, 117, 117, 1)',
    },
    info: {
      main: '#e5f3fa',
    },
  },
  typography: {
    fontFamily: primaryFontFamily,
    allVariants: {
      fontFamily: condensedFontFamily,
      fontWeight: 400,
    },
    h5: {
      fontFamily: condensedFontFamily,
      fontSize: 24,
      fontWeight: 400,
    },
    h6: {
      fontFamily: condensedFontFamily,
      fontSize: 20,
      fontWeight: 500,
      letterSpacing: '0.15px',
    },
    body1: {
      fontFamily: khmerFontFamily,
      fontSize: 14,
      lineHeight: '21px',
      letterSpacing: '0.15px',
    },
    body2: {
      fontFamily: khmerFontFamily,
      fontSize: 12,
      lineHeight: '17.16px',
      letterSpacing: '0.17px',
    },
    caption: {
      fontFamily: khmerFontFamily,
      fontSize: 12,
      lineHeight: '20px',
      letterSpacing: '0.4px',
    },
    overline: {
      fontFamily: primaryFontFamily,
      letterSpacing: '1px',
    },
    button: {
      fontFamily: primaryFontFamily,
      fontSize: 15,
      fontWeight: 500,
      lineHeight: '26px',
      letterSpacing: '0.46px',
    },
    subtitle1: {
      fontFamily: barlowSemiCondensedFontFamily,
      fontSize: 16,
      fontWeight: 700,
      lineHeight: '28px',
      letterSpacing: '0.15px',
    },
    subtitle2: {
      fontFamily: primaryFontFamily,
      fontSize: 14,
      fontWeight: 500,
      lineHeight: '22px',
      letterSpacing: '0.1px',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
      xxl: 1921,
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: `

      body {
        font-family: ${primaryFontFamily};
      }

      main {
        margin-top: 24px;
        padding-bottom: 16px;
        overflow-x: hidden;
        position: relative;
        z-index: 1;
      }

      ul{
        padding-left: 1.5em;
      }
      
      .slide-enter {
        opacity: 0;
        transform: translateX(100%);
      }
      
      .slide-enter-active {
        opacity: 1;
        transform: translateX(0);
        transition: opacity 500ms, transform 500ms;
      }
      
      .slide-exit {
        opacity: 1;
        transform: translateX(0);
      }
      
      .slide-exit-active {
        opacity: 0;
        transform: translateX(-100%);
        transition: opacity 500ms, transform 500ms;
      }

      .hide-overflow-mobile {
        @media (max-width: 600px) { 
          overflow-x: hidden; 
        }
      }

      .top-layout-bg {
        background: url("/images/bg-image-top.png") no-repeat;
        background-size: cover;
        background-position: bottom;
        height: 362px;
        position: fixed;
        top: 0;
        width: 100%;
        z-index:0;
      }
      
      .bottom-layout-bg{
        background: url("/images/bg-image-bottom.png") no-repeat;
        background-size: cover;
        background-position: top;
        height: 362px;
        position: fixed;
        bottom: 0;
        width: 100%;
        z-index:0;
      }

      .light-colored-background {
        background-color: rgba(211, 179, 139, 0.12);
      }
      .light-error-background {
        background-color: rgba(211, 47, 47, 0.04);
      }
    `,
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          background: '#ffffff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {},
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: 0,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          ['@media (max-width:600px)']: {
            backgroundColor: 'rgba(224, 193, 156, 1)',
          },
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        root: {},
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {},
      },
    },
    MuiList: {
      styleOverrides: {
        root: {},
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          height: 4,
          marginLeft: 'auto',
          marginRight: 'auto',
          display: 'block',
        },
        mark: {
          width: 8,
          height: 8,
          borderRadius: '2px',
          backgroundImage: 'url("/images/seamless-noise-20.png")',
          backgroundRepeat: 'repeat',
          backgroundColor: 'rgba(211, 179, 139, 1)',
          backgroundPosition: '0 0',
          backgroundSize: '120px 86px',
          '&[data-index="0"]': {
            marginLeft: '2px',
          },
        },
        markActive: {
          width: 4,
          height: 4,
          backgroundColor: lighten('#ffffff', 0.2),
        },
        rail: {
          backgroundImage: 'url("/images/seamless-noise-20.png")',
          backgroundRepeat: 'repeat',
          backgroundColor: 'rgba(161, 136, 106, 1)',
          backgroundPosition: '0 0',
          backgroundSize: '120px 86px',
          padding: 1,
          border: 'none',
        },
        track: {
          backgroundImage: 'url("/images/seamless-noise-20.png")',
          backgroundRepeat: 'repeat',
          backgroundColor: 'rgba(161, 136, 106, 1)',
          backgroundPosition: '0 0',
          backgroundSize: '120px 86px',
          padding: 1,
          border: 'none',
        },
        thumb: {
          backgroundImage: 'url("/images/seamless-noise-20.png")',
          backgroundRepeat: 'repeat',
          backgroundColor: 'rgba(211, 179, 139, 1)',
          backgroundPosition: '0 0',
          backgroundSize: '120px 86px',
        },
        valueLabel: {
          background: 'rgba(40, 40, 42, 0.6)',
          '&:before': {
            background: 'rgb(126 126 127)',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          width: 444,
        },
        standardError: {
          '& .MuiAlert-action > .MuiButton-root': {
            '.MuiTouchRipple-child': {
              backgroundColor: 'rgba(211, 47, 47, 1)',
            },
            '& > .MuiTypography-root': {
              color: 'rgba(211, 47, 47, 1)',
            },
            '& > svg > path': {
              fill: 'rgba(211, 47, 47, 1)',
            },
          },
        },
        standardSuccess: {
          '& .MuiAlert-action > .MuiButton-root': {
            '.MuiTouchRipple-child': {
              backgroundColor: 'rgba(46, 125, 50, 1)',
            },
            '& > .MuiTypography-root': {
              color: 'rgba(46, 125, 50, 1)',
            },
            '& > svg > path': {
              fill: 'rgba(46, 125, 50, 1)',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderRadius: 0,

          '&.section-card': {
            borderRadius: '8px',
            overflow: 'inherit',
            backgroundColor: alpha(primaryColor, 0.04),
          },
          '&.section-item-card': {
            border: '1px solid rgba(0, 0, 0, 0.12)',
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
            borderRadius: '4px',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          backgroundImage: 'url("/images/seamless-noise-20.png")',
          backgroundRepeat: 'repeat',
          backgroundColor: 'rgba(229, 195, 151, 1)',
          backgroundPosition: '0 0',
          backgroundSize: '120px 86px',
          fontWeight: 500,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {},
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            backgroundColor: 'white',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'white',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          width: '64px',
          height: '50px',
          bgcolor: 'rgba(0, 0, 0, 0.04)',
          textAlign: 'center',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          boxShadow: 'unset',
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '16px',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          '&.tooltipTable': {
            '& .MuiTableCell-root': {
              color: '#fff',
              paddingLeft: 0,
              fontFamily: primaryFontFamily,
              fontSize: '0.6875rem',
            },
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '&.staking-history-table-head': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
          '&.default-table-head': {
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
          },
          '&.create-vault-table-head': {
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
            height: '56px',
            th: {
              verticalAlign: 'middle',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          '&.p-64': {
            paddingLeft: '64px',
          },
          minWidth: '0px',
          wordWrap: 'break-word',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          whiteSpace: 'nowrap',
          ':last-child>td': {
            borderBottom: 'unset',
          },
          '&.staking-vault': {
            '&.vault-details': {
              backgroundColor: alpha(primaryColor, 0.04),
            },
          },
        },
      },
    },
    MuiTableSortLabel: {
      styleOverrides: {
        root: {
          // Default styles for the root element
          '&.Mui-active': {
            '.MuiTableSortLabel-icon': {
              color: primaryColor,
            },
          },
          '&:hover': {
            '.MuiTableSortLabel-icon': {
              color: alpha(primaryColor, 0.87),
              opacity: 1,
            },
          },
          '.MuiTableSortLabel-icon': {
            // Default icon color (inactive)
            color: alpha(primaryContrastColor, 0.54),
          },
        },

        icon: {
          opacity: '0.5',
        },
      },
    },
    MuiTableFooter: {
      styleOverrides: {
        root: {
          background: alpha(primaryColor, 0.08),
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          fontSize: 12,
        },
        selectLabel: {
          fontSize: 12,
        },
        displayedRows: {
          fontSize: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          '&.MuiButton-sizeMedium': {
            height: '42px',
            // background: 'red !important',
            // padding: '8px 22px',
          },
          '&.MuiButton-sizeSmall': {
            height: '30px',
            pl: 1.25,
            pr: 1.25,
            // background: 'blue !important',
          },

          // textTransform: 'inherit',
          fontWeight: 500,
          minWidth: 0,
          boxShadow: 'none',

          '&.Mui-disabled': {
            pointerEvents: 'visible',
            cursor: 'not-allowed',
            boxShadow: 'none',
          },
          '&:hover': {
            boxShadow: 'none',
          },
          '&:active': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundImage: 'url("/images/seamless-noise-20.png")',
          backgroundRepeat: 'repeat',
          backgroundColor: 'rgba(211, 179, 139, 1)',
          backgroundPosition: '0 0',
          backgroundSize: '120px 86px',
          fontWeight: 700,

          '&.Mui-disabled': {
            backgroundColor: 'rgba(127, 116, 102, 0.26)',
            color: '#7F7466',
            opacity: 0.8,
          },
        },
        containedSuccess: {
          color: '#fff',
          backgroundColor: 'rgba(171, 212, 140, 1)',
        },
        containedError: {
          color: '#fff',
          backgroundColor: 'rgba(212, 98, 98, 1)',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          display: 'flex',
          alignItems: 'center',
          gap: '0.2rem',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          paddingLeft: '0.7rem',
          gap: '0.2rem',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: 'white',
          '&.hook-loading': {
            color: primaryColor,
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          height: '30px',
          color: primaryColor,
          fontSize: 13,
          fontWeight: 500,
          padding: '4px 10px',
          letterSpacing: '0.46px',
          border: `1px solid ${alpha(primaryColor, 0.5)}`,
          '&.Mui-selected, &.Mui-selected:hover': {
            backgroundColor: primaryColor,
            color: 'white',
          },
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        placement: 'right',
        arrow: true,
      },
      styleOverrides: {
        tooltip: {
          maxWidth: '460px',
          maxHeight: '360px',
          overflow: 'auto',
          lineHeight: 1.5,
          padding: '4px 8px 6px 8px',
          backgroundColor: 'rgba(97, 97, 97, 0.9)',
          color: '#ffffff',
          backdropFilter: 'blur(3px)',
          borderRadius: '4px',
          boxShadow: '0px 3px 5px -1px rgba(0, 0, 0, 0.2)',
          filter:
            'drop-shadow(0px 6px 10px rgba(0, 0, 0, 0.14)) drop-shadow(0px 1px 18px rgba(0, 0, 0, 0.12))',
        },

        arrow: {
          color: 'rgba(97, 97, 97, 0.9)',
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          '&.sm': {
            width: 16,
            height: 16,
          },
          '&.md': {
            width: 18,
            height: 18,
          },
          '&.lg': {
            width: 20,
            height: 20,
          },
          '&.xl': {
            width: 22,
            height: 22,
          },
        },
      },
    },
  },
})

export const theme = customTheme
