import { alpha, createTheme } from '@mui/material'

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

const fontFamily = [
  '"Poppins"',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  '"Helvetica Neue"',
  'Arial',
  'sans-serif',
].join(',')

const primaryColor = '#1976D2'

export const theme = createTheme({
  palette: {
    primary: {
      main: primaryColor,
      contrastText: '#ffffff',
    },
    success: {
      main: 'rgba(46, 125, 50, 1)',
      contrastText: 'rgba(255,255,255,0.9)',
    },
    error: {
      main: 'rgba(211, 47, 47, 1)',
      contrastText: 'rgba(255,255,255, 0.9)',
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
    },
    grey: {
      300: 'rgba(0, 0, 0, 0.04)',
      400: 'rgba(0, 0, 0, 0.38)',
      900: 'rgba(117, 117, 117, 1)',
    },
  },
  typography: {
    fontFamily: fontFamily,
    allVariants: {
      fontFamily: fontFamily,
      fontWeight: 400,
    },
    h5: {
      fontFamily: fontFamily,
      fontSize: 24,
      fontWeight: 400,
    },
    h6: {
      fontFamily: fontFamily,
      fontSize: 20,
      fontWeight: 500,
    },
    body1: {
      fontFamily: fontFamily,
      fontSize: 16,
    },
    body2: {
      fontFamily: fontFamily,
      fontSize: 14,
      lineHeight: '20px',
    },
    caption: {
      fontFamily: fontFamily,
      fontSize: 12,
      lineHeight: '20px',
    },
    overline: {
      fontFamily: fontFamily,
      letterSpacing: '1px',
    },
    button: {
      fontFamily: fontFamily,
      fontSize: 13,
      fontWeight: 500,
      lineHeight: '22px',
    },
    subtitle1: {
      fontFamily: fontFamily,
      fontSize: 16,
      fontWeight: 700,
      lineHeight: '28px',
      letterSpacing: '0.15px',
    },
    subtitle2: {
      fontFamily: fontFamily,
      fontSize: 14,
      fontWeight: 500,
      lineHeight: '24px',
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
    MuiAppBar: {
      styleOverrides: {
        root: {
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
        root: {
          paddingTop: 0,
          paddingBottom: 0,
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
    MuiCardContent: {
      styleOverrides: {
        // root: {
        //   ':last-child': {
        //     padding: '0px',
        //   },
        //   '&.section-card-content': {
        //     display: 'flex',
        //     flexDirection: 'column',
        //   },
        //   '&.section-item-card-content': {
        //     width: '100%',
        //   },
        //   '> .section-item-header': {
        //     display: 'flex',
        //     alignItems: 'baseline',
        //     padding: '6px 16px',
        //     whiteSpace: 'pre',
        //     '&.darker': {
        //       backgroundColor: 'rgba(0, 0, 0, 0.08)',
        //     },
        //   },
        //   '> .section-item-header-column': {
        //     flexDirection: 'column',
        //   },
        //   '> .section-item-content': {
        //     padding: '6px 16px',
        //     backgroundColor: '#fff',
        //   },
        //   '> .section-content': {
        //     display: 'flex',
        //     flexDirection: 'row',
        //     width: '100%',
        //   },
        //   '.primary-background-color': {
        //     backgroundColor: alpha(primaryColor, 0.04),
        //   },
        // },
      },
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
              color: alpha(primaryColor, 0.54),
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
            color: 'rgba(0, 0, 0, 0.87)',
          },
        },

        icon: {
          opacity: '0.5',
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
          height: '42px',
          padding: '8px 22px',
          // textTransform: 'inherit',
          fontWeight: 500,
          minWidth: 0,
          '&.disabled': {
            backgroundColor: '#006BA6a7',
            borderColor: '#008fbe',
          },
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
          maxWidth: '350px',
          padding: '4px 8px',
          backgroundColor: 'rgba(97, 97, 97, 0.9)',
          color: '#ffffff',
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
