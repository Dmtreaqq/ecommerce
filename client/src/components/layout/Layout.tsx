import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'

export function Layout() {
  return (
    <Box
      sx={{ minHeight: '100svh', display: 'flex', flexDirection: 'column' }}
    >
      <Header />

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>

      <Box component="footer" sx={{ mt: 8 }}>
        <Divider />
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Typography variant="body2" color="text.secondary" align={"center"}>
            GameVault — a demo storefront. Accounts are mock data.
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}
