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
import { ApiError, toErrorMessage } from '../api/client'
import { useAuth } from '../hooks/useAuth'

const NAME_MAX = 100
const EMAIL_MAX = 255
const PASSWORD_MIN = 8
const PASSWORD_MAX = 72

interface LocationState {
  from?: string
}

interface FieldErrors {
  name?: string
  email?: string
  password?: string
}

export default function SignUpPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, signUp } = useAuth()

  const from = (location.state as LocationState | null)?.from ?? '/'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Already signed in? Don't show the form.
  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user, from, navigate])

  const validate = useCallback((): FieldErrors => {
    const nextErrors: FieldErrors = {}

    if (!name.trim()) {
      nextErrors.name = 'Name is required.'
    } else if (name.trim().length > NAME_MAX) {
      nextErrors.name = `Name must be ${NAME_MAX} characters or fewer.`
    }

    if (!email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    } else if (email.trim().length > EMAIL_MAX) {
      nextErrors.email = `Email must be ${EMAIL_MAX} characters or fewer.`
    }

    if (!password) {
      nextErrors.password = 'Password is required.'
    } else if (password.length < PASSWORD_MIN) {
      nextErrors.password = `Password must be at least ${PASSWORD_MIN} characters.`
    } else if (password.length > PASSWORD_MAX) {
      nextErrors.password = `Password must be ${PASSWORD_MAX} characters or fewer.`
    }

    return nextErrors
  }, [name, email, password])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setFormError(null)

      const nextErrors = validate()
      setErrors(nextErrors)
      if (Object.keys(nextErrors).length > 0) return

      setSubmitting(true)
      try {
        // The password keeps its outer spaces; they are real characters in it.
        await signUp(name.trim(), email.trim(), password)
        navigate(from, { replace: true })
      } catch (error: unknown) {
        // A taken email belongs next to the field the user has to change.
        if (error instanceof ApiError && error.status === 409) {
          setErrors({ email: toErrorMessage(error) })
        } else {
          setFormError(toErrorMessage(error))
        }
      } finally {
        setSubmitting(false)
      }
    },
    [validate, signUp, name, email, password, navigate, from],
  )

  return (
    <Container maxWidth="xs" sx={{ py: { xs: 5, md: 8 } }}>
      <Stack spacing={1} sx={{ alignItems: 'center', mb: 3 }}>
        <SportsEsportsIcon color="primary" sx={{ fontSize: 40 }} />
        <Typography variant="h5" component="h1">
          Create your GameVault account
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          Signing up earns your reviews the Verified Purchase badge and keeps
          them tied to your name.
        </Typography>
      </Stack>

      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2.5}>
            {formError ? <Alert severity="error">{formError}</Alert> : null}

            <TextField
              label="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              error={Boolean(errors.name)}
              helperText={errors.name}
              autoComplete="name"
              autoFocus
              required
              fullWidth
              slotProps={{ htmlInput: { maxLength: NAME_MAX } }}
            />

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              error={Boolean(errors.email)}
              helperText={errors.email}
              autoComplete="email"
              required
              fullWidth
              slotProps={{ htmlInput: { maxLength: EMAIL_MAX } }}
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              error={Boolean(errors.password)}
              helperText={
                errors.password ?? `At least ${PASSWORD_MIN} characters.`
              }
              autoComplete="new-password"
              required
              fullWidth
              slotProps={{
                htmlInput: { maxLength: PASSWORD_MAX },
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
              Create account
            </Button>
          </Stack>
        </Box>
      </Paper>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 3 }}
        align="center"
      >
        Already have an account?{' '}
        <Box
          component={RouterLink}
          to="/signin"
          state={{ from }}
          sx={{ color: 'primary.main' }}
        >
          Sign in
        </Box>
      </Typography>
    </Container>
  )
}
