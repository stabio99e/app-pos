export interface Addon {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface AddonGroup {
  title: string;
  subtitle?: string;
  addons: Addon[];
}

export interface Promo {
  code: string;
  title: string;
  description: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  minPurchase: number;
  maxDiscount?: number;
}

export type AddonType = 'grouped' | 'flat';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'Sandwich' | 'Pastry' | 'Donut' | 'Cake' | 'Bread' | 'Tart';
  categoryBadgeColor: 'peach' | 'mint' | 'amber' | 'pink' | 'blue' | 'purple';
  image: string;
  description: string;
  addonType?: AddonType;
  addonGroups?: AddonGroup[];
  availableAddons?: Addon[];
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  addons?: Addon[];
  note?: string;
}

export interface KitchenOrder {
  id: string;
  customerName: string;
  orderNumber: string;
  table: string;
  orderType: 'Dine In' | 'Take Away';
  time: string;
  status: 'On Kitchen Hand' | 'All Done' | 'To be Served';
  statusColor: 'amber' | 'mint' | 'gray' | 'blue';
  items: { name: string; qty: number; price?: number }[];
  totalItems: number;
}

export interface BillingQueueItem {
  id: string;
  customerName: string;
  orderNumber: string;
  table: string;
  dateStr: string;
  total: number;
  status: 'Active' | 'Closed';
}

export const formatRupiah = (amount: number): string => {
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
};

export const CATEGORIES = [
  { id: 'all', label: 'All Menu', count: 14 },
  { id: 'Bread', label: 'Breads', count: 4 },
  { id: 'Cake', label: 'Cakes', count: 2 },
  { id: 'Donut', label: 'Donuts', count: 2 },
  { id: 'Pastry', label: 'Pastries', count: 4 },
  { id: 'Sandwich', label: 'Sandwich', count: 2 },
] as const;

export const SAVORY_ADDON_GROUPS: AddonGroup[] = [
  {
    title: 'Extra Addons',
    subtitle: 'Pilihan ekstra sambal & isian lezat',
    addons: [
      {
        id: 's1',
        name: '+ Sambal Matah Bali',
        price: 6000,
        description: 'Sambal matah segar racikan bawang merah, cabai rawit & serai aromatik.',
      },
      {
        id: 's2',
        name: '+ Extra Smoked Beef',
        price: 14000,
        description: 'Dua lembar irisan daging sapi asap pilihan beraroma smoky lembut.',
      },
      {
        id: 's3',
        name: '+ Melted Mozzarella & Cheddar',
        price: 9000,
        description: 'Kombinasi keju mozzarella meleleh dan cheddar gurih berlimpah.',
      },
    ],
  },
  {
    title: 'Plus Addons',
    subtitle: 'Pilihan pelengkap saus & coba coba',
    addons: [
      {
        id: 's4',
        name: '+ Coba Coba Dip Sauce',
        price: 5000,
        description: 'Saus racikan coba coba lezat bertekstur creamy gurih khas house-blend.',
      },
      {
        id: 's5',
        name: '+ Truffle Mayo Dressing',
        price: 7000,
        description: 'Saus mayones creamy lembut dengan sentuhan aroma minyak truffle wangi.',
      },
      {
        id: 's6',
        name: '+ Sunny Side Up Egg',
        price: 7000,
        description: 'Telur mata sapi segar omega 3 dengan kuning telur lembut lumer.',
      },
      {
        id: 's7',
        name: '+ Garlic Herb Butter Dip',
        price: 6000,
        description: 'Saus mentega bawang putih dengan racikan rempah peterseli aromatik.',
      },
    ],
  },
];

export const SWEET_ADDON_GROUPS: AddonGroup[] = [
  {
    title: 'Extra Addons',
    subtitle: 'Pilihan ekstra krim & cokelat lumer',
    addons: [
      {
        id: 'w1',
        name: '+ Whipped Vanilla Cream',
        price: 6000,
        description: 'Krim vanila segar yang manis, lembut & mengembang sempurna.',
      },
      {
        id: 'w2',
        name: '+ Belgian Chocolate Drizzle',
        price: 7000,
        description: 'Lelehan saus cokelat hitam Belgia kualitas premium yang pekat.',
      },
      {
        id: 'w3',
        name: '+ Toasted Almond Slices',
        price: 6000,
        description: 'Taburan irisan kacang almond panggang gurih & renyah beraroma wangi.',
      },
    ],
  },
  {
    title: 'Plus Addons',
    subtitle: 'Pilihan pelengkap gelato & coba coba',
    addons: [
      {
        id: 'w4',
        name: '+ Coba Coba Sweet Glaze',
        price: 5000,
        description: 'Glaze karamel coba coba dengan aroma vanilla butter manis nikmat.',
      },
      {
        id: 'w5',
        name: '+ Vanilla Gelato Scoop',
        price: 12000,
        description: 'Satu scoop es krim gelato vanila khas Italia yang dingin & creamy.',
      },
      {
        id: 'w6',
        name: '+ Strawberry Jam Compote',
        price: 5000,
        description: 'Selai buah stroberi asli dengan bulir buah manis asam segar alami.',
      },
      {
        id: 'w7',
        name: '+ Caramel Glaze Dip',
        price: 5000,
        description: 'Saus karamel mentega manis gurih dengan sentuhan sea salt.',
      },
    ],
  },
];

// Flat (Biasa) Addon Lists for products that use simple ungrouped addons
export const FLAT_SAVORY_ADDONS: Addon[] = [
  {
    id: 'fs1',
    name: '+ Sambal Matah Bali',
    price: 6000,
    description: 'Sambal matah segar racikan bawang merah, cabai rawit & serai aromatik.',
  },
  {
    id: 'fs2',
    name: '+ Coba Coba Dip Sauce',
    price: 5000,
    description: 'Saus racikan coba coba lezat bertekstur creamy gurih khas house-blend.',
  },
  {
    id: 'fs3',
    name: '+ Salted Butter Block',
    price: 5000,
    description: 'Satu porsi mentega gurih Anchor pilihan untuk olesan roti.',
  },
  {
    id: 'fs4',
    name: '+ Extra Spicy Abon Sapi',
    price: 8000,
    description: 'Abon sapi pedas manis melimpah gurih nikmat.',
  },
];

export const FLAT_SWEET_ADDONS: Addon[] = [
  {
    id: 'fw1',
    name: '+ Coba Coba Glaze',
    price: 5000,
    description: 'Glaze racikan coba coba manis legit harum vanilla butter.',
  },
  {
    id: 'fw2',
    name: '+ Extra Cereal Crunch',
    price: 4000,
    description: 'Taburan cereal panggang renyah manis di atas sajian pastry & donat.',
  },
  {
    id: 'fw3',
    name: '+ Sweet Milk Glaze',
    price: 4000,
    description: 'Lapisan saus susu manis lumer yang lembut dan creamy.',
  },
  {
    id: 'fw4',
    name: '+ Choco Sprinkles',
    price: 3000,
    description: 'Butiran cokelat manis melimpah menambah tekstur renyah.',
  },
];

export const SWEET_ADDONS: Addon[] = [
  ...SWEET_ADDON_GROUPS[0].addons,
  ...SWEET_ADDON_GROUPS[1].addons,
];

export const SAVORY_ADDONS: Addon[] = [
  ...SAVORY_ADDON_GROUPS[0].addons,
  ...SAVORY_ADDON_GROUPS[1].addons,
];

export const PROMOS: Promo[] = [
  {
    code: 'SWEET10',
    title: 'Diskon Manis Rp 10.000',
    description: 'Potongan Rp 10.000 untuk minimal belanja Rp 40.000',
    discountType: 'fixed',
    discountValue: 10000,
    minPurchase: 40000,
  },
  {
    code: 'BAKEHOUSE20',
    title: 'Diskon Spesial 20%',
    description: 'Diskon 20% maks. potongan Rp 25.000, min. belanja Rp 60.000',
    discountType: 'percent',
    discountValue: 20,
    minPurchase: 60000,
    maxDiscount: 25000,
  },
  {
    code: 'FREESNACK',
    title: 'Potongan Snack Rp 15.000',
    description: 'Potongan Rp 15.000 untuk minimal belanja Rp 50.000',
    discountType: 'fixed',
    discountValue: 15000,
    minPurchase: 50000,
  },
  {
    code: 'PASTRYLOVER',
    title: 'Pastry Lover Rp 8.000',
    description: 'Potongan Rp 8.000 untuk minimal belanja Rp 30.000',
    discountType: 'fixed',
    discountValue: 8000,
    minPurchase: 30000,
  },
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Beef Crowich',
    price: 45000,
    category: 'Sandwich',
    categoryBadgeColor: 'peach',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    description: 'Savory layered croissant sandwich filled with sliced roast beef, mild cheddar, arugula, and signature herb mustard sauce.',
    addonType: 'grouped',
    addonGroups: SAVORY_ADDON_GROUPS,
    availableAddons: SAVORY_ADDONS,
  },
  {
    id: '2',
    name: 'Buttermelt Croissant',
    price: 32000,
    category: 'Pastry',
    categoryBadgeColor: 'mint',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    description: 'Premium butter croissant with a crispy pastry crust and soft inside will melt away on your mouth!',
    addonType: 'grouped',
    addonGroups: SWEET_ADDON_GROUPS,
    availableAddons: SWEET_ADDONS,
  },
  {
    id: '3',
    name: 'Cereal Cream Donut',
    price: 24000,
    category: 'Donut',
    categoryBadgeColor: 'amber',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    description: 'Golden ring donut filled with whipped sweet cereal cream, drizzled with vanilla glaze and toasted corn crunch.',
    addonType: 'flat',
    availableAddons: FLAT_SWEET_ADDONS,
  },
  {
    id: '4',
    name: 'Cheesy Cheesecake',
    price: 38000,
    category: 'Cake',
    categoryBadgeColor: 'pink',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
    description: 'Classic creamy Basque burnt cheesecake with a rich melted cheese interior and buttery biscuit crumble foundation.',
    addonType: 'grouped',
    addonGroups: SWEET_ADDON_GROUPS,
    availableAddons: SWEET_ADDONS,
  },
  {
    id: '5',
    name: 'Cheezy Sourdough',
    price: 42000,
    category: 'Bread',
    categoryBadgeColor: 'blue',
    image: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
    description: 'Artisanal 36-hour slow fermented sourdough bread stuffed with sharp cheddar pockets and finished with a crispy crackling crust.',
    addonType: 'grouped',
    addonGroups: SAVORY_ADDON_GROUPS,
    availableAddons: SAVORY_ADDONS,
  },
  {
    id: '6',
    name: 'Egg Tart',
    price: 22000,
    category: 'Tart',
    categoryBadgeColor: 'purple',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    description: 'Portuguese pastel de nata style custard tart featuring buttery thousand-layer puff pastry and scorched caramelized custard.',
    addonType: 'flat',
    availableAddons: FLAT_SWEET_ADDONS,
  },
  {
    id: '7',
    name: 'Grains Pan Bread',
    price: 36000,
    category: 'Bread',
    categoryBadgeColor: 'blue',
    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=600&q=80',
    description: 'Wholesome artisan sliced loaf blended with 7 ancient whole grains, toasted flax, sunflower kernels, and dark rye flakes.',
    addonType: 'flat',
    availableAddons: FLAT_SAVORY_ADDONS,
  },
  {
    id: '8',
    name: 'Spinchoco Roll',
    price: 30000,
    category: 'Pastry',
    categoryBadgeColor: 'mint',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80',
    description: 'Crisp spiral pastry horn generously injected with smooth dark Belgian chocolate ganache and dusted with powdered sugar.',
    addonType: 'flat',
    availableAddons: FLAT_SWEET_ADDONS,
  },
  {
    id: '9',
    name: 'Sliced Black Forest',
    price: 48000,
    category: 'Cake',
    categoryBadgeColor: 'pink',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    description: 'Layers of moist dark chocolate sponge soaked in wild cherry compote, enveloped in fresh chantilly cream and chocolate curls.',
    addonType: 'grouped',
    addonGroups: SWEET_ADDON_GROUPS,
    availableAddons: SWEET_ADDONS,
  },
  {
    id: '10',
    name: 'Solo Floss Bread',
    price: 26000,
    category: 'Bread',
    categoryBadgeColor: 'blue',
    image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=600&q=80',
    description: 'Fluffy Asian milk bun brushed with sweet condensed mayo cream and densely coated with savory chicken floss and nori.',
    addonType: 'flat',
    availableAddons: FLAT_SAVORY_ADDONS,
  },
  {
    id: '11',
    name: 'Zoguma Pan Bread',
    price: 35000,
    category: 'Bread',
    categoryBadgeColor: 'blue',
    image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=600&q=80',
    description: 'Korean specialty chewy loaf filled with sweet roasted yam puree and mild cream cheese swirl.',
    addonType: 'flat',
    availableAddons: FLAT_SWEET_ADDONS,
  },
  {
    id: '12',
    name: 'Almond Croissant',
    price: 38000,
    category: 'Pastry',
    categoryBadgeColor: 'mint',
    image: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?auto=format&fit=crop&w=600&q=80',
    description: 'Twice-baked butter croissant soaked in vanilla syrup, stuffed with rich almond frangipane and covered with toasted sliced almonds.',
    addonType: 'grouped',
    addonGroups: SWEET_ADDON_GROUPS,
    availableAddons: SWEET_ADDONS,
  },
  {
    id: '13',
    name: 'Eclair Au Chocolat',
    price: 28000,
    category: 'Pastry',
    categoryBadgeColor: 'mint',
    image: 'https://images.unsplash.com/photo-1558326567-98ae2405596b?auto=format&fit=crop&w=600&q=80',
    description: 'Crisp Parisian choux pastry filled with luscious vanilla bean diplomat cream and coated in dark chocolate ganache.',
    addonType: 'flat',
    availableAddons: FLAT_SWEET_ADDONS,
  },
  {
    id: '14',
    name: 'Classic Butter Toast',
    price: 25000,
    category: 'Bread',
    categoryBadgeColor: 'blue',
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
    description: 'Thick-sliced Japanese shokupan toasted golden brown with rich salted New Zealand butter and aromatic wildflower honey.',
    addonType: 'grouped',
    addonGroups: SAVORY_ADDON_GROUPS,
    availableAddons: SAVORY_ADDONS,
  },
];

// Empty by default for live simulation!
export const INITIAL_CART_ITEMS: CartItem[] = [];

export const INITIAL_KITCHEN_ORDERS: KitchenOrder[] = [
  {
    id: 'k1',
    customerName: 'Mike',
    orderNumber: '#004',
    table: 'Table 04',
    orderType: 'Dine In',
    time: '10:00 AM',
    status: 'On Kitchen Hand',
    statusColor: 'amber',
    items: [
      { name: 'Beef Crowich', qty: 1, price: 45000 },
      { name: 'Grains Pan Bread', qty: 1, price: 30000 },
      { name: 'Cheezy Sourdough', qty: 1, price: 35000 },
      { name: 'Sliced Black Forest', qty: 1, price: 40000 },
    ],
    totalItems: 4,
  },
  {
    id: 'k2',
    customerName: 'Billie',
    orderNumber: '#003',
    table: 'Table 03',
    orderType: 'Take Away',
    time: '08:45 AM',
    status: 'All Done',
    statusColor: 'mint',
    items: [
      { name: 'Beef Crowich', qty: 1, price: 45000 },
      { name: 'Cereal Cream Donut', qty: 1, price: 22000 },
      { name: 'Cheezy Sourdough', qty: 1, price: 35000 },
      { name: 'Egg Tart', qty: 3, price: 18000 },
    ],
    totalItems: 6,
  },
  {
    id: 'k3',
    customerName: 'Richard',
    orderNumber: '#002',
    table: 'Table 02',
    orderType: 'Dine In',
    time: '08:15 AM',
    status: 'To be Served',
    statusColor: 'blue',
    items: [
      { name: 'Beef Crowich', qty: 1, price: 45000 },
      { name: 'Cereal Cream Donut', qty: 1, price: 22000 },
      { name: 'Cheezy Sourdough', qty: 1, price: 35000 },
      { name: 'Spinchoco Roll', qty: 3, price: 30000 },
    ],
    totalItems: 6,
  },
  {
    id: 'k4',
    customerName: 'Sharon',
    orderNumber: '#001',
    table: 'Table 01',
    orderType: 'Dine In',
    time: '10:15 AM',
    status: 'On Kitchen Hand',
    statusColor: 'amber',
    items: [
      { name: 'Beef Crowich', qty: 1, price: 45000 },
      { name: 'Cereal Cream Donut', qty: 1, price: 22000 },
      { name: 'Cheezy Sourdough', qty: 1, price: 35000 },
      { name: 'Buttermelt Croissant', qty: 3, price: 25000 },
    ],
    totalItems: 6,
  },
];

export const INITIAL_BILLING_QUEUE: BillingQueueItem[] = [
  {
    id: 'b1',
    customerName: 'Francois',
    orderNumber: '#006',
    table: 'Table 06',
    dateStr: 'Wed, 29 May 2024 • 09:15 AM',
    total: 165000,
    status: 'Active',
  },
  {
    id: 'b2',
    customerName: 'Elouise',
    orderNumber: '#005',
    table: 'Table 05',
    dateStr: 'Wed, 29 May 2024 • 09:00 AM',
    total: 182000,
    status: 'Closed',
  },
  {
    id: 'b3',
    customerName: 'Mike',
    orderNumber: '#004',
    table: 'Table 04',
    dateStr: 'Wed, 29 May 2024 • 08:15 AM',
    total: 195000,
    status: 'Active',
  },
  {
    id: 'b4',
    customerName: 'Billie',
    orderNumber: '#003',
    table: 'Table 03',
    dateStr: 'Wed, 29 May 2024 • 07:45 AM',
    total: 245000,
    status: 'Active',
  },
];

export const ALL_TABLES = [
  { label: 'Table 01', value: 'Table 01' },
  { label: 'Table 02', value: 'Table 02' },
  { label: 'Table 03', value: 'Table 03' },
  { label: 'Table 04', value: 'Table 04' },
  { label: 'Table 05', value: 'Table 05' },
  { label: 'Table 06', value: 'Table 06' },
  { label: 'Table 07', value: 'Table 07' },
  { label: 'Table 08', value: 'Table 08' },
];

export const ORDER_TYPES = [
  { label: 'Dine In', value: 'Dine In' },
  { label: 'Take Away', value: 'Take Away' },
  { label: 'Delivery', value: 'Delivery' },
];

export const PAYMENT_METHODS = [
  { label: 'QRIS', value: 'QRIS' },
  { label: 'Cash (Tunai)', value: 'Cash' },
  { label: 'Debit BCA / Mandiri', value: 'Debit Card' },
  { label: 'Credit Card', value: 'Credit Card' },
];
