import Box from '@mui/material/Box'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { Rating as StarRating, ReviewStats } from '../../types'
import { RatingHistogram } from './RatingHistogram'

interface ReviewSummaryProps {
  stats: ReviewStats
  activeRating: StarRating | null
  onSelectRating: (rating: StarRating | null) => void
}

/** Average score beside the clickable star breakdown. */
export function ReviewSummary({
  stats,
  activeRating,
  onSelectRating,
}: ReviewSummaryProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 2.5, sm: 4 }} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
      <Stack
       
        spacing={0.5} sx={{ alignItems: "center", justifyContent: "center", minWidth: { sm: 160 } }}>
        <Typography
          variant="h2"
          component="p"
          sx={{ fontWeight: 800, lineHeight: 1 }}
        >
          {stats.average.toFixed(1)}
        </Typography>
        <Rating value={stats.average} precision={0.1} readOnly />
        <Typography variant="body2" color="text.secondary">
          {stats.total} {stats.total === 1 ? 'review' : 'reviews'}
        </Typography>
      </Stack>

      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <RatingHistogram
          buckets={stats.buckets}
          activeRating={activeRating}
          onSelect={onSelectRating}
         />
      </Box>
    </Stack>
  )
}
