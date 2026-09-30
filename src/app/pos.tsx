import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  useWindowDimensions,
  Platform,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Intent UI Design System Components
import {
  Button,
  Badge,
  TextField,
  SearchField,
  Stepper,
  Select,
  Dialog,
  Drawer,
  Tabs,
} from '@/components/ui';

// POS Data & Types
import {
  Product,
  CartItem,
  Addon,
  AddonGroup,
  Promo,
  KitchenOrder,
  BillingQueueItem,
  CATEGORIES,
  PRODUCTS,
  INITIAL_KITCHEN_ORDERS,
  INITIAL_BILLING_QUEUE,
  ALL_TABLES,
  ORDER_TYPES,
  PAYMENT_METHODS,
  SWEET_ADDON_GROUPS,
  SAVORY_ADDON_GROUPS,
  FLAT_SWEET_ADDONS,
  FLAT_SAVORY_ADDONS,
  PROMOS,
  formatRupiah,
} from '@/constants/pos-data';

export default function POSScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  // Responsive Breakpoints
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1120;
  const isDesktop = width >= 1120;

  // View state: 'pos' or 'activity'
  const [currentView, setCurrentView] = useState<'pos' | 'activity'>('pos');
  const [activitySubTab, setActivitySubTab] = useState<'billing' | 'tables' | 'history'>('billing');
  const [billingFilter, setBillingFilter] = useState<'all' | 'active' | 'closed'>('all');

  // Store status: Open or Close
  const [isOpenOrder, setIsOpenOrder] = useState(true);

  // Dynamic Real-time Date and Clock
  const [currentDateStr, setCurrentDateStr] = useState(() => {
    const now = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const dayName = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${dayName}, ${date} ${month} ${year} • ${hours}:${minutes} WIB`;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      const dayName = days[now.getDay()];
      const date = now.getDate();
      const month = months[now.getMonth()];
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentDateStr(`${dayName}, ${date} ${month} ${year} • ${hours}:${minutes} WIB`);
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  // Drawer & Modals state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailQuantity, setDetailQuantity] = useState(1);
  const [detailNote, setDetailNote] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);

  // Cart edit note & addons modal
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
  const [cartItemNoteText, setCartItemNoteText] = useState('');
  const [cartItemEditAddons, setCartItemEditAddons] = useState<Addon[]>([]);

  // Customer info & Order Number
  const [orderCountSeq, setOrderCountSeq] = useState(8);
  const [customerName, setCustomerName] = useState("Customer 8");
  const [orderNumber, setOrderNumber] = useState('#008');
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [tempCustomerName, setTempCustomerName] = useState(customerName);

  // Active Kitchen Orders (Track Order) & Billing Queue State
  const [kitchenOrders, setKitchenOrders] = useState<KitchenOrder[]>(INITIAL_KITCHEN_ORDERS);
  const [billingQueue, setBillingQueue] = useState<BillingQueueItem[]>(INITIAL_BILLING_QUEUE);

  // Track Order Detail Modal State & Handlers
  const [selectedTrackOrder, setSelectedTrackOrder] = useState<KitchenOrder | null>(null);
  const [trackOrderDetailModalOpen, setTrackOrderDetailModalOpen] = useState(false);

  const handleOpenTrackOrderDetail = (order: KitchenOrder) => {
    setSelectedTrackOrder(order);
    setTrackOrderDetailModalOpen(true);
  };

  const handleAdvanceOrderStatus = (orderId: string) => {
    setKitchenOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        if (order.status === 'On Kitchen Hand') {
          return { ...order, status: 'To be Served', statusColor: 'blue' as const };
        } else if (order.status === 'To be Served') {
          return { ...order, status: 'All Done', statusColor: 'mint' as const };
        }
        return order;
      })
    );
    setSelectedTrackOrder((prev) => {
      if (!prev || prev.id !== orderId) return prev;
      if (prev.status === 'On Kitchen Hand') {
        return { ...prev, status: 'To be Served', statusColor: 'blue' as const };
      } else if (prev.status === 'To be Served') {
        return { ...prev, status: 'All Done', statusColor: 'mint' as const };
      }
      return prev;
    });
  };

  // Dynamic Occupied Tables computation
  const occupiedTables = useMemo(() => {
    const occupied = new Set<string>();
    kitchenOrders.forEach((order) => {
      if (order.status !== 'All Done') {
        const cleanTable = order.table.replace('Table:', '').trim();
        occupied.add(cleanTable);
      }
    });
    return occupied;
  }, [kitchenOrders]);

  // Table options with occupied/available status
  const tableOptions = useMemo(() => {
    return ALL_TABLES.map((t) => {
      const isOccupied = occupiedTables.has(t.value);
      return {
        label: t.label,
        value: t.value,
        isDisabled: isOccupied,
        badge: isOccupied ? 'Terpakai' : 'Tersedia',
        badgeIntent: isOccupied ? ('danger' as const) : ('gray' as const),
      };
    });
  }, [occupiedTables]);

  // Currently selected table (default to first available table!)
  const [selectedTable, setSelectedTable] = useState<string>('Table 05');
  const [selectedOrderType, setSelectedOrderType] = useState('Dine In');
  const [paymentMethod, setPaymentMethod] = useState('QRIS');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // If currently selected table becomes occupied, auto-pick first available
  useEffect(() => {
    if (occupiedTables.has(selectedTable)) {
      const firstAvailable = tableOptions.find((t) => !t.isDisabled);
      if (firstAvailable) {
        setSelectedTable(firstAvailable.value);
      }
    }
  }, [occupiedTables, tableOptions, selectedTable]);

  // Promo code & Promo list state
  const [appliedPromo, setAppliedPromo] = useState<Promo | null>(null);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Order Success Modal
  const [orderSuccessModalOpen, setOrderSuccessModalOpen] = useState(false);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<any>(null);

  // Bottom Track Order Tray toggle
  const [trackOrderOpen, setTrackOrderOpen] = useState(true);

  // Search & Categories
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Cart State (Empty initially as requested!)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Mobile cart & kitchen sheet modals
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [mobileKitchenSheetOpen, setMobileKitchenSheetOpen] = useState(false);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Helper to calculate item unit price with its addons
  const getItemUnitPrice = (item: CartItem): number => {
    const addonsTotal = item.addons ? item.addons.reduce((sum, a) => sum + a.price, 0) : 0;
    return item.product.price + addonsTotal;
  };

  // Calculations
  const { subtotal, tax, discount, total, totalItemsCount } = useMemo(() => {
    const sub = cartItems.reduce(
      (sum, item) => sum + getItemUnitPrice(item) * item.quantity,
      0
    );
    const taxAmount = sub * 0.10; // 10%
    
    // Calculate promo discount dynamically
    let disc = 0;
    if (appliedPromo && sub >= appliedPromo.minPurchase) {
      if (appliedPromo.discountType === 'fixed') {
        disc = appliedPromo.discountValue;
      } else {
        const percentDisc = sub * (appliedPromo.discountValue / 100);
        disc = appliedPromo.maxDiscount ? Math.min(percentDisc, appliedPromo.maxDiscount) : percentDisc;
      }
    }

    const finalTotal = Math.max(0, sub + taxAmount - disc);
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal: sub,
      tax: taxAmount,
      discount: disc,
      total: finalTotal,
      totalItemsCount: count,
    };
  }, [cartItems, appliedPromo]);

  // Detail Modal Dynamic Price
  const detailModalUnitPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);
    return selectedProduct.price + addonsTotal;
  }, [selectedProduct, selectedAddons]);

  // Check if detail modal product uses Grouped Addons or Flat Addons
  const isDetailProductGrouped = useMemo(() => {
    if (!selectedProduct) return false;
    if (selectedProduct.addonType === 'flat') return false;
    if (selectedProduct.addonType === 'grouped') return true;
    return !!(selectedProduct.addonGroups && selectedProduct.addonGroups.length > 0);
  }, [selectedProduct]);

  // Detail Modal Addon Groups (for grouped products)
  const currentProductAddonGroups: AddonGroup[] = useMemo(() => {
    if (!selectedProduct) return [];
    if (selectedProduct.addonGroups && selectedProduct.addonGroups.length > 0) {
      return selectedProduct.addonGroups;
    }
    return selectedProduct.category === 'Sandwich' || selectedProduct.category === 'Bread'
      ? SAVORY_ADDON_GROUPS
      : SWEET_ADDON_GROUPS;
  }, [selectedProduct]);

  // Detail Modal Flat Addons (for flat/biasa products)
  const currentProductFlatAddons: Addon[] = useMemo(() => {
    if (!selectedProduct) return [];
    if (selectedProduct.availableAddons && selectedProduct.availableAddons.length > 0) {
      return selectedProduct.availableAddons;
    }
    return selectedProduct.category === 'Sandwich' || selectedProduct.category === 'Bread'
      ? FLAT_SAVORY_ADDONS
      : FLAT_SWEET_ADDONS;
  }, [selectedProduct]);

  // Actions
  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);
    setDetailQuantity(1);
    setDetailNote('');
    setSelectedAddons([]);
    setDetailModalOpen(true);
  };

  const toggleAddonInDetail = (addon: Addon) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const handleAddToCartFromDetail = () => {
    if (!selectedProduct) return;
    
    // Check if identical item (same product, same addons, same note) already exists
    const addonIds = selectedAddons.map((a) => a.id).sort().join(',');
    const existingIndex = cartItems.findIndex((item) => {
      const itemAddonIds = (item.addons || []).map((a) => a.id).sort().join(',');
      return (
        item.product.id === selectedProduct.id &&
        itemAddonIds === addonIds &&
        (item.note || '') === detailNote
      );
    });

    if (existingIndex > -1) {
      setCartItems((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + detailQuantity }
            : item
        )
      );
    } else {
      const newItem: CartItem = {
        id: `cart_${Date.now()}`,
        product: selectedProduct,
        quantity: detailQuantity,
        addons: selectedAddons,
        note: detailNote,
      };
      setCartItems((prev) => [newItem, ...prev]);
    }

    setDetailModalOpen(false);
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const handleOpenEditNote = (item: CartItem) => {
    setEditingCartItem(item);
    setCartItemNoteText(item.note || '');
    setCartItemEditAddons(item.addons ? [...item.addons] : []);
  };

  const toggleAddonInEdit = (addon: Addon) => {
    setCartItemEditAddons((prev) => {
      const exists = prev.find((a) => a.id === addon.id);
      if (exists) {
        return prev.filter((a) => a.id !== addon.id);
      }
      return [...prev, addon];
    });
  };

  const handleSaveItemEdit = () => {
    if (!editingCartItem) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === editingCartItem.id
          ? { ...item, note: cartItemNoteText, addons: cartItemEditAddons }
          : item
      )
    );
    setEditingCartItem(null);
  };

  // Promo Handlers
  const handleApplyPromo = (promo: Promo) => {
    if (subtotal < promo.minPurchase) {
      setPromoError(`Minimal belanja untuk promo ini adalah ${formatRupiah(promo.minPurchase)}`);
      return;
    }
    setAppliedPromo(promo);
    setPromoError('');
    setPromoModalOpen(false);
  };

  const handleApplyCustomPromoCode = () => {
    const found = PROMOS.find((p) => p.code.toLowerCase() === promoCodeInput.trim().toLowerCase());
    if (found) {
      handleApplyPromo(found);
    } else {
      setPromoError('Kode promo tidak ditemukan atau sudah kadaluarsa.');
    }
  };

  // Place Order Simulation: Adds to Kitchen Orders & Billing Queue!
  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;

    const placedOrderData = {
      customerName,
      orderNumber,
      table: selectedTable,
      orderType: selectedOrderType,
      items: [...cartItems],
      total,
      paymentMethod,
    };

    // 1. Add to Track Order (kitchen orders)
    const newKitchenOrder: KitchenOrder = {
      id: `k_${Date.now()}`,
      customerName: customerName.replace("'s Order", "").trim() || 'Customer',
      orderNumber,
      table: selectedTable,
      orderType: selectedOrderType as any,
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: 'On Kitchen Hand',
      statusColor: 'amber',
      items: cartItems.map((ci) => ({
        name: ci.product.name + (ci.addons && ci.addons.length > 0 ? ` (+${ci.addons.map((a) => a.name.replace('+ ', '')).join(', ')})` : ''),
        qty: ci.quantity,
      })),
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    };

    setKitchenOrders((prev) => [newKitchenOrder, ...prev]);

    // 2. Add to Billing Queue
    const newBillingItem: BillingQueueItem = {
      id: `b_${Date.now()}`,
      customerName: customerName.replace("'s Order", "").trim() || 'Customer',
      orderNumber,
      table: selectedTable,
      dateStr: `Hari ini • ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`,
      total,
      status: 'Active',
    };

    setBillingQueue((prev) => [newBillingItem, ...prev]);

    // 3. Set order success and clear cart
    setLastPlacedOrder(placedOrderData);
    setOrderSuccessModalOpen(true);
    if (isMobile) setMobileCartOpen(false);
  };

  const handleFinishOrder = () => {
    setOrderSuccessModalOpen(false);
    setCartItems([]);
    setAppliedPromo(null);
    setPromoError('');
    
    // Next order customer & sequence
    const nextSeq = orderCountSeq + 1;
    setOrderCountSeq(nextSeq);
    const nextOrderNum = `#00${nextSeq}`;
    setOrderNumber(nextOrderNum);
    setCustomerName(`Customer ${nextSeq}`);

    if (isMobile) setMobileCartOpen(false);
  };

  // Render Cart Component
  const renderCartPanel = () => (
    <View style={styles.cartContainer}>
      {/* Cart Header: Exactly ONE edit pencil button on the right */}
      <View style={styles.cartHeader}>
        <View style={styles.cartHeaderLeft}>
          <View style={styles.receiptIconBox}>
            <Ionicons name="receipt-outline" size={20} color="#0F172A" />
            <View style={styles.blueDotBadge} />
          </View>
          <View>
            <Text style={styles.customerNameText} numberOfLines={1}>
              {customerName}
            </Text>
            <Text style={styles.orderNumberText}>Order Number: {orderNumber}</Text>
          </View>
        </View>

        {/* ONE and only edit button */}
        <TouchableOpacity
          onPress={() => {
            setTempCustomerName(customerName);
            setIsEditingCustomer(true);
          }}
          style={styles.editCustomerIconBtn}
          accessibilityLabel="Edit nama pesanan"
        >
          <Ionicons name="pencil-outline" size={17} color="#475569" />
        </TouchableOpacity>
      </View>

      {/* Select Controls: Table & Order Type */}
      <View style={styles.selectRow}>
        <View style={styles.selectCol}>
          <Select
            value={selectedTable}
            onChange={(val) => setSelectedTable(val)}
            options={tableOptions}
            placeholder="Pilih Meja"
            label="Pilih Meja (Dine In)"
            shape="pill"
            size="md"
          />
        </View>
        <View style={styles.selectCol}>
          <Select
            value={selectedOrderType}
            onChange={(val) => setSelectedOrderType(val)}
            options={ORDER_TYPES}
            placeholder="Order Type"
            shape="pill"
            size="md"
          />
        </View>
      </View>

      {/* Cart Items List */}
      <View style={styles.cartListContainer}>
        {cartItems.length === 0 ? (
          <View style={styles.emptyCartContainer}>
            <View style={styles.emptyCartIconCircle}>
              <Ionicons name="bag-handle-outline" size={26} color="#2563EB" />
            </View>
            <Text style={styles.emptyCartText}>Belum Ada Menu Dipilih</Text>
            <Text style={styles.emptyCartSub}>Pilih menu bakery di sebelah kiri untuk menambah pesanan</Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cartScrollContent}
          >
            {cartItems.map((item) => {
              const unitPrice = getItemUnitPrice(item);
              const hasAddons = item.addons && item.addons.length > 0;

              return (
                <View key={item.id} style={styles.cartItemRow}>
                  <Image source={{ uri: item.product.image }} style={styles.cartItemThumb} />
                  <View style={styles.cartItemDetails}>
                    <Text style={styles.cartItemName} numberOfLines={1}>
                      {item.product.name}
                    </Text>
                    <Text style={styles.cartItemPrice}>
                      {formatRupiah(unitPrice)}
                    </Text>

                    {/* Display Addons if any */}
                    {hasAddons && (
                      <View style={styles.cartAddonsRow}>
                        {item.addons!.map((addon) => (
                          <Text key={addon.id} style={styles.cartAddonTag}>
                            {addon.name}
                          </Text>
                        ))}
                      </View>
                    )}

                    {/* Display Note if any */}
                    {item.note ? (
                      <Text style={styles.cartItemNoteBadge} numberOfLines={1}>
                        Note: {item.note}
                      </Text>
                    ) : null}
                  </View>

                  {/* Edit Note / Addons button */}
                  <TouchableOpacity
                    onPress={() => handleOpenEditNote(item)}
                    style={[
                      styles.noteBtn,
                      item.note || hasAddons ? styles.noteBtnActive : styles.noteBtnInactive,
                    ]}
                  >
                    <Ionicons
                      name="pencil-outline"
                      size={13}
                      color={item.note || hasAddons ? '#FFFFFF' : '#64748B'}
                    />
                  </TouchableOpacity>

                  {/* Stepper */}
                  <Stepper
                    value={item.quantity}
                    onIncrement={() => updateQuantity(item.id, 1)}
                    onDecrement={() => updateQuantity(item.id, -1)}
                    size="sm"
                    style={styles.cartStepper}
                  />

                  {/* Quick Delete */}
                  <TouchableOpacity
                    onPress={() => removeCartItem(item.id)}
                    style={styles.deleteItemBtn}
                  >
                    <Ionicons name="trash-outline" size={14} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Decorative Scallop Border */}
      <View style={styles.scallopContainer}>
        <View style={styles.scallopLine} />
      </View>

      {/* Summary / Calculation Breakdown */}
      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatRupiah(subtotal)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax (10%)</Text>
          <Text style={styles.summaryValue}>{formatRupiah(tax)}</Text>
        </View>

        {appliedPromo && discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.discountLabel}>Discount ({appliedPromo.code})</Text>
            <Text style={styles.discountValue}>-{formatRupiah(discount)}</Text>
          </View>
        )}

        <View style={styles.dashedDivider} />

        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>{formatRupiah(total)}</Text>
        </View>

        {/* Promo Code & Payment Method Row */}
        <View style={styles.paymentActionRow}>
          {appliedPromo ? (
            <TouchableOpacity
              onPress={() => setAppliedPromo(null)}
              style={styles.promoAppliedPill}
              activeOpacity={0.8}
            >
              <Text style={styles.promoAppliedText} numberOfLines={1}>
                {appliedPromo.code} (-{formatRupiah(discount)})
              </Text>
              <View style={styles.promoCheckCircle}>
                <Ionicons name="close" size={12} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setPromoError('');
                setPromoModalOpen(true);
              }}
              style={styles.addPromoPill}
              activeOpacity={0.8}
            >
              <Text style={styles.addPromoText}>Apply Voucher or Promo</Text>
              <Ionicons name="pricetag-outline" size={14} color="#64748B" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setPaymentModalOpen(true)}
            style={styles.paymentMethodPill}
            activeOpacity={0.8}
          >
            <Text style={styles.paymentMethodText}>{paymentMethod}</Text>
          </TouchableOpacity>
        </View>

        {/* Primary CTA: Place Order Button */}
        <Button
          intent="primary"
          size="lg"
          shape="rounded"
          onPress={handlePlaceOrder}
          disabled={cartItems.length === 0}
          style={styles.placeOrderBtn}
          textStyle={{ color: '#FFFFFF', fontWeight: '700' }}
        >
          {cartItems.length === 0 ? 'Pilih Menu Dulu' : `Place Order (${formatRupiah(total)})`}
        </Button>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 1. TOP HEADER BAR */}
      <View style={styles.topHeader}>
        <View style={styles.topHeaderLeft}>
          {/* Hamburger Menu button */}
          <TouchableOpacity
            onPress={() => setDrawerOpen(true)}
            style={styles.iconCircleBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={22} color="#1E293B" />
          </TouchableOpacity>

          {/* Breadcrumb if in Activity view */}
          {currentView === 'activity' ? (
            <View style={styles.breadcrumbContainer}>
              <TouchableOpacity onPress={() => setCurrentView('pos')}>
                <Text style={styles.breadcrumbTitle}>Activity</Text>
              </TouchableOpacity>
              <Text style={styles.breadcrumbDivider}>/</Text>
              <Text style={styles.breadcrumbSub}>Billing Queue</Text>
            </View>
          ) : (
            <View style={[styles.datePill, isMobile && { paddingHorizontal: 10, paddingVertical: 6 }]}>
              <Ionicons
                name={isMobile ? 'time-outline' : 'calendar-outline'}
                size={14}
                color="#2563EB"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.datePillText}>
                {isMobile
                  ? currentDateStr.split('•')[1]?.trim() || currentDateStr
                  : currentDateStr}
              </Text>
            </View>
          )}
        </View>

        {/* Header Right */}
        <View style={[styles.topHeaderRight, isMobile && { gap: 8 }]}>
          {currentView === 'activity' && (
            <View style={styles.datePillSmall}>
              <Ionicons name="calendar-outline" size={14} color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={styles.datePillText}>{currentDateStr}</Text>
            </View>
          )}

          {/* Store status pill toggle */}
          <TouchableOpacity
            onPress={() => setIsOpenOrder(!isOpenOrder)}
            style={[
              styles.statusPill,
              isOpenOrder ? styles.statusPillOpen : styles.statusPillClose,
              isMobile && { paddingHorizontal: 10, paddingVertical: 6 },
            ]}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.statusDot,
                isOpenOrder ? styles.statusDotOpen : styles.statusDotClose,
              ]}
            />
            <Text
              style={[
                styles.statusText,
                isOpenOrder ? styles.statusTextOpen : styles.statusTextClose,
                isMobile && { fontSize: 12 },
              ]}
            >
              {isOpenOrder ? 'Open Order' : 'Close Order'}
            </Text>
          </TouchableOpacity>

          {/* Power button */}
          <TouchableOpacity
            onPress={() => router.replace('/')}
            style={[styles.powerBtn, isMobile && { width: 34, height: 34, borderRadius: 17 }]}
            activeOpacity={0.7}
          >
            <Ionicons name="power-outline" size={isMobile ? 16 : 18} color="#0D9488" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. BODY CONTENT */}
      {currentView === 'pos' ? (
        <View style={styles.mainLayout}>
          {/* LEFT SECTION: Products & Categories */}
          <View style={styles.productsSection}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.productsScroll,
                isMobile && { padding: 12, paddingBottom: 88 },
                isTablet && { padding: 16, paddingBottom: 130 },
              ]}
            >
              {/* Category Pills Row: TEXT-ONLY, NO ICONS! */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.categoryRow, isMobile && { paddingBottom: 12 }]}
              >
                {CATEGORIES.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setSelectedCategory(cat.id)}
                      activeOpacity={0.8}
                      style={[
                        styles.categoryPill,
                        isActive && styles.categoryPillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.categoryPillText,
                          isActive && styles.categoryPillTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                      <View
                        style={[
                          styles.categoryCountBadge,
                          isActive && styles.categoryCountBadgeActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryCountText,
                            isActive && styles.categoryCountTextActive,
                          ]}
                        >
                          {cat.count}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Search Bar */}
              <View style={[styles.searchContainer, isMobile && { marginBottom: 12 }]}>
                <SearchField
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder={
                    isMobile
                      ? 'Cari roti, cake, pastry...'
                      : 'Cari produk bakery, roti, pastry, cake...'
                  }
                  iconPosition="right"
                />
              </View>

              {/* Product Grid: 2-Columns on Mobile, Fluid Grid on Tablet & Desktop */}
              <View
                style={[
                  styles.gridContainer,
                  Platform.select({
                    web: {
                      display: 'grid',
                      gridTemplateColumns: isMobile
                        ? 'repeat(2, minmax(0, 1fr))'
                        : isTablet
                        ? 'repeat(auto-fill, minmax(150px, 1fr))'
                        : 'repeat(auto-fill, minmax(170px, 1fr))',
                      gap: isMobile ? '10px' : '14px',
                    } as any,
                  }),
                ]}
              >
                {filteredProducts.map((product) => (
                  <TouchableOpacity
                    key={product.id}
                    onPress={() => handleOpenDetail(product)}
                    activeOpacity={0.85}
                    style={[
                      styles.productCard,
                      isMobile && {
                        height: 215,
                        minHeight: 215,
                        maxHeight: 215,
                        padding: 10,
                        borderRadius: 16,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.productImageContainer,
                        isMobile && { height: 110, borderRadius: 10, marginBottom: 6 },
                      ]}
                    >
                      <Image
                        source={{ uri: product.image }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={1}>
                        {product.name}
                      </Text>
                      <View style={styles.productMetaRow}>
                        <Badge
                          intent={product.categoryBadgeColor}
                          size="sm"
                          shape="pill"
                        >
                          {product.category}
                        </Badge>
                        <Text style={styles.productPrice}>
                          {formatRupiah(product.price)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Bottom Docked Kitchen Track Order Drawer (Desktop & Tablet) */}
            {!isMobile && (
              <View style={styles.trackOrderTrayContainer}>
                <View style={styles.trackOrderHeaderRow}>
                  <TouchableOpacity
                    onPress={() => setTrackOrderOpen(!trackOrderOpen)}
                    style={styles.trackOrderToggleBtn}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="flame" size={13} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.trackOrderToggleText}>
                      Pesanan Dapur Aktif ({kitchenOrders.length})
                    </Text>
                    <Ionicons
                      name={trackOrderOpen ? 'chevron-down' : 'chevron-up'}
                      size={14}
                      color="#FFFFFF"
                      style={{ marginLeft: 6 }}
                    />
                  </TouchableOpacity>
                </View>

                {trackOrderOpen && (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.trackOrderCardsRow}
                  >
                    {kitchenOrders.map((order) => (
                      <TouchableOpacity
                        key={order.id}
                        onPress={() => handleOpenTrackOrderDetail(order)}
                        style={styles.kitchenOrderCard}
                        activeOpacity={0.75}
                      >
                        <View style={styles.kitchenCardTop}>
                          <Text style={styles.kitchenCustomerName}>
                            {order.customerName}
                          </Text>
                          <Badge
                            intent={order.statusColor}
                            size="sm"
                            shape="pill"
                          >
                            {order.status === 'On Kitchen Hand'
                              ? 'Sedang Dimasak'
                              : order.status === 'To be Served'
                              ? 'Siap Saji'
                              : 'Selesai'}
                          </Badge>
                        </View>
                        <View style={styles.kitchenCardBottom}>
                          <Text style={styles.kitchenTableText}>
                            {order.table} • {order.orderType}
                          </Text>
                          <Text style={styles.kitchenTimeText}>{order.time}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}
          </View>

          {/* RIGHT SECTION: Cart Panel (Desktop / Tablet) */}
          {!isMobile && (
            <View style={[styles.cartSection, isTablet && { width: 320 }]}>
              {renderCartPanel()}
            </View>
          )}

          {/* Mobile Unified Floating Bottom Bar */}
          {isMobile && (
            <View style={styles.mobileBottomBar}>
              {/* Left: Quick Access to Pesanan Dapur */}
              <TouchableOpacity
                onPress={() => setMobileKitchenSheetOpen(true)}
                style={styles.mobileKitchenBtn}
                activeOpacity={0.8}
              >
                <View style={styles.mobileKitchenIconBadge}>
                  <Ionicons name="flame" size={15} color="#EA580C" />
                </View>
                <View>
                  <Text style={styles.mobileKitchenTitle}>Dapur</Text>
                  <Text style={styles.mobileKitchenSub}>{kitchenOrders.length} Pesanan</Text>
                </View>
              </TouchableOpacity>

              {/* Right: Cart Button */}
              <TouchableOpacity
                onPress={() => setMobileCartOpen(true)}
                style={[
                  styles.mobileCartBtn,
                  cartItems.length > 0 ? styles.mobileCartBtnActive : styles.mobileCartBtnEmpty,
                ]}
                activeOpacity={0.85}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[
                    styles.mobileCartIconBox,
                    cartItems.length > 0 && styles.mobileCartIconBoxActive,
                  ]}>
                    <Ionicons
                      name="bag-handle"
                      size={16}
                      color={cartItems.length > 0 ? '#FFFFFF' : '#64748B'}
                    />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.mobileCartBtnCount,
                        cartItems.length > 0 && { color: 'rgba(255, 255, 255, 0.85)' },
                      ]}
                    >
                      {cartItems.length > 0 ? `${totalItemsCount} item dipilih` : 'Keranjang Kosong'}
                    </Text>
                    <Text
                      style={[
                        styles.mobileCartBtnPrice,
                        cartItems.length > 0 && { color: '#FFFFFF' },
                      ]}
                    >
                      {formatRupiah(total)}
                    </Text>
                  </View>
                </View>

                <View style={[
                  styles.mobileCartArrowPill,
                  cartItems.length > 0 && styles.mobileCartArrowPillActive,
                ]}>
                  <Text style={[
                    styles.mobileCartArrowText,
                    cartItems.length > 0 && { color: '#FFFFFF' },
                  ]}>
                    {cartItems.length > 0 ? 'Lihat' : 'Pilih'}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={13}
                    color={cartItems.length > 0 ? '#FFFFFF' : '#64748B'}
                  />
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        /* 3. ACTIVITY / BILLING QUEUE VIEW */
        <View style={styles.activityLayout}>
          {/* Sub Sidebar */}
          <View style={styles.activitySidebar}>
            <View style={styles.activitySearchBox}>
              <SearchField
                value=""
                onChangeText={() => {}}
                placeholder="Search..."
                iconPosition="left"
              />
            </View>

            <View style={styles.activityNavMenu}>
              <TouchableOpacity
                onPress={() => setActivitySubTab('billing')}
                style={[
                  styles.activityNavItem,
                  activitySubTab === 'billing' && styles.activityNavItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.activityNavText,
                    activitySubTab === 'billing' && styles.activityNavTextActive,
                  ]}
                >
                  Billing Queue
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActivitySubTab('tables')}
                style={[
                  styles.activityNavItem,
                  activitySubTab === 'tables' && styles.activityNavItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.activityNavText,
                    activitySubTab === 'tables' && styles.activityNavTextActive,
                  ]}
                >
                  Tables
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActivitySubTab('history')}
                style={[
                  styles.activityNavItem,
                  activitySubTab === 'history' && styles.activityNavItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.activityNavText,
                    activitySubTab === 'history' && styles.activityNavTextActive,
                  ]}
                >
                  Order History
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sidebar Footer branding */}
            <View style={styles.activityBrandFooter}>
              <Text style={styles.brandTitle}>
                <Text style={{ color: '#2563EB', fontWeight: '800' }}>Bakehouse</Text> • POS System
              </Text>
              <Text style={styles.brandSubtitle}>
                The dreamy taste & magic of sweet moments in every bite from our bakery.
              </Text>
              <View style={styles.brandFooterLinks}>
                <Text style={styles.brandCopyright}>© 2024, Bakehouse</Text>
                <Text style={styles.brandLink}>Contacts</Text>
                <Text style={styles.brandLink}>Help</Text>
              </View>
            </View>
          </View>

          {/* Center Main Queue List */}
          <View style={styles.activityMainContent}>
            {/* Filter Pills row */}
            <View style={styles.queueHeaderRow}>
              <Tabs
                tabs={[
                  { id: 'all', label: 'All' },
                  { id: 'active', label: 'Active' },
                  { id: 'closed', label: 'Closed' },
                ]}
                selectedTab={billingFilter}
                onSelectTab={(tab) => setBillingFilter(tab as any)}
                variant="pills"
              />

              <View style={styles.queueHeaderRight}>
                <Badge intent="blue" size="md" shape="pill">
                  {billingQueue.length} Active Queue
                </Badge>
                <TouchableOpacity style={styles.iconCircleBtnSmall}>
                  <Ionicons name="ellipsis-horizontal" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Queue Items */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.queueListScroll}
            >
              {billingQueue.filter(
                (item) =>
                  billingFilter === 'all' ||
                  item.status.toLowerCase() === billingFilter
              ).map((queueItem) => (
                <View key={queueItem.id} style={styles.queueItemRow}>
                  <View style={styles.queueItemLeft}>
                    <Text style={styles.queueItemCustomer}>
                      {queueItem.customerName}
                    </Text>
                    <Text style={styles.queueItemSub}>
                      Order Number: {queueItem.orderNumber}
                    </Text>
                    <Text style={styles.queueItemTable}>
                      {queueItem.table}
                    </Text>
                    <Text style={styles.queueItemDate}>
                      {queueItem.dateStr}
                    </Text>
                  </View>

                  <View style={styles.queueItemRight}>
                    <Text style={styles.queueItemPrice}>
                      {formatRupiah(queueItem.total)}
                    </Text>
                    <Badge
                      intent={queueItem.status === 'Active' ? 'blue' : 'danger'}
                      size="sm"
                      shape="pill"
                    >
                      {queueItem.status}
                    </Badge>
                  </View>
                </View>
              ))}

              {/* Bottom Track Order detailed cards */}
              <View style={styles.activityTrackOrderSection}>
                <View style={styles.activityTrackOrderHeader}>
                  <Text style={styles.trackOrderSectionTitle}>Track Order</Text>
                  <View style={styles.trackOrderControls}>
                    <TouchableOpacity style={styles.iconCircleBtnSmall}>
                      <Ionicons name="search" size={16} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconCircleBtnSmall}>
                      <Ionicons name="chevron-back" size={16} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconCircleBtnSmallActive}>
                      <Ionicons name="chevron-forward" size={16} color="#2563EB" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.activityTrackCardsGrid}>
                  {kitchenOrders.map((kOrder) => (
                    <View key={kOrder.id} style={styles.activityTrackCard}>
                      <View style={styles.trackCardHeader}>
                        <Text style={styles.trackCardName}>
                          {kOrder.customerName}
                        </Text>
                        <Badge
                          intent={kOrder.statusColor}
                          size="sm"
                          shape="pill"
                        >
                          {kOrder.status}
                        </Badge>
                      </View>
                      <Text style={styles.trackCardSub}>
                        {kOrder.table} • {kOrder.orderType}
                      </Text>
                      <Text style={styles.trackCardTime}>{kOrder.time}</Text>

                      <View style={styles.trackCardDivider} />

                      <View style={styles.trackCardItemsList}>
                        {kOrder.items.map((item, idx) => (
                          <Text key={idx} style={styles.trackCardItemLine}>
                            {item.qty}x  {item.name}
                          </Text>
                        ))}
                      </View>

                      <TouchableOpacity style={styles.seeMoreBtn}>
                        <Text style={styles.seeMoreText}>See More</Text>
                      </TouchableOpacity>

                      <View style={styles.trackCardFooter}>
                        <Text style={styles.trackTotalLabel}>Total Order:</Text>
                        <Text style={styles.trackTotalVal}>
                          {kOrder.totalItems} Items
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* 4. DETAIL MENU MODAL: GROUPED ADDONS ("Extra Addons" & "Plus Addons") */}
      <Dialog
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Detail Menu"
        maxWidth={520}
      >
        {selectedProduct && (
          <View style={styles.detailDialogWrapper}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.detailModalScroll}
              contentContainerStyle={styles.detailModalBody}
            >
              {/* Product Image */}
              <View style={styles.detailImageContainer}>
                <Image
                  source={{ uri: selectedProduct.image }}
                  style={styles.detailProductImage}
                  resizeMode="cover"
                />
              </View>

              {/* Product Info */}
              <View style={styles.detailInfoContainer}>
                <View style={styles.detailTopMeta}>
                  <Badge
                    intent={selectedProduct.categoryBadgeColor}
                    size="sm"
                    shape="pill"
                  >
                    {selectedProduct.category}
                  </Badge>
                  <Text style={styles.detailPriceTag}>
                    {formatRupiah(selectedProduct.price)}
                  </Text>
                </View>

                <Text style={styles.detailTitle}>{selectedProduct.name}</Text>
                <Text style={styles.detailDescription}>
                  {selectedProduct.description}
                </Text>
              </View>

              <View style={styles.detailSectionDivider} />

              {/* ADD-ONS SECTION: EITHER GROUPING ADDONS OR ADDONS BIASA */}
              {isDetailProductGrouped ? (
                /* TYPE 1: GROUPING ADDONS ("Extra Addons", "Plus Addons") */
                <View style={styles.allAddonGroupsWrapper}>
                  {currentProductAddonGroups.map((group, groupIdx) => (
                    <View key={groupIdx} style={styles.addonGroupContainer}>
                      <View style={styles.addonGroupHeader}>
                        <Text style={styles.addonGroupMainTitle}>{group.title}</Text>
                        {group.subtitle ? (
                          <Text style={styles.addonGroupSubtitle}>{group.subtitle}</Text>
                        ) : null}
                      </View>

                      {/* Vertical list of addons with 1. 2. 3. numbering */}
                      <View style={styles.addonsVerticalList}>
                        {group.addons.map((addon, addonIdx) => {
                          const isSelected = selectedAddons.some((a) => a.id === addon.id);
                          return (
                            <TouchableOpacity
                              key={addon.id}
                              onPress={() => toggleAddonInDetail(addon)}
                              activeOpacity={0.8}
                              style={[
                                styles.addonRowCard,
                                isSelected && styles.addonRowCardSelected,
                              ]}
                            >
                              <View style={styles.addonRowLeft}>
                                <View
                                  style={[
                                    styles.addonCheckbox,
                                    isSelected && styles.addonCheckboxSelected,
                                  ]}
                                >
                                  {isSelected && (
                                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                                  )}
                                </View>
                                <View style={styles.addonTextGroup}>
                                  <Text
                                    style={[
                                      styles.addonRowTitle,
                                      isSelected && styles.addonRowTitleSelected,
                                    ]}
                                  >
                                    {addonIdx + 1}. {addon.name}
                                  </Text>
                                  <Text style={styles.addonRowDescription}>
                                    {addon.description}
                                  </Text>
                                </View>
                              </View>

                              <View
                                style={[
                                  styles.addonPriceBadge,
                                  isSelected && styles.addonPriceBadgeSelected,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.addonPriceText,
                                    isSelected && styles.addonPriceTextSelected,
                                  ]}
                                >
                                  +{formatRupiah(addon.price)}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                /* TYPE 2: ADDONS BIASA (Flat List) */
                <View style={styles.addonGroupContainer}>
                  <View style={styles.addonGroupHeader}>
                    <Text style={styles.addonGroupMainTitle}>Pilihan Tambahan (Add-ons)</Text>
                    <Text style={styles.addonGroupSubtitle}>
                      Kustomisasi pesananmu dengan pilihan ekstra lezat di bawah ini
                    </Text>
                  </View>

                  <View style={styles.addonsVerticalList}>
                    {currentProductFlatAddons.map((addon, addonIdx) => {
                      const isSelected = selectedAddons.some((a) => a.id === addon.id);
                      return (
                        <TouchableOpacity
                          key={addon.id}
                          onPress={() => toggleAddonInDetail(addon)}
                          activeOpacity={0.8}
                          style={[
                            styles.addonRowCard,
                            isSelected && styles.addonRowCardSelected,
                          ]}
                        >
                          <View style={styles.addonRowLeft}>
                            <View
                              style={[
                                styles.addonCheckbox,
                                isSelected && styles.addonCheckboxSelected,
                              ]}
                            >
                              {isSelected && (
                                <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                              )}
                            </View>
                            <View style={styles.addonTextGroup}>
                              <Text
                                style={[
                                  styles.addonRowTitle,
                                  isSelected && styles.addonRowTitleSelected,
                                ]}
                              >
                                {addonIdx + 1}. {addon.name}
                              </Text>
                              <Text style={styles.addonRowDescription}>
                                {addon.description}
                              </Text>
                            </View>
                          </View>

                          <View
                            style={[
                              styles.addonPriceBadge,
                              isSelected && styles.addonPriceBadgeSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.addonPriceText,
                                isSelected && styles.addonPriceTextSelected,
                              ]}
                            >
                              +{formatRupiah(addon.price)}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              <View style={styles.detailSectionDivider} />

              {/* NOTES INPUT */}
              <View style={styles.detailNotesContainer}>
                <Text style={styles.detailNotesLabel}>Catatan Khusus Pesanan</Text>
                <TextField
                  value={detailNote}
                  onChangeText={setDetailNote}
                  placeholder="Contoh: Pisahkan saus, tanpa bawang, buat lebih garing..."
                  shape="rounded"
                  size="sm"
                />
              </View>
            </ScrollView>

            {/* Sticky Bottom Bar */}
            <View style={styles.detailFooterBar}>
              <View style={styles.detailFooterLeft}>
                <Stepper
                  value={detailQuantity}
                  onIncrement={() => setDetailQuantity((q) => q + 1)}
                  onDecrement={() => setDetailQuantity((q) => Math.max(1, q - 1))}
                  size="md"
                />
              </View>
              <Button
                intent="primary"
                size="md"
                shape="rounded"
                onPress={handleAddToCartFromDetail}
                style={styles.detailAddToCartBtn}
                textStyle={{ color: '#FFFFFF', fontWeight: '700' }}
              >
                Tambah ke Pesanan • {formatRupiah(detailModalUnitPrice * detailQuantity)}
              </Button>
            </View>
          </View>
        )}
      </Dialog>

      {/* 5. SIDEBAR NAVIGATION DRAWER (SCREEN 4) */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={300}
      >
        <View style={styles.drawerInner}>
          {/* User profile card */}
          <View style={styles.drawerUserRow}>
            <View style={styles.drawerUserAvatarBox}>
              <Image
                source={{
                  uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                }}
                style={styles.drawerUserAvatar}
              />
              <View>
                <View style={styles.cashierNameRow}>
                  <Text style={styles.drawerUserName}>Jelly Grande</Text>
                  <Ionicons name="chevron-down" size={14} color="#64748B" />
                </View>
                <Text style={styles.drawerUserRole}>Cashier</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setDrawerOpen(false)}
              style={styles.drawerCloseBtn}
            >
              <Ionicons name="close" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {/* Navigation Links */}
          <View style={styles.drawerNavList}>
            <TouchableOpacity
              onPress={() => {
                setCurrentView('pos');
                setDrawerOpen(false);
              }}
              style={[
                styles.drawerNavItem,
                currentView === 'pos' && styles.drawerNavItemActive,
              ]}
            >
              <View
                style={[
                  styles.drawerNavIconBox,
                  currentView === 'pos' && styles.drawerNavIconBoxActive,
                ]}
              >
                <Ionicons
                  name="storefront"
                  size={18}
                  color={currentView === 'pos' ? '#FFFFFF' : '#475569'}
                />
              </View>
              <Text
                style={[
                  styles.drawerNavText,
                  currentView === 'pos' && styles.drawerNavTextActive,
                ]}
              >
                Point of Sales
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setCurrentView('activity');
                setDrawerOpen(false);
              }}
              style={[
                styles.drawerNavItem,
                currentView === 'activity' && styles.drawerNavItemActive,
              ]}
            >
              <View
                style={[
                  styles.drawerNavIconBox,
                  currentView === 'activity' && styles.drawerNavIconBoxActive,
                ]}
              >
                <Ionicons
                  name="pulse-outline"
                  size={18}
                  color={currentView === 'activity' ? '#FFFFFF' : '#475569'}
                />
              </View>
              <Text
                style={[
                  styles.drawerNavText,
                  currentView === 'activity' && styles.drawerNavTextActive,
                ]}
              >
                Activity
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerNavItem}>
              <View style={styles.drawerNavIconBox}>
                <Ionicons name="pie-chart-outline" size={18} color="#475569" />
              </View>
              <Text style={styles.drawerNavText}>Report</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerNavItem}>
              <View style={styles.drawerNavIconBox}>
                <Ionicons name="cube-outline" size={18} color="#475569" />
              </View>
              <Text style={styles.drawerNavText}>Inventory</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerNavItem}>
              <View style={styles.drawerNavIconBox}>
                <Ionicons name="people-outline" size={18} color="#475569" />
              </View>
              <Text style={styles.drawerNavText}>Teams</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerNavItem}>
              <View style={styles.drawerNavIconBox}>
                <Ionicons name="settings-outline" size={18} color="#475569" />
              </View>
              <Text style={styles.drawerNavText}>Settings</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Logout */}
          <View style={styles.drawerFooter}>
            <TouchableOpacity
              onPress={() => router.replace('/')}
              style={styles.drawerLogoutBtn}
            >
              <Text style={styles.drawerLogoutText}>Log Out</Text>
              <View style={styles.logoutIconCircle}>
                <Ionicons name="log-out-outline" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Drawer>

      {/* 6. EDIT CUSTOMER DIALOG */}
      <Dialog
        isOpen={isEditingCustomer}
        onClose={() => setIsEditingCustomer(false)}
        title="Edit Order Info"
        maxWidth={380}
      >
        <View style={{ gap: 14, paddingTop: 10 }}>
          <TextField
            label="Nama Pemesan / Customer"
            value={tempCustomerName}
            onChangeText={setTempCustomerName}
            placeholder="e.g. Customer 8"
          />
          <TextField
            label="Nomor Pesanan"
            value={orderNumber}
            onChangeText={setOrderNumber}
            placeholder="e.g. #008"
          />
          <Button
            intent="primary"
            onPress={() => {
              setCustomerName(tempCustomerName);
              setIsEditingCustomer(false);
            }}
          >
            Simpan Perubahan
          </Button>
        </View>
      </Dialog>

      {/* 7. CART EDIT NOTE & ADDONS DIALOG */}
      <Dialog
        isOpen={!!editingCartItem}
        onClose={() => setEditingCartItem(null)}
        title="Edit Item & Addons"
        maxWidth={480}
      >
        {editingCartItem && (
          <ScrollView style={{ maxHeight: 440 }} showsVerticalScrollIndicator={false}>
            <View style={{ gap: 14, paddingTop: 6 }}>
              <Text style={{ fontSize: 13, color: '#64748B' }}>
                Item: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{editingCartItem.product.name}</Text>
              </Text>

              {/* Addons Selection in Edit */}
              {(editingCartItem.product.addonType === 'grouped' ||
                (editingCartItem.product.addonGroups && editingCartItem.product.addonGroups.length > 0)) ? (
                <View style={styles.allAddonGroupsWrapper}>
                  {(editingCartItem.product.addonGroups || 
                    (editingCartItem.product.category === 'Sandwich' || editingCartItem.product.category === 'Bread'
                      ? SAVORY_ADDON_GROUPS
                      : SWEET_ADDON_GROUPS)).map((group, groupIdx) => (
                    <View key={groupIdx} style={styles.addonGroupContainer}>
                      <View style={styles.addonGroupHeader}>
                        <View style={styles.addonGroupTitleRow}>
                          <Text style={styles.addonGroupMainTitle}>{group.title}</Text>
                        </View>
                      </View>
                      <View style={styles.addonsVerticalList}>
                        {group.addons.map((addon, addonIdx) => {
                          const isSelected = cartItemEditAddons.some((a) => a.id === addon.id);
                          return (
                            <TouchableOpacity
                              key={addon.id}
                              onPress={() => toggleAddonInEdit(addon)}
                              activeOpacity={0.8}
                              style={[
                                styles.addonRowCard,
                                isSelected && styles.addonRowCardSelected,
                              ]}
                            >
                              <View style={styles.addonRowLeft}>
                                <View
                                  style={[
                                    styles.addonCheckbox,
                                    isSelected && styles.addonCheckboxSelected,
                                  ]}
                                >
                                  {isSelected && (
                                    <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                                  )}
                                </View>
                                <View style={styles.addonTextGroup}>
                                  <Text
                                    style={[
                                      styles.addonRowTitle,
                                      isSelected && styles.addonRowTitleSelected,
                                    ]}
                                  >
                                    {addonIdx + 1}. {addon.name}
                                  </Text>
                                  <Text style={styles.addonRowDescription}>
                                    {addon.description}
                                  </Text>
                                </View>
                              </View>
                              <View
                                style={[
                                  styles.addonPriceBadge,
                                  isSelected && styles.addonPriceBadgeSelected,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.addonPriceText,
                                    isSelected && styles.addonPriceTextSelected,
                                  ]}
                                >
                                  +{formatRupiah(addon.price)}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.addonGroupContainer}>
                  <View style={styles.addonGroupHeader}>
                    <View style={styles.addonGroupTitleRow}>
                      <Text style={styles.addonGroupMainTitle}>Pilihan Addons</Text>
                    </View>
                  </View>
                  <View style={styles.addonsVerticalList}>
                    {(editingCartItem.product.availableAddons || 
                      (editingCartItem.product.category === 'Sandwich' || editingCartItem.product.category === 'Bread'
                        ? FLAT_SAVORY_ADDONS
                        : FLAT_SWEET_ADDONS)).map((addon, addonIdx) => {
                      const isSelected = cartItemEditAddons.some((a) => a.id === addon.id);
                      return (
                        <TouchableOpacity
                          key={addon.id}
                          onPress={() => toggleAddonInEdit(addon)}
                          activeOpacity={0.8}
                          style={[
                            styles.addonRowCard,
                            isSelected && styles.addonRowCardSelected,
                          ]}
                        >
                          <View style={styles.addonRowLeft}>
                            <View
                              style={[
                                styles.addonCheckbox,
                                isSelected && styles.addonCheckboxSelected,
                              ]}
                            >
                              {isSelected && (
                                <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                              )}
                            </View>
                            <View style={styles.addonTextGroup}>
                              <Text
                                style={[
                                  styles.addonRowTitle,
                                  isSelected && styles.addonRowTitleSelected,
                                ]}
                              >
                                {addonIdx + 1}. {addon.name}
                              </Text>
                              <Text style={styles.addonRowDescription}>
                                {addon.description}
                              </Text>
                            </View>
                          </View>
                          <View
                            style={[
                              styles.addonPriceBadge,
                              isSelected && styles.addonPriceBadgeSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.addonPriceText,
                                isSelected && styles.addonPriceTextSelected,
                              ]}
                            >
                              +{formatRupiah(addon.price)}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              <TextField
                label="Catatan Khusus"
                value={cartItemNoteText}
                onChangeText={setCartItemNoteText}
                placeholder="Contoh: Pisahkan saus, tanpa bawang, buat lebih garing..."
              />

              <Button intent="primary" onPress={handleSaveItemEdit}>
                Simpan Perubahan
              </Button>
            </View>
          </ScrollView>
        )}
      </Dialog>

      {/* 8. APPLY VOUCHER OR PROMO MODAL (WITH PROMO LIST & INPUT) */}
      <Dialog
        isOpen={promoModalOpen}
        onClose={() => setPromoModalOpen(false)}
        title="Apply Voucher or Promo"
        maxWidth={460}
      >
        <ScrollView style={{ maxHeight: 440 }} showsVerticalScrollIndicator={false}>
          <View style={{ gap: 14, paddingTop: 4 }}>
            {/* Input Promo Code */}
            <View style={styles.promoInputRow}>
              <View style={{ flex: 1 }}>
                <TextField
                  value={promoCodeInput}
                  onChangeText={(val) => {
                    setPromoCodeInput(val);
                    setPromoError('');
                  }}
                  placeholder="Ketik kode promo (e.g. SWEET10)"
                  size="sm"
                />
              </View>
              <Button
                intent="primary"
                size="sm"
                onPress={handleApplyCustomPromoCode}
                style={styles.applyCodeBtn}
              >
                Terapkan
              </Button>
            </View>

            {promoError ? (
              <Text style={styles.promoErrorText}>{promoError}</Text>
            ) : null}

            {/* List Promos Section */}
            <View style={styles.promoListContainer}>
              <Text style={styles.promoListHeading}>Promo & Voucher Tersedia</Text>
              
              <View style={{ gap: 10 }}>
                {PROMOS.map((promo) => {
                  const isEligible = subtotal >= promo.minPurchase;
                  const isCurrentlyApplied = appliedPromo?.code === promo.code;

                  return (
                    <View
                      key={promo.code}
                      style={[
                        styles.promoCardItem,
                        isCurrentlyApplied && styles.promoCardItemActive,
                      ]}
                    >
                      <View style={styles.promoCardLeft}>
                        <View style={styles.promoCardTopRow}>
                          <Badge intent="blue" size="sm" shape="rounded">
                            {promo.code}
                          </Badge>
                          <Text style={styles.promoCardTitle}>{promo.title}</Text>
                        </View>
                        <Text style={styles.promoCardDesc}>{promo.description}</Text>
                        <Text style={styles.promoMinText}>
                          Min. belanja: {formatRupiah(promo.minPurchase)}
                        </Text>
                      </View>

                      <View style={styles.promoCardRight}>
                        <Button
                          intent={isCurrentlyApplied ? 'outline' : 'primary'}
                          size="sm"
                          shape="pill"
                          disabled={!isEligible && !isCurrentlyApplied}
                          onPress={() => {
                            if (isCurrentlyApplied) {
                              setAppliedPromo(null);
                            } else {
                              handleApplyPromo(promo);
                            }
                          }}
                        >
                          {isCurrentlyApplied ? 'Dilepas' : 'Gunakan'}
                        </Button>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>
      </Dialog>

      {/* 9. PAYMENT METHOD SELECTOR MODAL */}
      <Dialog
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Select Payment Method"
        maxWidth={360}
      >
        <View style={{ gap: 10, paddingTop: 10 }}>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.value}
              onPress={() => {
                setPaymentMethod(method.value);
                setPaymentModalOpen(false);
              }}
              style={[
                styles.paymentOptionItem,
                paymentMethod === method.value && styles.paymentOptionActive,
              ]}
            >
              <Text
                style={[
                  styles.paymentOptionText,
                  paymentMethod === method.value && styles.paymentOptionTextActive,
                ]}
              >
                {method.label}
              </Text>
              {paymentMethod === method.value && (
                <Ionicons name="checkmark-circle" size={18} color="#2563EB" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Dialog>

      {/* 10. ORDER SUCCESS MODAL */}
      <Dialog
        isOpen={orderSuccessModalOpen}
        onClose={() => setOrderSuccessModalOpen(false)}
        maxWidth={420}
        showCloseButton={false}
      >
        <View style={styles.orderSuccessBody}>
          <View style={styles.successCheckCircle}>
            <Ionicons name="checkmark" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.successTitle}>Pesanan Berhasil Dibuat!</Text>
          <Text style={styles.successSub}>
            Order {lastPlacedOrder?.orderNumber} ({lastPlacedOrder?.table}) masuk ke antrean Track Order kitchen.
          </Text>

          <View style={styles.successReceiptCard}>
            <View style={styles.receiptLine}>
              <Text style={styles.receiptLineLabel}>Customer</Text>
              <Text style={styles.receiptLineVal}>{lastPlacedOrder?.customerName}</Text>
            </View>
            <View style={styles.receiptLine}>
              <Text style={styles.receiptLineLabel}>Meja & Tipe</Text>
              <Text style={styles.receiptLineVal}>
                {lastPlacedOrder?.table} ({lastPlacedOrder?.orderType})
              </Text>
            </View>
            <View style={styles.receiptLine}>
              <Text style={styles.receiptLineLabel}>Metode Pembayaran</Text>
              <Text style={styles.receiptLineVal}>{lastPlacedOrder?.paymentMethod}</Text>
            </View>
            <View style={styles.receiptDivider} />
            <View style={styles.receiptLine}>
              <Text style={styles.receiptTotalLabel}>Total Bayar</Text>
              <Text style={styles.receiptTotalVal}>
                {lastPlacedOrder ? formatRupiah(lastPlacedOrder.total) : 'Rp 0'}
              </Text>
            </View>
          </View>

          <View style={styles.successBtnGroup}>
            <Button
              intent="primary"
              size="lg"
              shape="rounded"
              onPress={handleFinishOrder}
              style={{ flex: 1 }}
            >
              Order Baru
            </Button>
          </View>
        </View>
      </Dialog>

      {/* 11. TRACK ORDER DETAIL MODAL */}
      <Dialog
        isOpen={trackOrderDetailModalOpen}
        onClose={() => setTrackOrderDetailModalOpen(false)}
        title={selectedTrackOrder ? `Tiket Pesanan Dapur • ${selectedTrackOrder.orderNumber}` : 'Detail Tiket Dapur'}
        maxWidth={460}
      >
        {selectedTrackOrder && (
          <View style={styles.trackOrderDetailWrapper}>
            {/* Header info */}
            <View style={styles.todHeaderCard}>
              <View style={styles.todHeaderTop}>
                <View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.todCustomerName}>{selectedTrackOrder.customerName}</Text>
                    <Badge
                      intent={
                        selectedTrackOrder.status === 'On Kitchen Hand'
                          ? 'amber'
                          : selectedTrackOrder.status === 'To be Served'
                          ? 'blue'
                          : 'mint'
                      }
                      size="sm"
                      shape="pill"
                    >
                      {selectedTrackOrder.status === 'On Kitchen Hand'
                        ? 'Sedang Dimasak'
                        : selectedTrackOrder.status === 'To be Served'
                        ? 'Siap Disajikan'
                        : 'Selesai'}
                    </Badge>
                  </View>
                  <Text style={styles.todOrderNum}>
                    {selectedTrackOrder.orderNumber} • Meja {selectedTrackOrder.table.replace('Table', '').trim()}
                  </Text>
                </View>
                <View style={styles.todTimeBadge}>
                  <Ionicons name="time-outline" size={13} color="#64748B" />
                  <Text style={styles.todTimeText}>{selectedTrackOrder.time}</Text>
                </View>
              </View>

              {/* Clean, monochrome metadata chips (no rainbow icons) */}
              <View style={styles.todMetaRow}>
                <View style={styles.todMetaItem}>
                  <Ionicons name="restaurant-outline" size={13} color="#64748B" />
                  <Text style={styles.todMetaText}>{selectedTrackOrder.table}</Text>
                </View>
                <View style={styles.todMetaDivider} />
                <View style={styles.todMetaItem}>
                  <Ionicons name="storefront-outline" size={13} color="#64748B" />
                  <Text style={styles.todMetaText}>{selectedTrackOrder.orderType}</Text>
                </View>
                <View style={styles.todMetaDivider} />
                <View style={styles.todMetaItem}>
                  <Ionicons name="receipt-outline" size={13} color="#64748B" />
                  <Text style={styles.todMetaText}>{selectedTrackOrder.totalItems} Items</Text>
                </View>
              </View>
            </View>

            {/* List of items with real prices */}
            <View style={styles.todItemsSection}>
              <View style={styles.todSectionHeaderRow}>
                <Text style={styles.todSectionTitle}>Daftar Menu Pesanan</Text>
                <Text style={styles.todSectionCount}>{selectedTrackOrder.items.length} Menu</Text>
              </View>
              <ScrollView style={{ maxHeight: 210 }} showsVerticalScrollIndicator={false}>
                <View style={{ gap: 8 }}>
                  {selectedTrackOrder.items.map((item, idx) => {
                    const itemPrice = item.price || 35000;
                    const subtotal = itemPrice * item.qty;
                    return (
                      <View key={idx} style={styles.todItemRow}>
                        <View style={styles.todItemLeft}>
                          <View style={styles.todQtyBadge}>
                            <Text style={styles.todQtyText}>{item.qty}x</Text>
                          </View>
                          <View>
                            <Text style={styles.todItemName}>{item.name}</Text>
                            <Text style={styles.todItemUnitHint}>
                              {formatRupiah(itemPrice)} / porsi
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.todItemPrice}>{formatRupiah(subtotal)}</Text>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>

              <View style={styles.todOrderSummaryRow}>
                <Text style={styles.todSummaryLabel}>Total Nilai Pesanan</Text>
                <Text style={styles.todSummaryValue}>
                  {formatRupiah(
                    selectedTrackOrder.items.reduce(
                      (sum, i) => sum + (i.price || 35000) * i.qty,
                      0
                    )
                  )}
                </Text>
              </View>
            </View>

            {/* Kitchen Progression Timeline (Professional KDS status) */}
            <View style={styles.todStatusSection}>
              <Text style={styles.todSectionTitle}>Status Alur Dapur (KDS)</Text>
              <View style={styles.kdsStatusProgress}>
                <View
                  style={[
                    styles.kdsStep,
                    (selectedTrackOrder.status === 'On Kitchen Hand' ||
                      selectedTrackOrder.status === 'To be Served' ||
                      selectedTrackOrder.status === 'All Done') &&
                      styles.kdsStepDone,
                    selectedTrackOrder.status === 'On Kitchen Hand' && styles.kdsStepCurrent,
                  ]}
                >
                  <Ionicons
                    name={
                      selectedTrackOrder.status === 'To be Served' || selectedTrackOrder.status === 'All Done'
                        ? 'checkmark-circle'
                        : 'flame'
                    }
                    size={13}
                    color={
                      selectedTrackOrder.status === 'On Kitchen Hand'
                        ? '#D97706'
                        : selectedTrackOrder.status === 'To be Served' || selectedTrackOrder.status === 'All Done'
                        ? '#059669'
                        : '#94A3B8'
                    }
                  />
                  <Text
                    style={[
                      styles.kdsStepText,
                      selectedTrackOrder.status === 'On Kitchen Hand' && styles.kdsStepTextCurrent,
                    ]}
                  >
                    1. Dimasak
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={13} color="#CBD5E1" />

                <View
                  style={[
                    styles.kdsStep,
                    (selectedTrackOrder.status === 'To be Served' ||
                      selectedTrackOrder.status === 'All Done') &&
                      styles.kdsStepDone,
                    selectedTrackOrder.status === 'To be Served' && styles.kdsStepCurrent,
                  ]}
                >
                  <Ionicons
                    name={
                      selectedTrackOrder.status === 'All Done' ? 'checkmark-circle' : 'restaurant'
                    }
                    size={13}
                    color={
                      selectedTrackOrder.status === 'To be Served'
                        ? '#2563EB'
                        : selectedTrackOrder.status === 'All Done'
                        ? '#059669'
                        : '#94A3B8'
                    }
                  />
                  <Text
                    style={[
                      styles.kdsStepText,
                      selectedTrackOrder.status === 'To be Served' && styles.kdsStepTextCurrent,
                    ]}
                  >
                    2. Siap Saji
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={13} color="#CBD5E1" />

                <View
                  style={[
                    styles.kdsStep,
                    selectedTrackOrder.status === 'All Done' && styles.kdsStepDone,
                    selectedTrackOrder.status === 'All Done' && styles.kdsStepCurrent,
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={13}
                    color={selectedTrackOrder.status === 'All Done' ? '#059669' : '#94A3B8'}
                  />
                  <Text
                    style={[
                      styles.kdsStepText,
                      selectedTrackOrder.status === 'All Done' && styles.kdsStepTextCurrent,
                    ]}
                  >
                    3. Selesai
                  </Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.todActionsRow}>
              {selectedTrackOrder.status !== 'All Done' ? (
                <Button
                  intent="primary"
                  size="md"
                  shape="rounded"
                  onPress={() => handleAdvanceOrderStatus(selectedTrackOrder.id)}
                  style={{ flex: 1 }}
                  textStyle={{ color: '#FFFFFF', fontWeight: '700' }}
                >
                  {selectedTrackOrder.status === 'On Kitchen Hand'
                    ? 'Tandai Siap Saji ➔'
                    : 'Selesaikan Pesanan ✓'}
                </Button>
              ) : (
                <View style={styles.todCompletedBanner}>
                  <Ionicons name="checkmark-circle" size={18} color="#059669" />
                  <Text style={styles.todCompletedText}>Pesanan telah selesai & disajikan!</Text>
                </View>
              )}
              <Button
                intent="outline"
                size="md"
                shape="rounded"
                onPress={() => setTrackOrderDetailModalOpen(false)}
              >
                Tutup
              </Button>
            </View>
          </View>
        )}
      </Dialog>

      {/* 12. MOBILE CART BOTTOM SHEET (100% RESPONSIVE & STICKY CTA) */}
      {isMobile && (
        <Modal
          visible={mobileCartOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setMobileCartOpen(false)}
        >
          <View style={styles.mobileSheetOverlay}>
            <TouchableOpacity
              style={styles.mobileSheetBackdrop}
              activeOpacity={1}
              onPress={() => setMobileCartOpen(false)}
            />
            <View style={styles.mobileCartSheetContainer}>
              {/* Sheet Drag Handle */}
              <View style={styles.sheetDragHandleRow}>
                <View style={styles.sheetDragHandle} />
              </View>

              {/* Sheet Header */}
              <View style={styles.mobileSheetHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.mobileSheetTitle}>Pesanan Saat Ini</Text>
                  <Badge intent="blue" size="sm" shape="pill">
                    {orderNumber}
                  </Badge>
                </View>
                <TouchableOpacity
                  onPress={() => setMobileCartOpen(false)}
                  style={styles.mobileSheetCloseBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Scrollable Middle Content */}
              <ScrollView
                style={styles.mobileCartScroll}
                contentContainerStyle={styles.mobileCartScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Customer name bar */}
                <View style={styles.mobileCustomerRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={styles.receiptIconBoxSmall}>
                      <Ionicons name="person-outline" size={15} color="#2563EB" />
                    </View>
                    <View>
                      <Text style={styles.mobileCustomerName}>{customerName}</Text>
                      <Text style={styles.mobileOrderSub}>Nomor Order: {orderNumber}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setTempCustomerName(customerName);
                      setIsEditingCustomer(true);
                    }}
                    style={styles.mobileEditCustBtn}
                  >
                    <Ionicons name="pencil-outline" size={14} color="#2563EB" />
                    <Text style={styles.mobileEditCustText}>Ubah</Text>
                  </TouchableOpacity>
                </View>

                {/* Table & Order Type Selectors */}
                <View style={styles.selectRow}>
                  <View style={styles.selectCol}>
                    <Select
                      value={selectedTable}
                      onChange={(val) => setSelectedTable(val)}
                      options={tableOptions}
                      placeholder="Pilih Meja"
                      label="Pilih Meja (Dine In)"
                      shape="pill"
                      size="md"
                    />
                  </View>
                  <View style={styles.selectCol}>
                    <Select
                      value={selectedOrderType}
                      onChange={(val) => setSelectedOrderType(val)}
                      options={ORDER_TYPES}
                      placeholder="Order Type"
                      shape="pill"
                      size="md"
                    />
                  </View>
                </View>

                {/* Cart Items List */}
                <View style={styles.mobileCartItemsList}>
                  {cartItems.length === 0 ? (
                    <View style={styles.emptyCartContainer}>
                      <View style={styles.emptyCartIconCircle}>
                        <Ionicons name="bag-handle-outline" size={24} color="#2563EB" />
                      </View>
                      <Text style={styles.emptyCartText}>Belum Ada Menu Dipilih</Text>
                      <Text style={styles.emptyCartSub}>
                        Pilih menu bakery di katalog untuk menambah pesanan
                      </Text>
                    </View>
                  ) : (
                    cartItems.map((item) => {
                      const unitPrice = getItemUnitPrice(item);
                      const hasAddons = item.addons && item.addons.length > 0;
                      return (
                        <View key={item.id} style={styles.cartItemRow}>
                          <Image
                            source={{ uri: item.product.image }}
                            style={styles.cartItemThumb}
                          />
                          <View style={styles.cartItemDetails}>
                            <Text style={styles.cartItemName} numberOfLines={1}>
                              {item.product.name}
                            </Text>
                            <Text style={styles.cartItemPrice}>
                              {formatRupiah(unitPrice)}
                            </Text>
                            {hasAddons && (
                              <View style={styles.cartAddonsRow}>
                                {item.addons!.map((addon) => (
                                  <Text key={addon.id} style={styles.cartAddonTag}>
                                    {addon.name}
                                  </Text>
                                ))}
                              </View>
                            )}
                            {item.note ? (
                              <Text style={styles.cartItemNoteBadge} numberOfLines={1}>
                                Note: {item.note}
                              </Text>
                            ) : null}
                          </View>

                          <TouchableOpacity
                            onPress={() => openCartItemEdit(item)}
                            style={styles.editItemBtn}
                          >
                            <Ionicons name="create-outline" size={15} color="#475569" />
                          </TouchableOpacity>

                          <Stepper
                            value={item.quantity}
                            min={1}
                            max={99}
                            onChange={(val) => updateCartQuantity(item.id, val)}
                            size="sm"
                            style={styles.cartStepper}
                          />

                          <TouchableOpacity
                            onPress={() => removeCartItem(item.id)}
                            style={styles.deleteItemBtn}
                          >
                            <Ionicons name="trash-outline" size={14} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      );
                    })
                  )}
                </View>

                {/* Calculation Breakdown */}
                <View style={styles.summarySection}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>{formatRupiah(subtotal)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tax (10%)</Text>
                    <Text style={styles.summaryValue}>{formatRupiah(tax)}</Text>
                  </View>
                  {appliedPromo && discount > 0 && (
                    <View style={styles.summaryRow}>
                      <Text style={styles.discountLabel}>Discount ({appliedPromo.code})</Text>
                      <Text style={styles.discountValue}>-{formatRupiah(discount)}</Text>
                    </View>
                  )}
                  <View style={styles.dashedDivider} />
                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>TOTAL</Text>
                    <Text style={styles.totalValue}>{formatRupiah(total)}</Text>
                  </View>

                  {/* Promo & Payment */}
                  <View style={styles.paymentActionRow}>
                    {appliedPromo ? (
                      <TouchableOpacity
                        onPress={() => setAppliedPromo(null)}
                        style={styles.promoAppliedPill}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.promoAppliedText} numberOfLines={1}>
                          {appliedPromo.code} (-{formatRupiah(discount)})
                        </Text>
                        <View style={styles.promoCheckCircle}>
                          <Ionicons name="close" size={12} color="#FFFFFF" />
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          setPromoError('');
                          setPromoModalOpen(true);
                        }}
                        style={styles.addPromoPill}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.addPromoText}>Apply Voucher / Promo</Text>
                        <Ionicons name="pricetag-outline" size={14} color="#64748B" />
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={() => setPaymentModalOpen(true)}
                      style={styles.paymentMethodPill}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.paymentMethodText}>{paymentMethod}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              {/* STICKY BOTTOM CHECKOUT BUTTON (NEVER CUT OFF!) */}
              <View style={styles.mobileStickyBottomCta}>
                <Button
                  intent="primary"
                  size="lg"
                  shape="rounded"
                  onPress={handlePlaceOrder}
                  disabled={cartItems.length === 0}
                  style={{ width: '100%' }}
                  textStyle={{ color: '#FFFFFF', fontWeight: '700' }}
                >
                  {cartItems.length === 0
                    ? 'Pilih Menu Dulu'
                    : `Place Order (${formatRupiah(total)})`}
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* 13. MOBILE KITCHEN ORDERS BOTTOM SHEET */}
      {isMobile && (
        <Modal
          visible={mobileKitchenSheetOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setMobileKitchenSheetOpen(false)}
        >
          <View style={styles.mobileSheetOverlay}>
            <TouchableOpacity
              style={styles.mobileSheetBackdrop}
              activeOpacity={1}
              onPress={() => setMobileKitchenSheetOpen(false)}
            />
            <View style={styles.mobileKitchenSheetContainer}>
              <View style={styles.sheetDragHandleRow}>
                <View style={styles.sheetDragHandle} />
              </View>

              <View style={styles.mobileSheetHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="flame" size={18} color="#EA580C" />
                  <Text style={styles.mobileSheetTitle}>Pesanan Dapur Aktif</Text>
                  <Badge intent="amber" size="sm" shape="pill">
                    {kitchenOrders.length}
                  </Badge>
                </View>
                <TouchableOpacity
                  onPress={() => setMobileKitchenSheetOpen(false)}
                  style={styles.mobileSheetCloseBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={18} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.mobileKitchenScroll}
                contentContainerStyle={styles.mobileKitchenScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={{ gap: 10 }}>
                  {kitchenOrders.map((order) => (
                    <TouchableOpacity
                      key={order.id}
                      onPress={() => {
                        setMobileKitchenSheetOpen(false);
                        handleOpenTrackOrderDetail(order);
                      }}
                      activeOpacity={0.8}
                      style={styles.mobileKitchenCard}
                    >
                      <View style={styles.mobileKitchenCardTop}>
                        <View>
                          <Text style={styles.mobileKitchenCustName}>
                            {order.customerName}
                          </Text>
                          <Text style={styles.mobileKitchenOrderNum}>
                            {order.orderNumber} • {order.table} • {order.orderType}
                          </Text>
                        </View>
                        <Badge intent={order.statusColor} size="sm" shape="pill">
                          {order.status === 'On Kitchen Hand'
                            ? 'Sedang Dimasak'
                            : order.status === 'To be Served'
                            ? 'Siap Saji'
                            : 'Selesai'}
                        </Badge>
                      </View>

                      <View style={styles.mobileKitchenCardDivider} />

                      <View style={styles.mobileKitchenItemsList}>
                        {order.items.map((item, idx) => (
                          <Text key={idx} style={styles.mobileKitchenItemLine} numberOfLines={1}>
                            {item.qty}x  {item.name}
                          </Text>
                        ))}
                      </View>

                      <View style={styles.mobileKitchenCardFooter}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Ionicons name="time-outline" size={12} color="#64748B" />
                          <Text style={styles.mobileKitchenTimeText}>{order.time}</Text>
                        </View>
                        <Text style={styles.mobileKitchenDetailHint}>Lihat Tiket Dapur ➔</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // 1. TOP HEADER
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  topHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer', transition: 'all 0.15s ease' } as any,
    }),
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  datePillSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  datePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  datePillDivider: {
    color: '#94A3B8',
    marginHorizontal: 4,
    fontWeight: '600',
  },
  topHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    ...Platform.select({
      web: { cursor: 'pointer', transition: 'all 0.15s ease' } as any,
    }),
  },
  statusPillOpen: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusPillClose: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 8,
  },
  statusDotOpen: {
    backgroundColor: '#10B981',
  },
  statusDotClose: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusTextOpen: {
    color: '#065F46',
  },
  statusTextClose: {
    color: '#991B1B',
  },
  powerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer', transition: 'all 0.15s ease' } as any,
    }),
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breadcrumbTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  breadcrumbDivider: {
    fontSize: 16,
    color: '#94A3B8',
  },
  breadcrumbSub: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },

  // 2. MAIN LAYOUT
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    minHeight: 0,
  },
  productsSection: {
    flex: 1,
    position: 'relative',
    minHeight: 0,
  },
  productsScroll: {
    padding: 18,
    paddingBottom: 130,
  },

  // CATEGORY PILLS (TEXT ONLY, NO ICONS!)
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 9999,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
      } as any,
    }),
  },
  categoryPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
      } as any,
    }),
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  categoryCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  categoryCountBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  categoryCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryCountTextActive: {
    color: '#FFFFFF',
  },

  // SEARCH BAR
  searchContainer: {
    marginBottom: 16,
  },

  // PRODUCT GRID: 100% IDENTICAL DIMENSIONS ACROSS ALL ROWS & COLUMNS
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    width: '100%',
    ...Platform.select({
      web: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, 172px)',
        gap: '14px',
      } as any,
    }),
  },
  productCard: {
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    height: 220,
    minHeight: 220,
    maxHeight: 220,
    flexGrow: 1,
    flexShrink: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    padding: 12,
    flexDirection: 'column',
    justifyContent: 'space-between',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
      } as any,
    }),
  },
  productImageContainer: {
    width: '100%',
    height: 116,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
    marginBottom: 8,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    height: 20,
    lineHeight: 20,
  },
  productMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 24,
    marginTop: 4,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },

  // BOTTOM DOCKED TRACK ORDER TRAY
  trackOrderTrayContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 5,
  },
  trackOrderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 6,
  },
  trackOrderToggleBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 9999,
  },
  trackOrderToggleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  trackOrderCardsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 2,
  },
  kitchenOrderCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 10,
    width: 200,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
      } as any,
    }),
  },
  kitchenCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  kitchenCustomerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  kitchenCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kitchenTableText: {
    fontSize: 11,
    color: '#64748B',
  },
  kitchenTimeText: {
    fontSize: 11,
    color: '#94A3B8',
  },

  // 3. RIGHT SECTION (CART PANEL)
  cartSection: {
    width: 380,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderLeftColor: '#F1F5F9',
  },
  cartContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: 16,
  },
  cartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cartHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  receiptIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  blueDotBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#2563EB',
  },
  customerNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  orderNumberText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  editCustomerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: { cursor: 'pointer', transition: 'all 0.15s ease' } as any,
    }),
  },
  selectRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 10,
  },
  selectCol: {
    flex: 1,
  },
  cartListContainer: {
    flex: 1,
    minHeight: 180,
  },
  emptyCartContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
  },
  emptyCartIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyCartText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '700',
  },
  emptyCartSub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 220,
  },
  cartScrollContent: {
    paddingVertical: 4,
    gap: 10,
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  cartItemThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  cartItemDetails: {
    flex: 1,
    marginRight: 6,
  },
  cartItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  cartItemPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 1,
  },
  cartAddonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 3,
  },
  cartAddonTag: {
    fontSize: 10,
    color: '#0D9488',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    fontWeight: '600',
  },
  cartItemNoteBadge: {
    fontSize: 10,
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 3,
    alignSelf: 'flex-start',
  },
  noteBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  noteBtnInactive: {
    backgroundColor: '#F1F5F9',
  },
  noteBtnActive: {
    backgroundColor: '#2563EB',
  },
  cartStepper: {},
  deleteItemBtn: {
    padding: 6,
    marginLeft: 4,
  },

  // SCALLOP DECORATION
  scallopContainer: {
    marginVertical: 8,
  },
  scallopLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },

  // SUMMARY SECTION
  summarySection: {
    paddingTop: 2,
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  discountLabel: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  discountValue: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '700',
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginVertical: 3,
  },
  totalRow: {
    paddingVertical: 2,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },

  // PAYMENT ACTION ROW
  paymentActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  promoAppliedPill: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
    borderWidth: 1.5,
    borderRadius: 9999,
    paddingHorizontal: 12,
    height: 40,
  },
  promoAppliedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    flex: 1,
  },
  promoCheckCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  addPromoPill: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1.5,
    borderRadius: 9999,
    paddingHorizontal: 12,
    height: 40,
  },
  addPromoText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  paymentMethodPill: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    borderRadius: 9999,
    height: 40,
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  placeOrderBtn: {
    width: '100%',
    height: 46,
    borderRadius: 14,
  },

  // UNIFIED MOBILE BOTTOM BAR
  mobileBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 10,
  },
  mobileKitchenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    borderRadius: 14,
    paddingVertical: 7,
    paddingHorizontal: 10,
    ...Platform.select({
      web: { cursor: 'pointer', transition: 'all 0.15s ease' } as any,
    }),
  },
  mobileKitchenIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileKitchenTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#C2410C',
  },
  mobileKitchenSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#EA580C',
  },
  mobileCartBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    ...Platform.select({
      web: { cursor: 'pointer', transition: 'all 0.15s ease' } as any,
    }),
  },
  mobileCartBtnActive: {
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  mobileCartBtnEmpty: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  mobileCartIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileCartIconBoxActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  mobileCartBtnCount: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  mobileCartBtnPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  mobileCartArrowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  mobileCartArrowPillActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  mobileCartArrowText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },

  // MOBILE BOTTOM SHEET OVERLAYS & CONTAINERS
  mobileSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
    ...Platform.select({
      web: { backdropFilter: 'blur(4px)' } as any,
    }),
  },
  mobileSheetBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mobileCartSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    height: '90%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  sheetDragHandleRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  sheetDragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  mobileSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  mobileSheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  mobileSheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer' } as any,
    }),
  },
  mobileCartScroll: {
    flex: 1,
  },
  mobileCartScrollContent: {
    padding: 16,
    gap: 12,
  },
  mobileCustomerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  receiptIconBoxSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileCustomerName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  mobileOrderSub: {
    fontSize: 11,
    color: '#64748B',
  },
  mobileEditCustBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    ...Platform.select({
      web: { cursor: 'pointer' } as any,
    }),
  },
  mobileEditCustText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2563EB',
  },
  mobileCartItemsList: {
    gap: 8,
    minHeight: 120,
  },
  mobileStickyBottomCta: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },

  // MOBILE KITCHEN SHEET
  mobileKitchenSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    height: '80%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  mobileKitchenScroll: {
    flex: 1,
  },
  mobileKitchenScrollContent: {
    padding: 16,
  },
  mobileKitchenCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 8,
    ...Platform.select({
      web: { cursor: 'pointer', transition: 'all 0.15s ease' } as any,
    }),
  },
  mobileKitchenCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mobileKitchenCustName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  mobileKitchenOrderNum: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  mobileKitchenCardDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  mobileKitchenItemsList: {
    gap: 3,
  },
  mobileKitchenItemLine: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
  },
  mobileKitchenCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  mobileKitchenTimeText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  mobileKitchenDetailHint: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },

  // 4. ACTIVITY VIEW LAYOUT
  activityLayout: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
  },
  activitySidebar: {
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#F1F5F9',
    padding: 16,
    justifyContent: 'space-between',
  },
  activitySearchBox: {
    marginBottom: 14,
  },
  activityNavMenu: {
    gap: 6,
  },
  activityNavItem: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    ...Platform.select({
      web: { cursor: 'pointer' } as any,
    }),
  },
  activityNavItemActive: {
    backgroundColor: '#2563EB',
  },
  activityNavText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  activityNavTextActive: {
    color: '#FFFFFF',
  },
  activityBrandFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 6,
  },
  brandTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  brandSubtitle: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  brandFooterLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  brandCopyright: {
    fontSize: 10,
    color: '#94A3B8',
  },
  brandLink: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  activityMainContent: {
    flex: 1,
    padding: 18,
  },
  queueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  queueHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircleBtnSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleBtnSmallActive: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueListScroll: {
    gap: 10,
    paddingBottom: 40,
  },
  queueItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 14,
  },
  queueItemLeft: {
    gap: 2,
  },
  queueItemCustomer: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  queueItemSub: {
    fontSize: 11,
    color: '#64748B',
  },
  queueItemTable: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  queueItemDate: {
    fontSize: 10,
    color: '#94A3B8',
  },
  queueItemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  queueItemPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },

  // ACTIVITY TRACK ORDER
  activityTrackOrderSection: {
    marginTop: 20,
  },
  activityTrackOrderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  trackOrderSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  trackOrderControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityTrackCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  activityTrackCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    width: 210,
  },
  trackCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  trackCardName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  trackCardSub: {
    fontSize: 11,
    color: '#64748B',
  },
  trackCardTime: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 6,
  },
  trackCardDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginVertical: 4,
  },
  trackCardItemsList: {
    gap: 2,
    marginBottom: 6,
  },
  trackCardItemLine: {
    fontSize: 11,
    color: '#475569',
  },
  seeMoreBtn: {
    marginBottom: 8,
  },
  seeMoreText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
  },
  trackCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  trackTotalLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  trackTotalVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },

  // 5. DETAIL MENU MODAL (POLISHED & SPACIOUS)
  detailDialogWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  detailModalScroll: {
    flex: 1,
    minHeight: 0,
  },
  detailModalBody: {
    gap: 12,
    paddingBottom: 14,
  },
  detailImageContainer: {
    width: '100%',
    height: 150,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  detailProductImage: {
    width: '100%',
    height: '100%',
  },
  detailInfoContainer: {
    gap: 6,
  },
  detailTopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailPriceTag: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
  },
  detailTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  detailDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  detailSectionDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },

  // ALL ADDON GROUPS WRAPPER
  allAddonGroupsWrapper: {
    gap: 14,
  },
  addonGroupContainer: {
    gap: 8,
  },
  addonGroupHeader: {
    gap: 4,
    paddingBottom: 2,
  },
  addonGroupTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addonGroupMainTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.3,
  },
  addonGroupSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
  },
  addonsVerticalList: {
    gap: 8,
  },
  addonRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 14,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
      } as any,
    }),
  },
  addonRowCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.12)',
      } as any,
    }),
  },
  addonRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  addonCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  addonCheckboxSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  addonTextGroup: {
    flex: 1,
    gap: 2,
  },
  addonRowTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  addonRowTitleSelected: {
    color: '#1D4ED8',
  },
  addonRowDescription: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 15,
  },
  addonPriceBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addonPriceBadgeSelected: {
    backgroundColor: '#DBEAFE',
  },
  addonPriceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  addonPriceTextSelected: {
    color: '#1D4ED8',
    fontWeight: '800',
  },

  detailNotesContainer: {
    gap: 6,
  },
  detailNotesLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
  },
  detailFooterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  detailFooterLeft: {
    justifyContent: 'center',
  },
  detailAddToCartBtn: {
    flex: 1,
  },

  // 6. DRAWER STYLES
  drawerInner: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  drawerUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  drawerUserAvatarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  drawerUserAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  cashierNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  drawerUserName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  drawerUserRole: {
    fontSize: 12,
    color: '#64748B',
  },
  drawerCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerNavList: {
    flex: 1,
    paddingVertical: 18,
    gap: 6,
  },
  drawerNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 12,
    ...Platform.select({
      web: { cursor: 'pointer', transition: 'all 0.15s ease' } as any,
    }),
  },
  drawerNavItemActive: {
    backgroundColor: '#EFF6FF',
  },
  drawerNavIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerNavIconBoxActive: {
    backgroundColor: '#2563EB',
  },
  drawerNavText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  drawerNavTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  drawerFooter: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  drawerLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 9999,
  },
  drawerLogoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  logoutIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // PROMO MODAL STYLES
  promoInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  applyCodeBtn: {
    height: 38,
    paddingHorizontal: 14,
  },
  promoErrorText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '500',
  },
  promoListContainer: {
    marginTop: 6,
    gap: 8,
  },
  promoListHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  promoCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
    ...Platform.select({
      web: {
        transition: 'all 0.15s ease',
      } as any,
    }),
  },
  promoCardItemActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  promoCardLeft: {
    flex: 1,
    marginRight: 10,
    gap: 3,
  },
  promoCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promoCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  promoCardDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  promoMinText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  promoCardRight: {
    alignItems: 'flex-end',
  },

  // PAYMENT MODAL OPTIONS
  paymentOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  paymentOptionActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  paymentOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  paymentOptionTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },

  // ORDER SUCCESS MODAL
  orderSuccessBody: {
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  successCheckCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  successTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  successSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
  },
  successReceiptCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 7,
    marginVertical: 6,
  },
  receiptLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  receiptLineLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  receiptLineVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 2,
  },
  receiptTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  receiptTotalVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2563EB',
  },
  successBtnGroup: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },

  // 12. TRACK ORDER DETAIL MODAL STYLES
  trackOrderDetailWrapper: {
    gap: 14,
    paddingTop: 4,
  },
  todHeaderCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 12,
  },
  todHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todCustomerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  todOrderNum: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },
  todTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  todTimeText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '600',
  },
  todMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  todMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  todMetaDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E2E8F0',
  },
  todMetaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  todItemsSection: {
    gap: 8,
  },
  todSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  todSectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  todItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  todItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  todQtyBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  todQtyText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  todItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  todItemUnitHint: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  todItemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  todOrderSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 2,
  },
  todSummaryLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  todSummaryValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  todStatusSection: {
    gap: 8,
  },
  // KDS Timeline styles
  kdsStatusProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kdsStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kdsStepDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  kdsStepCurrent: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  kdsStepText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  kdsStepTextCurrent: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  todActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 4,
  },
  todCompletedBanner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  todCompletedText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
});
