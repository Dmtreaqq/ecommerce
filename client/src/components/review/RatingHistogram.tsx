import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Rating, RatingBucket } from '../../types'

interface RatingHistogramProps {
  buckets: RatingBucket[]
  activeRating: Rating | null
  onSelect: (rating: Rating | null) => void
}

/**
 * The 5★→1★ breakdown. Each row is a real button that filters the list to that
 * star rating; clicking the active row clears the filter.
 */
export function RatingHistogram({
  buckets,
  activeRating,
  onSelect,
}: RatingHistogramProps) {
  return (
    <Stack spacing={0.5} sx={{ width: '100%' }}>
      {buckets.map((bucket) => {
        const isActive = activeRating === bucket.rating
        const disabled = bucket.count === 0 && !isActive

        return (
          <ButtonBase
            key={bucket.rating}
            onClick={() => onSelect(isActive ? null : bucket.rating)}
            disabled={disabled}
            aria-pressed={isActive}
            aria-label={`${bucket.rating} star reviews, ${bucket.count} of them, ${bucket.percentage}%${
              isActive ? ' (filter active)' : ''
            }`}
            sx={{
              width: '100%',
              px: 1,
              py: 0.5,
              borderRadius: 1.5,
              justifyContent: 'stretch',
              bgcolor: isActive ? 'action.selected' : 'transparent',
              '&:hover': { bgcolor: 'action.hover' },
              '&.Mui-disabled': { opacity: 0.45 },
            }}
          >
            <Stack
              direction="row"
              spacing={1.25} sx={{ alignItems: 'center', width: '100%' }}>
              <Typography
                variant="body2"
                sx={{
                  minWidth: 44,
                  textAlign: 'left',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  fontWeight: isActive ? 700 : 400,
                  whiteSpace: 'nowrap',
                }}
              >
                {bucket.rating} star
              </Typography>

              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <LinearProgress
                  variant="determinate"
                  value={bucket.percentage}
                  sx={{
                    height: 9,
                    borderRadius: 5,
                    bgcolor: 'action.hover',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 5,
                      bgcolor: isActive ? 'primary.main' : 'warning.main',
                    },
                  }}
                 />
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ minWidth: 38, textAlign: 'right' }}
              >
                {bucket.percentage}%
              </Typography>
            </Stack>
          </ButtonBase>
        )
      })}
    </Stack>
  )
}
