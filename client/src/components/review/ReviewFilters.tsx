import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useId } from 'react'
import type { Rating, ReviewSort } from '../../types'

const SORT_OPTIONS: { value: ReviewSort; label: string }[] = [
  { value: 'recent', label: 'Most recent' },
  { value: 'highest', label: 'Highest rated' },
  { value: 'lowest', label: 'Lowest rated' },
]

interface ReviewFiltersProps {
  sort: ReviewSort
  ratingFilter: Rating | null
  total: number
  onSortChange: (sort: ReviewSort) => void
  onClearRating: () => void
}

export function ReviewFilters({
  sort,
  ratingFilter,
  total,
  onSortChange,
  onClearRating,
}: ReviewFiltersProps) {
  const labelId = useId()

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5} sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: "space-between" }}>
      <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary">
          {total} {total === 1 ? 'review' : 'reviews'}
        </Typography>
        {ratingFilter ? (
          <Chip
            label={`${ratingFilter} star only`}
            size="small"
            color="primary"
            variant="outlined"
            onDelete={onClearRating}
           />
        ) : null}
      </Stack>

      <FormControl size="small" sx={{ minWidth: 190 }}>
        <InputLabel id={labelId}>Sort by</InputLabel>
        <Select
          labelId={labelId}
          label="Sort by"
          value={sort}
          onChange={(event) => onSortChange(event.target.value as ReviewSort)}
        >
          {SORT_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  )
}
