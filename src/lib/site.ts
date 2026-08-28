export const siteConfig = {
  brandName: 'Bobin Foto Product',
  productName: 'Bobin Foto Product',
  currency: 'NPR',
  price: 999,
  originalPrice: 1499,
  deliveryFeeOutsideChitwan: 170,
  deliveryFeeInsideChitwan: 0,
  deliveryPromise: 'Delivery within 3 days',
  supportEmail: 'bobinfotoproduct@gmail.com',
  replyToEmail: 'bobinfotoproduct@gmail.com',
  contactNumber: '9865513959',
  themeName: 'Warm premium ivory, burgundy, and gold',
  heroImage: '/products/product-1.png',
  galleryImages: [
    '/products/product-1.png',
    '/products/product-2.png',
    '/products/product-3.png',
    '/products/product-4.png',
    '/products/product-5.png'
  ],
  testimonials: [
    {
      name: 'Sita',
      location: 'Kathmandu',
      quote:
        'Bobin Foto Product ले मेरो परिवारको फोटो एकदमै सुन्दर तरिकाले तयार गरिदियो। फोटोको quality र finishing निकै राम्रो लाग्यो। परिवारका लागि सम्झनायोग्य उपहार बन्यो।'
    },
    {
      name: 'Ramesh',
      location: 'Chitwan',
      quote:
        'फोनमा मात्र राखेको हाम्रो पुरानो फोटो Bobin Foto मार्फत सुन्दर memory मा परिणत भयो। Product quality राम्रो र service पनि निकै राम्रो लाग्यो। धेरै खुसी भएँ।'
    },
    {
      name: 'Anisha',
      location: 'Pokhara',
      quote:
        'मैले साथीलाई gift दिन Bobin Foto Product order गरेकी थिएँ। हेर्दा नै premium र personal feel भयो। उहाँलाई पनि धेरै मन पर्यो। Special occasion का लागि एकदमै राम्रो gift रहेछ!'
    }
  ],
  faqs: [
    {
      question: 'Bobin Foto Product भनेको के हो?',
      answer:
        'Bobin Foto Product तपाईंका मनपर्ने फोटोहरूलाई सुन्दर र सम्झनायोग्य physical product मा परिणत गर्ने सेवा हो।'
    },
    {
      question: 'मैले कुन फोटो पठाउन सक्छु?',
      answer:
        'तपाईंले आफ्नो मोबाइल वा डिजिटल device मा भएको clear photo पठाउन सक्नुहुन्छ। राम्रो quality को फोटो पठाउँदा final result अझ राम्रो हुन्छ।'
    },
    {
      question: 'यो product gift को लागि उपयुक्त छ?',
      answer:
        'हो। Birthday, Anniversary, Wedding, Family Moments तथा अन्य special occasions का लागि यो राम्रो personalized gift हो।'
    },
    {
      question: 'कसरी order गर्ने?',
      answer:
        'आफ्नो मनपर्ने फोटो छनोट गरेर हामीलाई पठाउनुहोस्। त्यसपछि product को details confirm गरेर तपाईंको order process गरिन्छ।'
    },
    {
      question: 'Delivery कहाँ-कहाँ हुन्छ?',
      answer:
        'नेपालभित्र delivery उपलब्ध छ। Chitwan भित्र delivery free छ, र Chitwan बाहिर delivery fee Rs. 170 लाग्छ।'
    }
  ],
  benefits: [
    'Preserve your favorite memories in a beautiful physical form',
    'Perfect for birthdays, anniversaries, weddings, and gifting',
    'Premium framed look that feels personal and elegant',
    'Fast delivery within 3 days',
    'Cash on Delivery available for easy ordering'
  ]
} as const

export const reels = [] as const

export function formatNpr(value: number) {
  return `Rs. ${new Intl.NumberFormat('en-IN').format(Math.round(value))}`
}

export function getDeliveryFee(location: string) {
  const normalized = location.toLowerCase()
  return normalized.includes('chitwan')
    ? siteConfig.deliveryFeeInsideChitwan
    : siteConfig.deliveryFeeOutsideChitwan
}

export function getOrderSubtotal(quantity: number) {
  return siteConfig.price * quantity
}

export function getOrderTotal(quantity: number, location: string) {
  return getOrderSubtotal(quantity) + getDeliveryFee(location)
}

export function formatKathmanduDateTime(date = new Date()) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kathmandu',
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

export function createOrderId() {
  const stamp = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kathmandu',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
    .format(new Date())
    .replace(/\//g, '')
  const random = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `BFP-${stamp}-${random}`
}
