import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <Stack spacing={2} role="status" sx={{ alignItems: 'center', py: 8 }}>
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  )
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <Alert
      severity="error"
      icon={<ErrorOutlineIcon />}
      action={
        onRetry ? (
          <Button color="inherit" size="small" onClick={onRetry}>
            Retry
          </Button>
        ) : undefined
      }
      sx={{ my: 3 }}
    >
      {message}
    </Alert>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <Stack spacing={1.5} sx={{ alignItems: "center", py: { xs: 5, sm: 8 }, px: 2 }}>
      {icon ? (
        <Box sx={{ color: 'text.disabled', display: 'flex' }}>{icon}</Box>
      ) : null}
      <Typography variant="h6" align={"center"}>
        {title}
      </Typography>
      {description ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 420 }} align={"center"}>
          {description}
        </Typography>
      ) : null}
      {action}
    </Stack>
  )
}
