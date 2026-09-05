import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'

/**
 * The cart marker shown next to a reviewer's name when they actually bought
 * the product. Only ever rendered for signed-in authors whose purchase history
 * includes this product — guests never qualify.
 */
export function VerifiedPurchaseBadge() {
  return (
    <Tooltip title="Verified Purchase — this reviewer bought this product">
      <Chip
        icon={<ShoppingCartIcon sx={{ fontSize: 15 }} />}
        label="Verified Purchase"
        size="small"
        color="success"
        variant="outlined"
        sx={{
          height: 22,
          fontSize: 11,
          '& .MuiChip-icon': { ml: 0.75, mr: -0.25 },
        }}
      />
    </Tooltip>
  )
}
