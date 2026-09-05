import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormHelperText from '@mui/material/FormHelperText'
import Rating from '@mui/material/Rating'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useCallback, useId, useState, type FormEvent } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { toErrorMessage } from '../../api/client'
import type { Rating as StarRating, Review, ReviewDraft } from '../../types'

const RATING_LABELS: Record<number, string> = {
  1: 'Hated it',
  2: 'Disliked it',
  3: 'It was OK',
  4: 'Liked it',
  5: 'Loved it',
}

const TITLE_MAX = 100
const BODY_MAX = 2000

interface FieldErrors {
  rating?: string
  title?: string
  body?: string
  guestName?: string
}

export interface ReviewFormValues {
  rating: StarRating
  title: string
  body: string
  guestName?: string
}

interface ReviewFormProps {
  /** Present when editing an existing review rather than writing a new one. */
  initialReview?: Review | null
  isSignedIn: boolean
  onSubmit: (values: Omit<ReviewDraft, 'productId'>) => Promise<void>
  onCancel: () => void
}

export function ReviewForm({
  initialReview,
  isSignedIn,
  onSubmit,
  onCancel,
}: ReviewFormProps) {
  const location = useLocation()
  const fieldId = useId()

  const [rating, setRating] = useState<number | null>(
    initialReview?.rating ?? null,
  )
  const [hoverRating, setHoverRating] = useState(-1)
  const [title, setTitle] = useState(initialReview?.title ?? '')
  const [body, setBody] = useState(initialReview?.body ?? '')
  const [guestName, setGuestName] = useState('')

  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isEditing = Boolean(initialReview)

  const validate = useCallback((): FieldErrors => {
    const next: FieldErrors = {}
    const trimmedTitle = title.trim()
    const trimmedBody = body.trim()

    if (!rating) {
      next.rating = 'Please choose a star rating.'
    }
    if (trimmedTitle.length < 3) {
      next.title = 'Title must be at least 3 characters.'
    } else if (trimmedTitle.length > TITLE_MAX) {
      next.title = `Title must be ${TITLE_MAX} characters or fewer.`
    }
    if (trimmedBody.length < 10) {
      next.body = 'Review must be at least 10 characters.'
    } else if (trimmedBody.length > BODY_MAX) {
      next.body = `Review must be ${BODY_MAX} characters or fewer.`
    }
    if (!isSignedIn && !isEditing && !guestName.trim()) {
      next.guestName = 'Please enter your name.'
    }

    return next
  }, [rating, title, body, guestName, isSignedIn, isEditing])

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setSubmitError(null)

      const validationErrors = validate()
      setErrors(validationErrors)
      if (Object.keys(validationErrors).length > 0) return

      setSubmitting(true)
      try {
        await onSubmit({
          rating: rating as StarRating,
          title: title.trim(),
          body: body.trim(),
          ...(isSignedIn ? {} : { guestName: guestName.trim() }),
        })
      } catch (error: unknown) {
        setSubmitError(toErrorMessage(error))
      } finally {
        setSubmitting(false)
      }
    },
    [validate, onSubmit, rating, title, body, guestName, isSignedIn],
  )

  const displayRating = hoverRating !== -1 ? hoverRating : (rating ?? 0)

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={2.5}>
        {!isSignedIn && !isEditing ? (
          <Alert severity="info" variant="outlined">
            You can review as a guest.{' '}
            <Box
              component={RouterLink}
              to="/signin"
              state={{ from: location.pathname + location.search }}
              sx={{ color: 'primary.main', fontWeight: 600 }}
            >
              Sign in
            </Box>{' '}
            to get the Verified Purchase badge on products you have bought.
          </Alert>
        ) : null}

        {submitError ? (
          <Alert severity="error" onClose={() => setSubmitError(null)}>
            {submitError}
          </Alert>
        ) : null}

        <Box>
          <Typography
            component="legend"
            variant="subtitle2"
            id={`${fieldId}-rating-label`}
            sx={{ mb: 0.5 }}
          >
            Overall rating
          </Typography>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Rating
              name="rating"
              value={rating}
              size="large"
              aria-labelledby={`${fieldId}-rating-label`}
              onChange={(_event, value) => {
                setRating(value)
                setErrors((prev) => ({ ...prev, rating: undefined }))
              }}
              onChangeActive={(_event, value) => setHoverRating(value)}
             />
            {displayRating > 0 ? (
              <Typography variant="body2" color="text.secondary">
                {RATING_LABELS[displayRating]}
              </Typography>
            ) : null}
          </Stack>
          {errors.rating ? (
            <FormHelperText error>{errors.rating}</FormHelperText>
          ) : null}
        </Box>

        {!isSignedIn && !isEditing ? (
          <TextField
            label="Your name"
            value={guestName}
            onChange={(event) => setGuestName(event.target.value)}
            error={Boolean(errors.guestName)}
            helperText={errors.guestName}
            required
            fullWidth
            slotProps={{ htmlInput: { maxLength: 60 } }}
           />
        ) : null}

        <TextField
          label="Add a headline"
          placeholder="What's most important to know?"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          error={Boolean(errors.title)}
          helperText={errors.title ?? `${title.length}/${TITLE_MAX}`}
          required
          fullWidth
          slotProps={{ htmlInput: { maxLength: TITLE_MAX } }}
         />

        <TextField
          label="Write your review"
          placeholder="What did you like or dislike? How did it perform?"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          error={Boolean(errors.body)}
          helperText={errors.body ?? `${body.length}/${BODY_MAX}`}
          required
          fullWidth
          multiline
          minRows={4}
          slotProps={{ htmlInput: { maxLength: BODY_MAX } }}
         />

        <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1.5}>
          <Button onClick={onCancel} color="inherit" disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            loading={submitting}
            sx={{ minWidth: 160 }}
          >
            {isEditing ? 'Save changes' : 'Submit review'}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
