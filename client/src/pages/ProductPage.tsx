import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import Paper from '@mui/material/Paper'
import Rating from '@mui/material/Rating'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { EmptyState, ErrorState } from '../components/common/StateViews'
import { ReviewSection } from '../components/review/ReviewSection'
import { useProduct } from '../hooks/useProducts'
import { formatPrice } from '../utils/format'

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const { product, loading, error } = useProduct(id)

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Grid container spacing={{ xs: 3, md: 5 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton variant="rounded" height={360} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Skeleton height={40} />
            <Skeleton height={28} width="60%" />
            <Skeleton height={90} sx={{ mt: 2 }} />
            <Skeleton height={48} width={200} sx={{ mt: 2 }} />
          </Grid>
        </Grid>
      </Container>
    )
  }

  if (error || !product) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <ErrorState message={error ?? 'Product not found.'} />
        <EmptyState
          title="We couldn't find that product"
          description="It may have been removed, or the link may be incorrect."
          action={
            <Button component={RouterLink} to="/" variant="contained">
              Back to all products
            </Button>
          }
         />
      </Container>
    )
  }

  const inStock = product.stock > 0

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Breadcrumbs
        separator={<ChevronRightIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link component={RouterLink} to="/" color="inherit" underline="hover">
          Home
        </Link>
        <Link
          component={RouterLink}
          to={`/?category=${encodeURIComponent(product.category)}`}
          color="inherit"
          underline="hover"
        >
          {product.category}
        </Link>
        <Typography color="text.primary" noWrap sx={{ maxWidth: 220 }}>
          {product.name}
        </Typography>
      </Breadcrumbs>

      <Grid container spacing={{ xs: 3, md: 5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            variant="outlined"
            sx={{ overflow: 'hidden', bgcolor: '#0d1220' }}
          >
            <Box
              component="img"
              src={product.image}
              alt={product.name}
              width={400}
              height={300}
              sx={{ width: '100%', height: 'auto', display: 'block' }}
             />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={1.5}>
            <Typography variant="overline" color="text.secondary">
              {product.brand} · {product.category}
            </Typography>

            <Typography variant="h4" component="h1">
              {product.name}
            </Typography>

            <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Rating
                value={product.ratingAverage}
                precision={0.1}
                readOnly
                size="small"
               />
              <Typography variant="body2" color="text.secondary">
                {product.ratingCount > 0
                  ? `${product.ratingAverage.toFixed(1)} out of 5`
                  : 'No reviews yet'}
              </Typography>
              {product.ratingCount > 0 ? (
                <Link
                  href="#reviews"
                  underline="hover"
                  variant="body2"
                  color="primary"
                >
                  {product.ratingCount} reviews
                </Link>
              ) : null}
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Stack direction="row" spacing={1.5} useFlexGap sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {formatPrice(product.price)}
              </Typography>
              {product.originalPrice ? (
                <>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ textDecoration: 'line-through' }}
                  >
                    {formatPrice(product.originalPrice)}
                  </Typography>
                  <Chip
                    label={`Save ${formatPrice(product.originalPrice - product.price)}`}
                    color="secondary"
                    size="small"
                   />
                </>
              ) : null}
            </Stack>

            <Typography
              variant="body2"
              color={inStock ? 'success.main' : 'error.main'}
              sx={{ fontWeight: 600 }}
            >
              {inStock ? `In stock — ${product.stock} available` : 'Out of stock'}
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              {product.description}
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCartIcon />}
              disabled={!inStock}
              sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, mt: 1, px: 4 }}
            >
              Add to cart
            </Button>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Key features
              </Typography>
              <Stack spacing={0.75}>
                {product.features.map((feature) => (
                  <Stack
                    key={feature}
                    direction="row"
                    spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <CheckCircleOutlineIcon
                      fontSize="small"
                      color="primary"
                      sx={{ mt: '2px', flexShrink: 0 }}
                     />
                    <Typography variant="body2" color="text.secondary">
                      {feature}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Grid>
      </Grid>

      <ReviewSection productId={product.id} productName={product.name} />
    </Container>
  )
}
