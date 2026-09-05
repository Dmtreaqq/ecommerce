import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { toErrorMessage } from '../api/client'
import { useAuth } from '../hooks/useAuth'
import { DEMO_CREDENTIALS } from '../mocks/users'

interface LocationState {
  from?: string
}

export default function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signIn } = useAuth()

  const from = (location.state as LocationState | null)?.from ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Already signed in? Don't show the form.
  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user, from, navigate])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setFormError(null)

      const nextErrors: { email?: string; password?: string } = {}
      if (!email.trim()) {
        nextErrors.email = 'Email is required.'
      } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
        nextErrors.email = 'Enter a valid email address.'
      }
      if (!password) {
        nextErrors.password = 'Password is required.'
      }

      setErrors(nextErrors)
      if (Object.keys(nextErrors).length > 0) return

      setSubmitting(true)
      try {
        await signIn(email.trim(), password)
        navigate(from, { replace: true })
      } catch (error: unknown) {
        setFormError(toErrorMessage(error))
      } finally {
        setSubmitting(false)
      }
    },
    [email, password, signIn, navigate, from],
  )

  const fillDemo = useCallback(() => {
    setEmail(DEMO_CREDENTIALS.email)
    setPassword(DEMO_CREDENTIALS.password)
    setErrors({})
    setFormError(null)
  }, [])

  return (
    <Container maxWidth="xs" sx={{ py: { xs: 5, md: 8 } }}>
      <Stack spacing={1} sx={{ alignItems: 'center', mb: 3 }}>
        <SportsEsportsIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h5" component="h1">
          Sign in to GameVault
        </Typography>
        <Typography variant="body2" color="text.secondary" align={"center"}>
          You don't need an account to leave a review — but signing in earns you
          the Verified Purchase badge.
        </Typography>
      </Stack>

      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Alert
          severity="info"
          variant="outlined"
          sx={{ mb: 2.5 }}
          action={
            <Button color="inherit" size="small" onClick={fillDemo}>
              Use
            </Button>
          }
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Demo account
          </Typography>
          <Typography variant="caption" component="div">
            {DEMO_CREDENTIALS.email} / {DEMO_CREDENTIALS.password}
          </Typography>
        </Alert>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2.5}>
            {formError ? <Alert severity="error">{formError}</Alert> : null}

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={Boolean(errors.email)}
              helperText={errors.email}
              autoComplete="email"
              autoFocus
              required
              fullWidth
             />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={Boolean(errors.password)}
              helperText={errors.password}
              autoComplete="current-password"
              required
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((value) => !value)}
                        edge="end"
                        aria-label={
                          showPassword ? 'Hide password' : 'Show password'
                        }
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
             />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              loading={submitting}
            >
              Sign in
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 3 }} align={"center"}>
        <Box component={RouterLink} to="/" sx={{ color: 'primary.main' }}>
          Continue browsing without signing in
        </Box>
      </Typography>
    </Container>
  )
}
