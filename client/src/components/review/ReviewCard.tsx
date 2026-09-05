import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt'
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { memo } from 'react'
import type { Review } from '../../types'
import { formatReviewDate } from '../../utils/format'
import { VerifiedPurchaseBadge } from './VerifiedPurchaseBadge'

interface ReviewCardProps {
  review: Review
  isOwn: boolean
  hasVoted: boolean
  onToggleHelpful: (reviewId: string) => void
  onEdit: (review: Review) => void
  onDelete: (review: Review) => void
}

const initialsOf = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')

function ReviewCardComponent({
  review,
  isOwn,
  hasVoted,
  onToggleHelpful,
  onEdit,
  onDelete,
}: ReviewCardProps) {
  return (
    <Box component="article" sx={{ py: 2.5 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: review.verifiedPurchase ? 'success.dark' : 'action.selected',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {initialsOf(review.authorName)}
        </Avatar>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1}
           
            useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {review.authorName}
            </Typography>

            {review.verifiedPurchase ? <VerifiedPurchaseBadge /> : null}

            {isOwn ? (
              <Chip
                label="Your review"
                size="small"
                variant="outlined"
                sx={{ height: 22, fontSize: 11 }}
               />
            ) : null}
          </Stack>

          <Stack
            direction="row"
            spacing={1}
           
           
            useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}>
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

          <Stack
            direction="row"
            spacing={1}
           
           
            useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap', mt: 1.5 }}>
            <Button
              size="small"
              variant={hasVoted ? 'contained' : 'outlined'}
              color={hasVoted ? 'primary' : 'inherit'}
              startIcon={
                hasVoted ? (
                  <ThumbUpAltIcon fontSize="small" />
                ) : (
                  <ThumbUpOffAltIcon fontSize="small" />
                )
              }
              onClick={() => onToggleHelpful(review.id)}
              aria-pressed={hasVoted}
            >
              Helpful ({review.helpfulCount})
            </Button>

            {isOwn ? (
              <>
                <Button
                  size="small"
                  color="inherit"
                  startIcon={<EditOutlinedIcon fontSize="small" />}
                  onClick={() => onEdit(review)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteOutlineIcon fontSize="small" />}
                  onClick={() => onDelete(review)}
                >
                  Delete
                </Button>
              </>
            ) : null}
          </Stack>
        </Box>
      </Stack>

      <Divider sx={{ mt: 2.5 }} />
    </Box>
  )
}

export const ReviewCard = memo(ReviewCardComponent)
