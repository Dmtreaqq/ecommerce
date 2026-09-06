import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import Pagination from '@mui/material/Pagination'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useCallback, useState } from 'react'
import { useReviews } from '../../hooks/useReviews'
import type { ReviewDraft } from '../../types'
import { EmptyState, ErrorState, LoadingState } from '../common/StateViews'
import { ReviewCard } from './ReviewCard'
import { ReviewFilters } from './ReviewFilters'
import { ReviewForm } from './ReviewForm'
import { ReviewSummary } from './ReviewSummary'

interface ReviewSectionProps {
  productId: string
  productName: string
}

export function ReviewSection({ productId, productName }: ReviewSectionProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const {
    reviews,
    stats,
    page,
    totalPages,
    total,
    loading,
    error,
    sort,
    ratingFilter,
    setSort,
    setRatingFilter,
    setPage,
    createReview,
  } = useReviews(productId)

  const [formOpen, setFormOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const closeForm = useCallback(() => setFormOpen(false), [])
  const openForm = useCallback(() => setFormOpen(true), [])

  const handleSubmit = useCallback(
    async (values: Omit<ReviewDraft, 'productId'>) => {
      await createReview(values)
      setToast('Thanks! Your review has been posted.')
      closeForm()
    },
    [createReview, closeForm],
  )

  const form = <ReviewForm onSubmit={handleSubmit} onCancel={closeForm} />

  return (
    <Paper
      variant="outlined"
      id="reviews"
      sx={{ p: { xs: 2, sm: 3, md: 4 }, mt: { xs: 4, md: 6 } }}
    >
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        Customer reviews
      </Typography>

      <ReviewSummary
        stats={stats}
        activeRating={ratingFilter}
        onSelectRating={setRatingFilter}
       />

      <Divider sx={{ my: 3 }} />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2} sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: "space-between", mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Share your thoughts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {`Tell other gamers what you think of the ${productName}.`}
          </Typography>
        </Box>

        {!formOpen ? (
          <Button
            variant="contained"
            startIcon={<RateReviewOutlinedIcon />}
            onClick={openForm}
            sx={{ flexShrink: 0 }}
          >
            Write a review
          </Button>
        ) : null}
      </Stack>

      {/* Inline on desktop, full-screen dialog on mobile. */}
      {isMobile ? (
        <Dialog fullScreen open={formOpen} onClose={closeForm}>
          <DialogTitle>Write a review</DialogTitle>
          <DialogContent dividers>{form}</DialogContent>
        </Dialog>
      ) : (
        <Collapse in={formOpen} unmountOnExit>
          <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: 'action.hover' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Write a review
            </Typography>
            {form}
          </Paper>
        </Collapse>
      )}

      <Divider sx={{ my: 3 }} />

      <ReviewFilters
        sort={sort}
        ratingFilter={ratingFilter}
        total={total}
        onSortChange={setSort}
        onClearRating={() => setRatingFilter(null)}
       />

      {loading ? (
        <LoadingState label="Loading reviews…" />
      ) : error ? (
        <ErrorState message={error} />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<RateReviewOutlinedIcon sx={{ fontSize: 48 }} />}
          title={
            ratingFilter
              ? `No ${ratingFilter}-star reviews yet`
              : 'No reviews yet'
          }
          description={
            ratingFilter
              ? 'Try clearing the star filter to see all reviews.'
              : 'Be the first to review this product.'
          }
          action={
            ratingFilter ? (
              <Button onClick={() => setRatingFilter(null)}>
                Clear filter
              </Button>
            ) : !formOpen ? (
              <Button variant="contained" onClick={openForm}>
                Write a review
              </Button>
            ) : undefined
          }
         />
      ) : (
        <>
          <Box sx={{ mt: 1 }} aria-live="polite">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </Box>

          {totalPages > 1 ? (
            <Stack sx={{ alignItems: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_event, value) => setPage(value)}
                color="primary"
                siblingCount={0}
                boundaryCount={1}
               />
            </Stack>
          ) : null}
        </>
      )}

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setToast(null)}>
          {toast}
        </Alert>
      </Snackbar>
    </Paper>
  )
}
