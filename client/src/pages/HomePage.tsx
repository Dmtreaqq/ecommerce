import SearchIcon from '@mui/icons-material/Search'
import SearchOffIcon from '@mui/icons-material/SearchOff'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState } from '../components/common/StateViews'
import { ProductCard } from '../components/product/ProductCard'
import { useProducts } from '../hooks/useProducts'
import { CATEGORIES, type Category, type ProductSort } from '../types'

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
]

const isCategory = (value: string | null): value is Category =>
  value !== null && (CATEGORIES as readonly string[]).includes(value)

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const sortLabelId = useId()

  // The category lives in the URL so a filtered view is shareable.
  const categoryParam = searchParams.get('category')
  const category = isCategory(categoryParam) ? categoryParam : null

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<ProductSort>('featured')

  // Debounce so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const { products, loading, error } = useProducts(category, search, sort)

  const selectCategory = useCallback(
    (next: Category | null) => {
      setSearchParams(next ? { category: next } : {}, { replace: true })
    },
    [setSearchParams],
  )

  const heading = useMemo(
    () => (category ? category : 'All products'),
    [category],
  )

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Box
        sx={{
          textAlign: 'center',
          py: { xs: 4, md: 7 },
          px: 2,
          mb: { xs: 3, md: 5 },
          borderRadius: 4,
          border: 1,
          borderColor: 'divider',
          background:
            'linear-gradient(140deg, rgba(34,211,238,0.10), rgba(168,85,247,0.10))',
        }}
      >
        <Typography variant="h3" component="h1" sx={{ mb: 1.5 }}>
          Gear up at{' '}
          <Box component="span" sx={{ color: 'primary.main' }}>
            GameVault
          </Box>
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ maxWidth: 620, mx: 'auto' }}
        >
          Consoles, rigs and peripherals — reviewed by the people who actually
          play on them.
        </Typography>
      </Box>

      <Stack spacing={2} sx={{ mb: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
          <TextField
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search products…"
            size="small"
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
              htmlInput: { 'aria-label': 'Search products' },
            }}
           />

          <FormControl size="small" sx={{ minWidth: { sm: 210 } }}>
            <InputLabel id={sortLabelId}>Sort by</InputLabel>
            <Select
              labelId={sortLabelId}
              label="Sort by"
              value={sort}
              onChange={(event) => setSort(event.target.value as ProductSort)}
            >
              {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          useFlexGap sx={{ flexWrap: 'wrap', overflowX: 'auto', pb: 0.5 }}>
          <Chip
            label="All"
            color={category === null ? 'primary' : 'default'}
            variant={category === null ? 'filled' : 'outlined'}
            onClick={() => selectCategory(null)}
           />
          {CATEGORIES.map((item) => (
            <Chip
              key={item}
              label={item}
              color={category === item ? 'primary' : 'default'}
              variant={category === item ? 'filled' : 'outlined'}
              onClick={() => selectCategory(item)}
             />
          ))}
        </Stack>
      </Stack>

      <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
        {heading}
        {!loading ? (
          <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
            ({products.length})
          </Typography>
        ) : null}
      </Typography>

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Skeleton
                variant="rounded"
                height={340}
                sx={{ borderRadius: 3 }}
               />
            </Grid>
          ))}
        </Grid>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<SearchOffIcon sx={{ fontSize: 48 }} />}
          title="No products found"
          description="Try a different search term or category."
         />
      ) : (
        <Grid container spacing={{ xs: 2, md: 3 }}>
          {products.map((product) => (
            <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  )
}
