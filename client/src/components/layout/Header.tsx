import LogoutIcon from '@mui/icons-material/Logout'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useCallback, useState, type MouseEvent } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const initialsOf = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')

export function Header() {
  const { user, status, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

  const closeMenu = useCallback(() => setMenuAnchor(null), [])

  const openMenu = useCallback((event: MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget)
  }, [])

  const handleSignOut = useCallback(async () => {
    closeMenu()
    await signOut()
    navigate('/')
  }, [closeMenu, signOut, navigate])

  const authLinks = (
    <Stack direction="row" spacing={1}>
      <Button
        component={RouterLink}
        to="/signup"
        state={{ from: location.pathname + location.search }}
        variant="outlined"
        size="small"
      >
        Sign up
      </Button>
      <Button
        component={RouterLink}
        to="/signin"
        state={{ from: location.pathname + location.search }}
        variant="contained"
        size="small"
      >
        Sign in
      </Button>
    </Stack>
  )

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(11, 15, 26, 0.82)',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ gap: 1, px: { xs: 1.5, sm: 3 } }}>
        <Stack
          component={RouterLink}
          to="/"
          direction="row"
          spacing={1} sx={{ alignItems: 'center', textDecoration: 'none', color: 'inherit', mr: 2 }}>
          <SportsEsportsIcon color="primary" />
          <Typography
            variant="h6"
            component="span"
            sx={{ letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}
          >
            Game
            <Box component="span" sx={{ color: 'primary.main' }}>
              Vault
            </Box>
          </Typography>
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        {status === 'loading' ? (
          <Skeleton variant="circular" width={36} height={36} />
        ) : user ? (
          <>
            <IconButton
              onClick={openMenu}
              aria-label="Account menu"
              aria-haspopup="true"
              aria-expanded={menuAnchor ? 'true' : undefined}
              size="small"
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {initialsOf(user.name)}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={closeMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              slotProps={{ paper: { sx: { minWidth: 220, mt: 1 } } }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2">{user.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleSignOut}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Sign out</ListItemText>
              </MenuItem>
            </Menu>
          </>
        ) : (
          authLinks
        )}
      </Toolbar>
    </AppBar>
  )
}
