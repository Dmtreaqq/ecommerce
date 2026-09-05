import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ py: { xs: 8, md: 12 } }}>
      <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h2" component="h1" sx={{ fontWeight: 800 }}>
          404
        </Typography>
        <Typography variant="h6">This page has left the lobby</Typography>
        <Typography variant="body2" color="text.secondary">
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 1 }}>
          Back to store
        </Button>
      </Stack>
    </Container>
  )
}
