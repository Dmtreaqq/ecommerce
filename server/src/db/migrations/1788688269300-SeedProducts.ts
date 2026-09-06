import { MigrationInterface, QueryRunner } from 'typeorm';

type SeedProduct = {
  name: string;
  brand: string;
  category: string;
  priceCents: number;
  originalPriceCents: number | null;
  image: string;
  description: string;
  features: string[];
  stock: number;
  ratingAverage: number;
};

const PRODUCTS: SeedProduct[] = [
  {
    name: 'Nexus Station XXX',
    brand: 'Nexus',
    category: 'Consoles',
    priceCents: 49999,
    originalPriceCents: 54999,
    image: '/images/products/console.svg',
    description:
      'The flagship Nexus console with a custom 8-core CPU and ray-traced 4K output at 120fps. Ships with a 1TB NVMe drive and the redesigned haptic controller.',
    features: [
      'Custom 8-core Zen APU, 16GB GDDR6',
      '4K @ 120fps with hardware ray tracing',
      '1TB NVMe SSD, expandable',
      'Backwards compatible with the full Nexus library',
    ],
    stock: 12,
    ratingAverage: 0
  },
  {
    name: 'Nexus Station X Slim',
    brand: 'Nexus',
    category: 'Consoles',
    priceCents: 39999,
    originalPriceCents: null,
    image: '/images/products/console.svg',
    description:
      'A 30% smaller Nexus Station X with the same silicon in a fully digital, disc-free chassis. Runs quieter and draws less power.',
    features: [
      'Same GPU performance in a 30% smaller shell',
      'All-digital, no disc drive',
      '512GB NVMe SSD',
      'Whisper-quiet vapour chamber cooling',
    ],
    stock: 27,
    ratingAverage: 0
  },
  {
    name: 'Pulse Elite Wireless Controller',
    brand: 'Pulse',
    category: 'Peripherals',
    priceCents: 7999,
    originalPriceCents: 9999,
    image: '/images/products/controller.svg',
    description:
      'Hall-effect thumbsticks that never drift, four remappable back paddles, and 40 hours of battery on a single charge.',
    features: [
      'Drift-free Hall-effect sticks',
      '4 remappable back paddles',
      '40-hour battery, USB-C fast charge',
      '1000Hz polling over 2.4GHz dongle',
    ],
    stock: 64,
    ratingAverage: 0,
  },
  {
    name: 'Aurora 7 Gaming Headset',
    brand: 'Aurora',
    category: 'Peripherals',
    priceCents: 14999,
    originalPriceCents: null,
    image: '/images/products/headset.svg',
    description:
      '50mm planar drivers with spatial audio and a broadcast-grade detachable boom mic. Memory-foam earcups rated for all-day sessions.',
    features: [
      '50mm planar magnetic drivers',
      'Spatial audio with head tracking',
      'Detachable cardioid boom mic',
      'Lossless 2.4GHz + Bluetooth multipoint',
    ],
    stock: 41,
    ratingAverage: 0,
  },
  {
    name: 'Volt TKL Mechanical Keyboard',
    brand: 'Volt',
    category: 'Peripherals',
    priceCents: 12999,
    originalPriceCents: 15999,
    image: '/images/products/keyboard.svg',
    description:
      'A hot-swappable tenkeyless board with magnetic analogue switches, 8000Hz polling, and per-key RGB under doubleshot PBT caps.',
    features: [
      'Magnetic analogue switches, adjustable actuation',
      'Hot-swappable, 8000Hz polling',
      'Doubleshot PBT keycaps',
      'Gasket-mounted aluminium chassis',
    ],
    stock: 33,
    ratingAverage: 0
  },
  {
    name: 'Volt Glide Pro Wireless Mouse',
    brand: 'Volt',
    category: 'Peripherals',
    priceCents: 8999,
    originalPriceCents: null,
    image: '/images/products/mouse.svg',
    description:
      'A 49-gram symmetrical shape with a 32K DPI optical sensor and PTFE feet. Built for competitive FPS with zero smoothing.',
    features: [
      '49g ultralight chassis',
      '32,000 DPI optical sensor',
      '8000Hz wireless polling',
      '90-hour battery life',
    ],
    stock: 58,
    ratingAverage: 0
  },
  {
    name: 'Titan RTX 5080 Graphics Card',
    brand: 'Titan',
    category: 'PC Hardware',
    priceCents: 109900,
    originalPriceCents: null,
    image: '/images/products/gpu.svg',
    description:
      '16GB GDDR7 with a triple-fan vapour chamber cooler. Handles 4K ultra with ray tracing and frame generation enabled.',
    features: [
      '16GB GDDR7, 256-bit bus',
      'Triple-fan vapour chamber cooling',
      'DLSS 4 frame generation',
      'Dual 8-pin, 320W TDP',
    ],
    stock: 7,
    ratingAverage: 0
  },
  {
    name: 'Titan Forge 32GB DDR5-6400 Kit',
    brand: 'Titan',
    category: 'PC Hardware',
    priceCents: 14999,
    originalPriceCents: 18999,
    image: '/images/products/gpu.svg',
    description:
      'A 2x16GB DDR5 kit binned for 6400 MT/s at CL32, with a low-profile heatspreader that clears large air coolers.',
    features: [
      '2x16GB DDR5-6400 CL32',
      'One-click XMP 3.0 / EXPO profiles',
      'Low-profile aluminium heatspreader',
      'Lifetime warranty',
    ],
    stock: 88,
    ratingAverage: 0
  },
  {
    name: 'Starfall Odyssey',
    brand: 'Meridian Studios',
    category: 'Games',
    priceCents: 6999,
    originalPriceCents: null,
    image: '/images/products/game.svg',
    description:
      'An open-world space RPG spanning forty hand-built systems, with a branching campaign that remembers every choice you make.',
    features: [
      '80+ hour branching campaign',
      'Full co-op for up to 4 players',
      'Ship building and crew management',
      'Free post-launch expansions',
    ],
    stock: 120,
    ratingAverage: 0
  },
  {
    name: 'Shadow Protocol II',
    brand: 'Ironline Games',
    category: 'Games',
    priceCents: 5999,
    originalPriceCents: 6999,
    image: '/images/products/game.svg',
    description:
      'A tactical stealth shooter with fully destructible cover and an AI director that adapts to how you play.',
    features: [
      'Adaptive AI director',
      'Fully destructible environments',
      '20-mission campaign plus raids',
      'Cross-platform multiplayer',
    ],
    stock: 95,
    ratingAverage: 0
  },
  {
    name: 'Apex Throne Gaming Chair',
    brand: 'Apex',
    category: 'Accessories',
    priceCents: 34999,
    originalPriceCents: null,
    image: '/images/products/chair.svg',
    description:
      'A cold-cure foam chair with 4D armrests, adjustable lumbar support, and a breathable hybrid-weave cover rated to 150kg.',
    features: [
      'Cold-cure moulded foam',
      '4D armrests, 165° recline',
      'Adjustable lumbar and neck support',
      'Class-4 gas lift, 150kg rating',
    ],
    stock: 19,
    ratingAverage: 0
  },
  {
    name: 'Aurora Stream Pad Mini',
    brand: 'Aurora',
    category: 'Accessories',
    priceCents: 9999,
    originalPriceCents: null,
    image: '/images/products/keyboard.svg',
    description:
      'Fifteen LCD macro keys for scene switching, clip capture, and audio mixing, with profiles that follow the app in focus.',
    features: [
      '15 customisable LCD keys',
      'Auto-switching per-app profiles',
      'Built-in audio mixer controls',
      'Plugin support for major streaming apps',
    ],
    stock: 46,
    ratingAverage: 0
  },
];

/** 1-based position of "features" among the bound parameters of each row. */
const FEATURES_PARAM_OFFSET = 8;
const PARAMS_PER_ROW = 11;

export class SeedProducts1788688269300 implements MigrationInterface {
  name = 'SeedProducts1788688269300';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const rows = PRODUCTS.map((_, rowIndex) => {
      const base = rowIndex * PARAMS_PER_ROW;
      const placeholders = Array.from(
        { length: PARAMS_PER_ROW },
        (_unused, i) =>
          i + 1 === FEATURES_PARAM_OFFSET
            ? `$${base + i + 1}::jsonb`
            : `$${base + i + 1}`,
      );

      return `(gen_random_uuid(), ${placeholders.join(', ')}, now(), now(), 1)`;
    });

    const parameters = PRODUCTS.flatMap((product) => [
      product.name,
      product.brand,
      product.category,
      product.priceCents,
      product.originalPriceCents,
      product.image,
      product.description,
      JSON.stringify(product.features),
      product.stock,
      product.ratingAverage,
      0,
    ]);

    await queryRunner.query(
      `INSERT INTO "products" (
        "id", "name", "brand", "category", "priceCents", "originalPriceCents",
        "image", "description", "features", "stock", "ratingAverage",
        "ratingCount", "createdAt", "updatedAt", "version"
      ) VALUES
      ${rows.join(',\n      ')}`,
      parameters,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "products" WHERE "name" = ANY($1)`, [
      PRODUCTS.map((product) => product.name),
    ]);
  }
}
