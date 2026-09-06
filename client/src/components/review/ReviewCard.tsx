import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { memo } from 'react'
import type { Review } from '../../types'
import { formatReviewDate } from '../../utils/format'

interface ReviewCardProps {
  review: Review
}

const initialsOf = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')

function ReviewCardComponent({ review }: ReviewCardProps) {
  return (
    <Box component="article" sx={{ py: 2.5 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'action.selected',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {initialsOf(review.authorName)}
        </Avatar>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {review.authorName}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}
          >
            <Rating value={review.rating} readOnly size="small" />
            <Typography variant="caption" color="text.secondary">
              {formatReviewDate(review.createdAt)}
            </Typography>
          </Stack>

          <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1 }}>
            {review.title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, whiteSpace: 'pre-wrap', lineHeight: 1.65 }}
          >
            {review.body}
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ mt: 2.5 }} />
    </Box>
  )
}

export const ReviewCard = memo(ReviewCardComponent)
