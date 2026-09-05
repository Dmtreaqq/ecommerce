import chair from '../assets/products/chair.svg'
import console3d from '../assets/products/console.svg'
import controller from '../assets/products/controller.svg'
import game from '../assets/products/game.svg'
import gpu from '../assets/products/gpu.svg'
import headset from '../assets/products/headset.svg'
import keyboard from '../assets/products/keyboard.svg'
import mouse from '../assets/products/mouse.svg'
import type { Product } from '../types'

/**
 * Seed catalogue. `ratingAverage` / `ratingCount` are recomputed from the review
 * store on load, so the values here are only a starting point.
 */
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    slug: 'nexus-station-x',
    name: 'Nexus Station X',
    brand: 'Nexus',
    category: 'Consoles',
    price: 499.99,
    originalPrice: 549.99,
    image: console3d,
    description:
      'The flagship Nexus console with a custom 8-core CPU and ray-traced 4K output at 120fps. Ships with a 1TB NVMe drive and the redesigned haptic controller.',
    features: [
      'Custom 8-core Zen APU, 16GB GDDR6',
      '4K @ 120fps with hardware ray tracing',
      '1TB NVMe SSD, expandable',
      'Backwards compatible with the full Nexus library',
    ],
    stock: 12,
    ratingAverage: 4.6,
    ratingCount: 0,
  },
  {
    id: 'p2',
    slug: 'nexus-station-x-slim',
    name: 'Nexus Station X Slim',
    brand: 'Nexus',
    category: 'Consoles',
    price: 399.99,
    image: console3d,
    description:
      'A 30% smaller Nexus Station X with the same silicon in a fully digital, disc-free chassis. Runs quieter and draws less power.',
    features: [
      'Same GPU performance in a 30% smaller shell',
      'All-digital, no disc drive',
      '512GB NVMe SSD',
      'Whisper-quiet vapour chamber cooling',
    ],
    stock: 27,
    ratingAverage: 4.3,
    ratingCount: 0,
  },
  {
    id: 'p3',
    slug: 'pulse-elite-wireless-controller',
    name: 'Pulse Elite Wireless Controller',
    brand: 'Pulse',
    category: 'Peripherals',
    price: 79.99,
    originalPrice: 99.99,
    image: controller,
    description:
      'Hall-effect thumbsticks that never drift, four remappable back paddles, and 40 hours of battery on a single charge.',
    features: [
      'Drift-free Hall-effect sticks',
      '4 remappable back paddles',
      '40-hour battery, USB-C fast charge',
      '1000Hz polling over 2.4GHz dongle',
    ],
    stock: 64,
    ratingAverage: 4.7,
    ratingCount: 0,
  },
  {
    id: 'p4',
    slug: 'aurora-7-gaming-headset',
    name: 'Aurora 7 Gaming Headset',
    brand: 'Aurora',
    category: 'Peripherals',
    price: 149.99,
    image: headset,
    description:
      '50mm planar drivers with spatial audio and a broadcast-grade detachable boom mic. Memory-foam earcups rated for all-day sessions.',
    features: [
      '50mm planar magnetic drivers',
      'Spatial audio with head tracking',
      'Detachable cardioid boom mic',
      'Lossless 2.4GHz + Bluetooth multipoint',
    ],
    stock: 41,
    ratingAverage: 4.4,
    ratingCount: 0,
  },
  {
    id: 'p5',
    slug: 'volt-tkl-mechanical-keyboard',
    name: 'Volt TKL Mechanical Keyboard',
    brand: 'Volt',
    category: 'Peripherals',
    price: 129.99,
    originalPrice: 159.99,
    image: keyboard,
    description:
      'A hot-swappable tenkeyless board with magnetic analogue switches, 8000Hz polling, and per-key RGB under doubleshot PBT caps.',
    features: [
      'Magnetic analogue switches, adjustable actuation',
      'Hot-swappable, 8000Hz polling',
      'Doubleshot PBT keycaps',
      'Gasket-mounted aluminium chassis',
    ],
    stock: 33,
    ratingAverage: 4.8,
    ratingCount: 0,
  },
  {
    id: 'p6',
    slug: 'volt-glide-pro-mouse',
    name: 'Volt Glide Pro Wireless Mouse',
    brand: 'Volt',
    category: 'Peripherals',
    price: 89.99,
    image: mouse,
    description:
      'A 49-gram symmetrical shape with a 32K DPI optical sensor and PTFE feet. Built for competitive FPS with zero smoothing.',
    features: [
      '49g ultralight chassis',
      '32,000 DPI optical sensor',
      '8000Hz wireless polling',
      '90-hour battery life',
    ],
    stock: 58,
    ratingAverage: 4.5,
    ratingCount: 0,
  },
  {
    id: 'p7',
    slug: 'titan-rtx-5080-graphics-card',
    name: 'Titan RTX 5080 Graphics Card',
    brand: 'Titan',
    category: 'PC Hardware',
    price: 1099.0,
    image: gpu,
    description:
      '16GB GDDR7 with a triple-fan vapour chamber cooler. Handles 4K ultra with ray tracing and frame generation enabled.',
    features: [
      '16GB GDDR7, 256-bit bus',
      'Triple-fan vapour chamber cooling',
      'DLSS 4 frame generation',
      'Dual 8-pin, 320W TDP',
    ],
    stock: 7,
    ratingAverage: 4.6,
    ratingCount: 0,
  },
  {
    id: 'p8',
    slug: 'titan-forge-32gb-ddr5',
    name: 'Titan Forge 32GB DDR5-6400 Kit',
    brand: 'Titan',
    category: 'PC Hardware',
    price: 149.99,
    originalPrice: 189.99,
    image: gpu,
    description:
      'A 2x16GB DDR5 kit binned for 6400 MT/s at CL32, with a low-profile heatspreader that clears large air coolers.',
    features: [
      '2x16GB DDR5-6400 CL32',
      'One-click XMP 3.0 / EXPO profiles',
      'Low-profile aluminium heatspreader',
      'Lifetime warranty',
    ],
    stock: 88,
    ratingAverage: 4.5,
    ratingCount: 0,
  },
  {
    id: 'p9',
    slug: 'starfall-odyssey',
    name: 'Starfall Odyssey',
    brand: 'Meridian Studios',
    category: 'Games',
    price: 69.99,
    image: game,
    description:
      'An open-world space RPG spanning forty hand-built systems, with a branching campaign that remembers every choice you make.',
    features: [
      '80+ hour branching campaign',
      'Full co-op for up to 4 players',
      'Ship building and crew management',
      'Free post-launch expansions',
    ],
    stock: 120,
    ratingAverage: 4.2,
    ratingCount: 0,
  },
  {
    id: 'p10',
    slug: 'shadow-protocol-2',
    name: 'Shadow Protocol II',
    brand: 'Ironline Games',
    category: 'Games',
    price: 59.99,
    originalPrice: 69.99,
    image: game,
    description:
      'A tactical stealth shooter with fully destructible cover and an AI director that adapts to how you play.',
    features: [
      'Adaptive AI director',
      'Fully destructible environments',
      '20-mission campaign plus raids',
      'Cross-platform multiplayer',
    ],
    stock: 95,
    ratingAverage: 3.9,
    ratingCount: 0,
  },
  {
    id: 'p11',
    slug: 'apex-throne-gaming-chair',
    name: 'Apex Throne Gaming Chair',
    brand: 'Apex',
    category: 'Accessories',
    price: 349.99,
    image: chair,
    description:
      'A cold-cure foam chair with 4D armrests, adjustable lumbar support, and a breathable hybrid-weave cover rated to 150kg.',
    features: [
      'Cold-cure moulded foam',
      '4D armrests, 165° recline',
      'Adjustable lumbar and neck support',
      'Class-4 gas lift, 150kg rating',
    ],
    stock: 19,
    ratingAverage: 4.1,
    ratingCount: 0,
  },
  {
    id: 'p12',
    slug: 'aurora-stream-deck-mini',
    name: 'Aurora Stream Pad Mini',
    brand: 'Aurora',
    category: 'Accessories',
    price: 99.99,
    image: keyboard,
    description:
      'Fifteen LCD macro keys for scene switching, clip capture, and audio mixing, with profiles that follow the app in focus.',
    features: [
      '15 customisable LCD keys',
      'Auto-switching per-app profiles',
      'Built-in audio mixer controls',
      'Plugin support for major streaming apps',
    ],
    stock: 46,
    ratingAverage: 4.4,
    ratingCount: 0,
  },
]
