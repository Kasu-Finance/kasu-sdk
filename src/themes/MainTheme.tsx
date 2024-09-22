import { alpha, createTheme } from '@mui/material'

import { customPalette } from '@/themes/palette'
import { customTypography, primaryFontFamily } from '@/themes/typography'

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xxl: true
  }
}

declare module '@mui/material/Divider' {
  interface DividerPropsVariantOverrides {
    dotted: true
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    dark: true
  }
}

export const theme = createTheme({
  palette: customPalette,
  typography: customTypography,
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

      html{
        height: 100%;
      }

      body {
        font-family: ${primaryFontFamily};
        height: 100%;
        display:grid;
        grid-template-rows: max-content minmax(max-content, 1fr) max-content;
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

      a{
        outline:none;
        position:relative;

        &:focus:before {
          position: absolute;
          content: "";
          width: calc(100% + 4px);
          height: calc(100% + 2px);
          border: 2px dotted ${customPalette.primary.main};
          border-radius: 4px;
          top: 0;
          left: -2px;
        }
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
      variants: [
        {
          props: { variant: 'dotted' },
          style: {
            backgroundColor: 'unset',
            borderStyle: 'dotted',
            borderColor: 'rgba(164, 123, 79, 1)',
          },
        },
      ],
      styleOverrides: {
        root: {
          borderColor: 'rgba(40, 40, 42, 1)',
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
        root: {},
        mark: {
          '&[data-index="0"]': {},
        },
        markActive: {},
        rail: {},
        track: {},
        thumb: {},
        valueLabel: {},
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
            backgroundColor: alpha(customPalette.primary.main, 0.04),
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
              backgroundColor: alpha(customPalette.primary.main, 0.04),
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
              color: customPalette.primary.main,
            },
          },
          '&:hover': {
            '.MuiTableSortLabel-icon': {
              color: alpha(customPalette.primary.main, 0.87),
              opacity: 1,
            },
          },
          '.MuiTableSortLabel-icon': {
            // Default icon color (inactive)
            color: alpha(customPalette.primary.contrastText, 0.54),
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
          background: alpha(customPalette.primary.main, 0.08),
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          li: {
            '&:first-child': {
              marginRight: 80,
            },
            '&:last-child': {
              marginLeft: 80,
            },
          },
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          '&:not(.MuiPaginationItem-ellipsis)': {
            background: '#C4996C',
            color: 'white',
          },
          '&.MuiPaginationItem-ellipsis': {
            color: '#C4996C',
          },
          '&:hover': {
            background: '#E8C091',
          },
          '&.Mui-selected': {
            background: 'transparent',
            color: '#C4996C',
            border: '1px solid #C4996C',
            pointerEvents: 'none',
            '&:focus': {
              background: 'transparent',
            },
          },
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
    MuiAvatar: {
      styleOverrides: {
        root: {
          '&[href]': {
            position: 'relative',
            overflow: 'unset',
            outline: 'none',
            border: 'none',
            borderRadius: '50%',
            img: {
              borderRadius: 'inherit',
            },
            '&:focus:before': {
              content: '""',
              width: 'calc(100% + 6px)',
              height: 'calc(100% + 6px)',
              border: '2px dotted #C4996C',
              position: 'absolute',
              borderRadius: 'inherit',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            },
          },
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          position: 'relative',
          '&:not(.MuiIconButton-root)': {
            '&:focus:before': {
              content: '""',
              width: 'calc(100% + 6px)',
              height: 'calc(100% + 6px)',
              border: `2px dotted ${customPalette.primary.main}`,
              position: 'absolute',
              borderRadius: 'inherit',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            },
            '&.MuiButton-colorDark:focus:before': {
              borderColor: customPalette.gray.dark,
            },
          },
        },
      },
    },
    MuiButton: {
      variants: [
        {
          props: { color: 'dark' },
          style: {
            background: customPalette.gray.extraDark,
            color: customPalette.gold.dark,
          },
        },
      ],
      styleOverrides: {
        root: {
          fontWeight: 500,
          minWidth: 0,
          boxShadow: 'none',
          borderRadius: 120,
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
        sizeMedium: {
          height: '42px',
        },
        sizeSmall: {
          height: '30px',
          pl: 1.25,
          pr: 1.25,
        },
        contained: {
          color: 'white',
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
            color: customPalette.primary.main,
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          height: '30px',
          color: customPalette.primary.main,
          fontSize: 13,
          fontWeight: 500,
          padding: '4px 10px',
          letterSpacing: '0.46px',
          border: `1px solid ${alpha(customPalette.primary.main, 0.5)}`,
          '&.Mui-selected, &.Mui-selected:hover': {
            backgroundColor: customPalette.primary.main,
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
