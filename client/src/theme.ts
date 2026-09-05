import { createTheme, responsiveFontSizes } from '@mui/material/styles'

/** Dark gaming palette: deep slate ground with cyan and violet accents. */
const base = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#22d3ee', contrastText: '#04141a' },
    secondary: { main: '#a855f7' },
    success: { main: '#34d399' },
    warning: { main: '#fbbf24' },
    background: { default: '#0b0f1a', paper: '#131a2a' },
    text: { primary: '#e8edf7', secondary: '#94a3b8' },
    divider: 'rgba(148, 163, 184, 0.18)',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily:
      '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(900px 500px at 12% -8%, rgba(34, 211, 238, 0.10), transparent 60%),' +
            'radial-gradient(800px 480px at 92% 0%, rgba(168, 85, 247, 0.10), transparent 55%)',
          backgroundAttachment: 'fixed',
        },
        // Keep long product names and review bodies from forcing sideways scroll.
        'h1, h2, h3, h4, h5, h6, p': { overflowWrap: 'anywhere' },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        // Comfortable touch targets on mobile.
        root: { minHeight: 44, borderRadius: 10 },
        sizeSmall: { minHeight: 36 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: { borderColor: 'rgba(148, 163, 184, 0.18)' },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600 } },
    },
    MuiRating: {
      styleOverrides: { iconEmpty: { color: 'rgba(148, 163, 184, 0.35)' } },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
    },
  },
})

export const theme = responsiveFontSizes(base)
