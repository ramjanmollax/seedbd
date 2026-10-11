import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingCart, Tag, Check, ShieldCheck, CheckCircle2, PackageCheck, Printer, Sparkles, Leaf, UserPlus } from 'lucide-react';
import { CartItem, OrderDetails, Coupon } from '../types';
import {
  subscribeToDeliverySettings,
  subscribeToShippingZones,
  subscribeToPaymentSettings,
  subscribeToCoupons,
  DeliverySettings,
  ShippingZone,
  PaymentSettings,
} from '../lib/firestoreProducts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, newQty: number) => void;
  onRemoveItem: (productId: string) => void;
  onPlaceOrder: (orderDetails: OrderDetails) => void;
  currentUser?: { name: string; phone: string } | null;
  onOpenAuth: () => void;
  loginEnabled?: boolean;
  onOpenMemo?: (order: OrderDetails) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  currentUser,
  onOpenAuth,
  loginEnabled = true,
  onOpenMemo,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const [appliedDiscountObj, setAppliedDiscountObj] = useState<{ amount: number; isPercent: boolean; code: string } | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Success Order State (Displayed inline inside the drawer - NO POPUPS!)
  const [successOrder, setSuccessOrder] = useState<OrderDetails | null>(null);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Delivery Settings & Zones from Firestore
  const [deliverySettings, setDeliverySettings] = useState<DeliverySettings>({
    insideCharge: 60,
    outsideCharge: 100,
    freeMinimum: 1000,
    deliveryChargeEnabled: true,
  });
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);

  // Payment Settings from Firestore
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    codEnabled: true,
    bkashEnabled: true,
    bkashNumber: '01410136900',
    bkashType: 'Personal',
    nagadEnabled: true,
    nagadNumber: '01410136900',
    nagadType: 'Personal',
    rocketEnabled: true,
    rocketNumber: '01410136900',
    rocketType: 'Personal',
    instruction: 'মোবাইল ব্যাংকিং (বিকাশ/নগদ/রকেট) বা ক্যাশ অন ডেলিভারি (COD) নির্বাচন করুন।',
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'rocket'>('cod');
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    const unsubDelivery = subscribeToDeliverySettings((settings) => {
      setDeliverySettings(settings);
    });
    const unsubZones = subscribeToShippingZones((zones) => {
      setShippingZones(zones);
    });
    const unsubPayment = subscribeToPaymentSettings((settings) => {
      setPaymentSettings(settings);
    });
    const unsubCoupons = subscribeToCoupons((coupons) => {
      setCouponsList(coupons || []);
    });
    return () => {
      unsubDelivery();
      unsubZones();
      unsubPayment();
      unsubCoupons();
    };
  }, []);

  // Ensure active payment method
  useEffect(() => {
    if (selectedPaymentMethod === 'cod' && !paymentSettings.codEnabled) {
      if (paymentSettings.bkashEnabled) setSelectedPaymentMethod('bkash');
      else if (paymentSettings.nagadEnabled) setSelectedPaymentMethod('nagad');
      else if (paymentSettings.rocketEnabled) setSelectedPaymentMethod('rocket');
    }
  }, [paymentSettings, selectedPaymentMethod]);

  // Delivery Location Choice
  const [deliveryLocation, setDeliveryLocation] = useState<'dhaka' | 'outside'>('dhaka');

  // Order Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [phone2, setPhone2] = useState('');
  const [district, setDistrict] = useState('ঢাকা');
  const [thana, setThana] = useState('');
  const [union, setUnion] = useState('');
  const [village, setVillage] = useState('');
  const [landmark, setLandmark] = useState('');
  const [formError, setFormError] = useState('');

  // Sync district with delivery location
  const handleDeliveryLocationChange = (location: 'dhaka' | 'outside') => {
    setDeliveryLocation(location);
    if (location === 'dhaka') {
      setDistrict('ঢাকা');
    } else if (district === 'ঢাকা') {
      setDistrict('চট্টগ্রাম');
    }
  };

  // Reset checkout form and successOrder when closed
  useEffect(() => {
    if (!isOpen) {
      setFormError('');
      const timer = setTimeout(() => {
        setSuccessOrder(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Auto-fill customerName and phone from currentUser if available
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name && !customerName) {
        setCustomerName(currentUser.name);
      }
      if (currentUser.phone && !phone) {
        setPhone(currentUser.phone);
      }
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const isDeliveryFeeActive = deliverySettings.deliveryChargeEnabled === true;
  const rawDeliveryFee = deliveryLocation === 'dhaka' ? deliverySettings.insideCharge : deliverySettings.outsideCharge;
  const isFreeDelivery = !isDeliveryFeeActive || (deliverySettings.freeMinimum > 0 && subtotal >= deliverySettings.freeMinimum);
  const deliveryFee = isFreeDelivery ? 0 : rawDeliveryFee;

  let discountAmount = 0;
  if (appliedDiscountObj) {
    if (appliedDiscountObj.isPercent) {
      discountAmount = Math.round((subtotal * appliedDiscountObj.amount) / 100);
    } else {
      discountAmount = appliedDiscountObj.amount;
    }
  }
  const total = Math.max(0, subtotal - discountAmount + (cartItems.length > 0 ? deliveryFee : 0));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = couponCode.trim().toUpperCase();
    if (!enteredCode) return;

    const foundCoupon = couponsList.find((c) => c.code === enteredCode);

    if (foundCoupon) {
      if (foundCoupon.active === false) {
        setCouponMsg({ text: 'এই কুপনটির মেয়াদ শেষ হয়ে গেছে।', isError: true });
        return;
      }
      if (foundCoupon.minimum && subtotal < foundCoupon.minimum) {
        setCouponMsg({ text: `সর্বনিম্ন ৳${foundCoupon.minimum} টাকার অর্ডার করতে হবে।`, isError: true });
        return;
      }
      if (foundCoupon.type === 'fixed') {
        setAppliedDiscountObj({ amount: foundCoupon.value, isPercent: false, code: foundCoupon.code });
        setCouponMsg({ text: `৳${foundCoupon.value} ডিসকাউন্ট সফলভাবে যুক্ত হয়েছে! 🎉`, isError: false });
      } else {
        setAppliedDiscountObj({ amount: foundCoupon.value, isPercent: true, code: foundCoupon.code });
        setCouponMsg({ text: `${foundCoupon.value}% ছাড় সফলভাবে যুক্ত হয়েছে! 🎉`, isError: false });
      }
    } else if (enteredCode === 'SEED10') {
      setAppliedDiscountObj({ amount: 10, isPercent: true, code: 'SEED10' });
      setCouponMsg({ text: '১০% ছাড় কুপন (SEED10) সফলভাবে যুক্ত হয়েছে! 🎉', isError: false });
    } else {
      setCouponMsg({ text: 'কুপন কোডটি সঠিক নয়।', isError: true });
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !phone.trim() || !district.trim() || !thana.trim() || !village.trim()) {
      setFormError('অনুগ্রহ করে নাম, মোবাইল নম্বর, জেলা, থানা এবং গ্রাম পূরণ করুন।');
      return;
    }

    if (phone.length < 11) {
      setFormError('সঠিক ১১ ডিজিটের প্রধান মোবাইল নম্বর দিন।');
      return;
    }

    if (selectedPaymentMethod !== 'cod') {
      if (!senderNumber.trim() || !transactionId.trim()) {
        const methodLabel = selectedPaymentMethod === 'bkash' ? 'বিকাশ' : selectedPaymentMethod === 'nagad' ? 'নগদ' : 'রকেট';
        setFormError(`আপনার ${methodLabel} নম্বর এবং Transaction ID প্রদান করুন।`);
        return;
      }
    }

    setFormError('');

    const combinedAddress = `গ্রাম: ${village}${union ? `, ইউনিয়ন: ${union}` : ''}, থানা: ${thana}, জেলা: ${district}${landmark ? `. ল্যান্ডমার্ক: ${landmark}` : ''}`;

    const newOrder: OrderDetails = {
      orderId: 'SHB-' + Math.floor(100000 + Math.random() * 900000),
      customerName,
      phone,
      phone2: phone2.trim() ? phone2 : undefined,
      address: combinedAddress,
      district,
      thana,
      union,
      village,
      landmark,
      items: cartItems,
      subtotal,
      discount: discountAmount,
      deliveryFee,
      total,
      paymentMethod: selectedPaymentMethod,
      senderNumber: selectedPaymentMethod !== 'cod' ? senderNumber : undefined,
      transactionId: selectedPaymentMethod !== 'cod' ? transactionId : undefined,
      createdAt: new Date().toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };

    onPlaceOrder(newOrder);
    setSuccessOrder(newOrder);
    setShowConfetti(true);
    setTimeout(() => {
      setShowConfetti(false);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn overflow-hidden">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 35 }).map((_, i) => {
            const randomLeft = Math.floor(Math.random() * 100);
            const randomDelay = (Math.random() * 1.5).toFixed(2);
            const randomDuration = (2 + Math.random() * 2).toFixed(2);
            const colors = ['bg-emerald-400', 'bg-amber-400', 'bg-green-500', 'bg-lime-400', 'bg-teal-400', 'bg-emerald-200'];
            const randomColor = colors[i % colors.length];
            return (
              <div
                key={i}
                className={`absolute w-2.5 h-2.5 rounded-full ${randomColor} animate-confetti-fall`}
                style={{
                  left: `${randomLeft}%`,
                  top: '-20px',
                  animationDelay: `${randomDelay}s`,
                  animationDuration: `${randomDuration}s`,
                }}
              />
            );
          })}
        </div>
      )}
      <div
        className="w-full max-w-md bg-[#fafcf8] h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 border-l border-[#dbe6d7]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ultra-Premium Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#14361e] via-[#1c4a28] to-[#14361e] text-white flex items-center justify-between shadow-lg border-b border-emerald-900/40 relative overflow-hidden">
          {/* Ambient Glow Effects */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-green-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-white shadow-inner relative group">
              <div className="absolute inset-0 rounded-2xl bg-emerald-400/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              {successOrder ? <Sparkles size={21} className="text-emerald-200 animate-pulse" /> : <ShoppingCart size={20} className="text-white" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black tracking-wide text-white drop-shadow-xs">
                  {successOrder ? 'অর্ডার সফলভাবে সম্পন্ন' : 'আপনার শপিং কার্ট ও চেকআউট'}
                </h2>
                {successOrder && (
                  <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-500/30 border border-emerald-400/40 text-[10px] px-2 py-0.5 rounded-full font-extrabold text-emerald-200">
                    <Leaf size={10} /> Confirmed
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-100/90 font-medium tracking-wide mt-0.5">
                {successOrder ? `অর্ডার আইডি: ${successOrder.orderId}` : 'নিরাপদ ক্যাশ অন ডেলিভারি ও অনলাইন পেমেন্ট'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm relative z-10 hover:scale-105 active:scale-95"
            title="বন্ধ করুন"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin">
          {successOrder ? (
            /* Inline Order Success Receipt (NO POPUP!) */
            <div className="flex flex-col items-center text-center py-4 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-[#eef7e0] text-[#176b38] rounded-full flex items-center justify-center mx-auto border-2 border-[#cbe1a8] shadow-inner">
                <CheckCircle2 size={36} />
              </div>

              <div>
                <h3 className="text-lg font-black text-[#063d24]">আপনার অর্ডারটি সফল হয়েছে! 🎉</h3>
                <p className="text-xs text-[#526250] mt-1 leading-relaxed">
                  Seed Haven BD-তে অর্ডার করার জন্য আপনাকে ধন্যবাদ। আমরা দ্রুত আপনার বীজের পার্সেলটি পাঠিয়ে দিচ্ছি।
                </p>
              </div>

              {/* Invoice Summary Box */}
              <div className="w-full bg-[#f7f9f2] border border-[#eaeee4] rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-[#e2e8d8] pb-2 font-bold text-[#063d24]">
                  <span>অর্ডার আইডি:</span>
                  <span className="text-[#176b38] font-black">{successOrder.orderId}</span>
                </div>

                <div className="flex justify-between text-[#405649]">
                  <span>গ্রাহকের নাম:</span>
                  <strong className="text-[#063d24]">{successOrder.customerName}</strong>
                </div>

                <div className="flex justify-between text-[#405649]">
                  <span>মোবাইল নম্বর:</span>
                  <strong className="text-[#063d24]">{successOrder.phone}</strong>
                </div>

                <div className="flex justify-between text-[#405649]">
                  <span>ঠিকানা:</span>
                  <span className="text-[#063d24] text-right font-semibold">{successOrder.address}, {successOrder.district}</span>
                </div>

                <div className="flex justify-between text-[#405649]">
                  <span>পেমেন্ট মেথড:</span>
                  <strong className="text-[#063d24]">
                    {successOrder.paymentMethod === 'bkash' ? 'বিকাশ' : successOrder.paymentMethod === 'nagad' ? 'নগদ' : successOrder.paymentMethod === 'rocket' ? 'রকেট' : 'ক্যাশ অন ডেলিভারি (COD)'}
                  </strong>
                </div>

                <div className="flex justify-between border-t border-[#e2e8d8] pt-2 font-black text-sm text-[#063d24]">
                  <span>সর্বমোট বিল:</span>
                  <span className="text-[#176b38]">৳ {successOrder.total}</span>
                </div>
              </div>

              <div className="w-full bg-[#f0f7e6] p-3 rounded-xl border border-[#d2e4b6] text-xs text-[#204a2c] flex items-center gap-2">
                <PackageCheck size={18} className="text-[#176b38] shrink-0" />
                <span className="text-left font-semibold">
                  কুরিয়ার থেকে ডেলিভারি বয় কল করার পর পণ্য দেখে টাকা পরিশোধ করবেন।
                </span>
              </div>

              <div className="w-full flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenMemo && successOrder) {
                      onOpenMemo(successOrder);
                    } else {
                      window.print();
                    }
                  }}
                  className="flex-1 bg-white border border-[#dce2d2] text-[#063d24] hover:bg-[#f2f6eb] py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Printer size={16} />
                  <span>মেমো প্রিন্ট করুন</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessOrder(null);
                    onClose();
                  }}
                  className="flex-1 bg-[#176b38] text-white hover:bg-[#063d24] py-3 rounded-xl font-bold text-xs cursor-pointer shadow-md"
                >
                  কেনাকাটা চালিয়ে যান
                </button>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#eaf3e6] via-[#dcedd7] to-[#f4faf1] border-2 border-[#1c3822]/10 flex items-center justify-center text-5xl shadow-md">
                  🌱
                </div>
              </div>
              <h3 className="text-lg font-black text-[#1c3822]">আপনার কার্ট বর্তমানে খালি</h3>
              <p className="text-xs text-gray-600 mt-2 max-w-xs leading-relaxed font-medium">
                আমাদের মানসম্মত উন্নত জাতের বীজের সংগ্রহ থেকে আপনার পছন্দের বীজ নির্বাচন করুন।
              </p>
              <button
                onClick={onClose}
                className="mt-6 bg-[#1c3822] text-white px-7 py-3 rounded-full font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>পণ্য দেখুন</span>
              </button>
            </div>
          ) : (
            <form id="orderForm" onSubmit={handleSubmitOrder} className="space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Cart Items List */}
              <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h3 className="text-xs font-black text-[#1c3822] uppercase tracking-wider flex items-center gap-1.5">
                    <span>🛒</span>
                    <span>নির্বাচিত পণ্যসমূহ ({cartItems.length}টি)</span>
                  </h3>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center gap-3 p-3 bg-gray-50/90 border border-gray-200/60 rounded-xl transition-all hover:border-emerald-200"
                    >
                      <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-2xl shrink-0 overflow-hidden shadow-2xs">
                        {item.product.image ? (
                          <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          item.product.imageEmoji
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-black text-[#1c3822] truncate">{item.product.name}</h4>
                        <div className="text-[11px] text-gray-500 mt-0.5 font-medium flex items-center gap-1.5">
                          <span>৳{item.product.price} × {item.quantity}</span>
                          <span>=</span>
                          <strong className="text-emerald-800 font-black text-xs">
                            ৳{item.product.price * item.quantity}
                          </strong>
                        </div>

                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden shadow-2xs">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="w-6 h-6 hover:bg-gray-100 text-[#1c3822] font-bold text-xs flex items-center justify-center cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-6 text-center text-xs font-black text-[#1c3822]">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="w-6 h-6 hover:bg-gray-100 text-[#1c3822] font-bold text-xs flex items-center justify-center cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-rose-600 hover:text-rose-700 p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs cursor-pointer transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Coupon Box */}
              <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs space-y-2.5">
                <span className="text-xs font-black text-[#1c3822] flex items-center gap-2">
                  <Tag size={15} className="text-emerald-700" />
                  <span>ডিসকাউন্ট কুপন ব্যবহার করুন</span>
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="কুপন কোড (যেমন: SEED10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1c3822] font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-[#1c3822] hover:bg-[#264b2d] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs cursor-pointer transition-colors"
                  >
                    প্রয়োগ
                  </button>
                </div>
                {couponMsg && (
                  <div
                    className={`text-[11px] font-bold p-2.5 rounded-xl border ${
                      couponMsg.isError ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    }`}
                  >
                    {couponMsg.text}
                  </div>
                )}
              </div>

              {/* 3. Payment Method Selector */}
              <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs space-y-3">
                <label className="block text-xs font-black text-[#1c3822] flex items-center gap-2 border-b border-gray-100 pb-2">
                  <ShieldCheck size={16} className="text-emerald-700" />
                  <span>পেমেন্ট মেথড নির্বাচন করুন <span className="text-rose-500">*</span></span>
                </label>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {paymentSettings.codEnabled && (
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('cod')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer font-bold flex items-center gap-2 ${
                        selectedPaymentMethod === 'cod'
                          ? 'bg-[#1c3822] text-white border-[#1c3822] shadow-md ring-2 ring-emerald-500/20'
                          : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-white'
                      }`}
                    >
                      <span className="text-base">💵</span>
                      <div>
                        <div className="text-[11px] font-black">ক্যাশ অন ডেলিভারি</div>
                        <div className="text-[10px] opacity-80 font-normal">হাতে পেয়ে পরিশোধ</div>
                      </div>
                    </button>
                  )}

                  {paymentSettings.bkashEnabled && (
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('bkash')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer font-bold flex items-center gap-2 ${
                        selectedPaymentMethod === 'bkash'
                          ? 'bg-[#e2136e] text-white border-[#e2136e] shadow-md ring-2 ring-pink-500/20'
                          : 'bg-pink-50/50 text-gray-800 border-pink-200 hover:bg-pink-100/50'
                      }`}
                    >
                      <span className="bg-[#e2136e] text-white text-[10px] font-black px-1.5 py-0.5 rounded">bKash</span>
                      <div>
                        <div className="text-[11px] font-black">বিকাশ পেমেন্ট</div>
                        <div className="text-[10px] opacity-80 font-normal">{paymentSettings.bkashType || 'Personal'}</div>
                      </div>
                    </button>
                  )}

                  {paymentSettings.nagadEnabled && (
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('nagad')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer font-bold flex items-center gap-2 ${
                        selectedPaymentMethod === 'nagad'
                          ? 'bg-[#f7921e] text-white border-[#f7921e] shadow-md ring-2 ring-orange-500/20'
                          : 'bg-orange-50/50 text-gray-800 border-orange-200 hover:bg-orange-100/50'
                      }`}
                    >
                      <span className="bg-[#f7921e] text-white text-[10px] font-black px-1.5 py-0.5 rounded">নগদ</span>
                      <div>
                        <div className="text-[11px] font-black">নগদ পেমেন্ট</div>
                        <div className="text-[10px] opacity-80 font-normal">{paymentSettings.nagadType || 'Personal'}</div>
                      </div>
                    </button>
                  )}

                  {paymentSettings.rocketEnabled && (
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod('rocket')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer font-bold flex items-center gap-2 ${
                        selectedPaymentMethod === 'rocket'
                          ? 'bg-[#8c3494] text-white border-[#8c3494] shadow-md ring-2 ring-purple-500/20'
                          : 'bg-purple-50/50 text-gray-800 border-purple-200 hover:bg-purple-100/50'
                      }`}
                    >
                      <span className="bg-[#8c3494] text-white text-[10px] font-black px-1.5 py-0.5 rounded">রকেট</span>
                      <div>
                        <div className="text-[11px] font-black">রকেট পেমেন্ট</div>
                        <div className="text-[10px] opacity-80 font-normal">{paymentSettings.rocketType || 'Personal'}</div>
                      </div>
                    </button>
                  )}
                </div>

                {/* Mobile Banking Details Input Form */}
                {selectedPaymentMethod !== 'cod' && (
                  <div className="p-3.5 rounded-xl border bg-slate-50 border-slate-200 space-y-2.5 mt-3 animate-fadeIn">
                    <div className="text-xs text-slate-800 font-bold bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span>{selectedPaymentMethod.toUpperCase()} নম্বর:</span>
                      <strong className="text-emerald-800 font-black tracking-wider">
                        {selectedPaymentMethod === 'bkash' ? paymentSettings.bkashNumber : selectedPaymentMethod === 'nagad' ? paymentSettings.nagadNumber : paymentSettings.rocketNumber}
                      </strong>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">আপনার প্রেরক (Sender) নম্বর *</label>
                      <input
                        type="tel"
                        placeholder="01XXXXXXXXX"
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">ট্রানজেকশন আইডি (TrxID) *</label>
                      <input
                        type="text"
                        placeholder="যেমন: 8N7A6D..."
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg font-mono font-bold uppercase"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Customer Details Form (Always Visible for Guest & Logged in Users) */}
              {!currentUser && loginEnabled !== false && (
                <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200/80 flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 text-[#118137] flex items-center justify-center shrink-0 font-bold text-xs">
                      👤
                    </div>
                    <p className="text-[11px] font-semibold text-slate-700 truncate">
                      পূর্বে অ্যাকাউন্ট তৈরি করা থাকলে <span className="text-[#118137] font-bold">লগইন করুন</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#118137] hover:bg-[#0d6b2c] text-white font-bold text-[11px] shrink-0 transition-colors cursor-pointer"
                  >
                    লগইন
                  </button>
                </div>
              )}

              <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs space-y-3">
                  <h3 className="text-xs font-black text-[#1c3822] uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-100 pb-2">
                    <span>📋</span>
                    <span>গ্রাহক ও বিস্তারিত ঠিকানা</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-black text-[#1c3822] mb-1">আপনার সম্পূর্ণ নাম *</label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-black text-[#1c3822] mb-1">১ম মোবাইল নম্বর (প্রধান) *</label>
                      <input
                        type="tel"
                        required
                        placeholder="যেমন: 01700000000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 tracking-wider"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#1c3822] mb-1">২য় মোবাইল নম্বর (বিকল্প)</label>
                      <input
                        type="tel"
                        placeholder="যেমন: 01800000000"
                        value={phone2}
                        onChange={(e) => setPhone2(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 tracking-wider"
                      />
                    </div>
                  </div>

                  {isDeliveryFeeActive && (
                    <div>
                      <label className="block text-xs font-black text-[#1c3822] mb-1 flex items-center justify-between">
                        <span>শিপিং জোন / ডেলিভারি চার্জ *</span>
                        {isFreeDelivery && <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">ফ্রি ডেলিভারি</span>}
                      </label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => handleDeliveryLocationChange('dhaka')}
                          className={`p-2.5 rounded-xl border text-left font-bold cursor-pointer ${
                            deliveryLocation === 'dhaka' ? 'bg-[#1c3822] text-white border-[#1c3822]' : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          <div>ঢাকা শহর</div>
                          <div className="text-[11px] font-black mt-0.5">{isFreeDelivery ? '৳০ (ফ্রি)' : `৳${deliverySettings.insideCharge}`}</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeliveryLocationChange('outside')}
                          className={`p-2.5 rounded-xl border text-left font-bold cursor-pointer ${
                            deliveryLocation === 'outside' ? 'bg-[#1c3822] text-white border-[#1c3822]' : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          <div>ঢাকার বাইরে</div>
                          <div className="text-[11px] font-black mt-0.5">{isFreeDelivery ? '৳০ (ফ্রি)' : `৳${deliverySettings.outsideCharge}`}</div>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-black text-[#1c3822] mb-1">জেলা *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: ঢাকা / চট্টগ্রাম"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#1c3822] mb-1">থানা / উপজেলা *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: সাভার / মিরপুর"
                        value={thana}
                        onChange={(e) => setThana(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-black text-[#1c3822] mb-1">ইউনিয়ন (যদি থাকে)</label>
                      <input
                        type="text"
                        placeholder="যেমন: ভাকুর্তা ইউনিয়ন"
                        value={union}
                        onChange={(e) => setUnion(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#1c3822] mb-1">গ্রাম / পাড়া / মহল্লা *</label>
                      <input
                        type="text"
                        required
                        placeholder="যেমন: পশ্চিমপাড়া"
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                        className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#1c3822] mb-1">বাড়ির আশেপাশের গুরুত্বপূর্ণ স্থান / ল্যান্ডমার্ক</label>
                    <input
                      type="text"
                      placeholder="যেমন: জামে মসজিদের পাশে / সরকারি প্রাথমিক বিদ্যালয়ের সামনে"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800"
                    />
                  </div>
                </div>
            </form>
          )}
        </div>

        {/* Footer Summary & Action Button (Hidden when order is successfully placed) */}
        {!successOrder && cartItems.length > 0 && (
          <div className="p-3 sm:p-4 border-t border-emerald-100 bg-white space-y-2.5 shadow-lg">
            <div className="space-y-1 text-xs text-gray-600 font-medium bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/60">
              <div className="flex justify-between">
                <span>পণ্যের মোট দাম:</span>
                <strong className="text-[#1c3822] font-black">৳{subtotal}</strong>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>ডিসকাউন্ট ছাড় ({appliedDiscountObj?.code}):</span>
                  <span>- ৳{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>ডেলিভারি চার্জ:</span>
                <strong className="text-[#1c3822] font-black">
                  {!isDeliveryFeeActive || deliveryFee === 0 ? '৳০ (ফ্রি)' : `৳${deliveryFee}`}
                </strong>
              </div>
              <div className="flex justify-between text-sm font-black text-[#1c3822] pt-1.5 border-t border-emerald-200/60">
                <span>সর্বমোট পরিশোধযোগ্য:</span>
                <span className="text-emerald-800">৳{total}</span>
              </div>
            </div>

            <button
              type="submit"
              form="orderForm"
              className="w-full bg-gradient-to-r from-[#1c3822] via-[#264b2d] to-[#1c3822] text-white py-3.5 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer border border-[#2b5019]"
            >
              <Check size={16} />
              <span>অর্ডার নিশ্চিত করুন (৳{total})</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
