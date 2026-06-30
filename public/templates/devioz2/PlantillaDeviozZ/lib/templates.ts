export interface Template {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  featured: boolean;
  description: string;
  tags: string[];
}

export interface TemplateConfig {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    button: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
  };
  content: {
    businessName: string;
    tagline: string;
    description: string;
    ctaText: string;
    aboutText: string;
  };
  images: {
    logo: string;
    banner: string;
    heroImage: string;
    aboutImage: string;
    galleryImages: string[];
  };
  sections: {
    hero: boolean;
    about: boolean;
    services: boolean;
    gallery: boolean;
    testimonials: boolean;
    contact: boolean;
  };
  social: {
    facebook: string;
    instagram: string;
    tiktok: string;
    whatsapp: string;
  };
  contact: {
    email: string;
    phone: string;
    address: string;
  };
}

export const categories = [
  { id: 'all', name: 'All Templates', icon: 'Grid' },
  { id: 'gym', name: 'Gym & Fitness', icon: 'Dumbbell' },
  { id: 'restaurant', name: 'Restaurant', icon: 'UtensilsCrossed' },
  { id: 'technology', name: 'Technology', icon: 'Cpu' },
  { id: 'ecommerce', name: 'Ecommerce', icon: 'ShoppingBag' },
  { id: 'education', name: 'Education', icon: 'GraduationCap' },
  { id: 'healthcare', name: 'Healthcare', icon: 'Heart' },
  { id: 'business', name: 'Business', icon: 'Briefcase' },
];

export const templates: Template[] = [
  {
    id: 'gym-pro',
    name: 'FitnessPro',
    category: 'gym',
    price: 149,
    rating: 4.9,
    reviews: 234,
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
    featured: true,
    description: 'Modern gym and fitness center template with membership features',
    tags: ['Responsive', 'Dark Mode', 'Animations'],
  },
  {
    id: 'resto-elegance',
    name: 'Resto Elegance',
    category: 'restaurant',
    price: 129,
    rating: 4.8,
    reviews: 189,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
    featured: true,
    description: 'Elegant restaurant template with menu and reservation system',
    tags: ['Menu System', 'Reservations', 'Gallery'],
  },
  {
    id: 'tech-startup',
    name: 'TechLaunch',
    category: 'technology',
    price: 199,
    rating: 4.9,
    reviews: 312,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    featured: true,
    description: 'Cutting-edge tech startup landing page with SaaS features',
    tags: ['SaaS Ready', 'API Docs', 'Pricing'],
  },
  {
    id: 'shop-modern',
    name: 'ShopModern',
    category: 'ecommerce',
    price: 249,
    rating: 4.7,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop',
    featured: false,
    description: 'Complete ecommerce solution with cart and checkout',
    tags: ['Shopping Cart', 'Payments', 'Inventory'],
  },
  {
    id: 'edu-platform',
    name: 'LearnHub',
    category: 'education',
    price: 179,
    rating: 4.8,
    reviews: 98,
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop',
    featured: false,
    description: 'Educational platform with course management',
    tags: ['Courses', 'Students', 'Progress'],
  },
  {
    id: 'health-care',
    name: 'MediCare',
    category: 'healthcare',
    price: 189,
    rating: 4.9,
    reviews: 145,
    image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=600&fit=crop',
    featured: true,
    description: 'Healthcare clinic template with appointment booking',
    tags: ['Appointments', 'Doctors', 'Services'],
  },
  {
    id: 'corp-elite',
    name: 'CorpElite',
    category: 'business',
    price: 169,
    rating: 4.6,
    reviews: 223,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
    featured: false,
    description: 'Professional corporate website template',
    tags: ['Portfolio', 'Team', 'Services'],
  },
  {
    id: 'gym-extreme',
    name: 'GymExtreme',
    category: 'gym',
    price: 159,
    rating: 4.7,
    reviews: 167,
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop',
    featured: false,
    description: 'Bold and energetic gym template with class schedules',
    tags: ['Classes', 'Trainers', 'Membership'],
  },
  {
    id: 'cafe-vibes',
    name: 'Cafe Vibes',
    category: 'restaurant',
    price: 119,
    rating: 4.8,
    reviews: 201,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop',
    featured: false,
    description: 'Cozy cafe template with online ordering',
    tags: ['Menu', 'Ordering', 'Events'],
  },
  {
    id: 'saas-dashboard',
    name: 'SaaSify',
    category: 'technology',
    price: 299,
    rating: 4.9,
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    featured: true,
    description: 'Complete SaaS dashboard with analytics',
    tags: ['Dashboard', 'Analytics', 'Charts'],
  },
  {
    id: 'fashion-store',
    name: 'FashionFlow',
    category: 'ecommerce',
    price: 229,
    rating: 4.8,
    reviews: 134,
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&h=600&fit=crop',
    featured: false,
    description: 'Stylish fashion ecommerce template',
    tags: ['Lookbook', 'Collections', 'Wishlist'],
  },
  {
    id: 'dental-clinic',
    name: 'SmileCare',
    category: 'healthcare',
    price: 169,
    rating: 4.7,
    reviews: 112,
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&h=600&fit=crop',
    featured: false,
    description: 'Modern dental clinic with patient portal',
    tags: ['Booking', 'Services', 'Team'],
  },
];

export const defaultConfig: TemplateConfig = {
  colors: {
    primary: '#8b5cf6',
    secondary: '#1e1b4b',
    background: '#0f0a1a',
    text: '#ffffff',
    button: '#ef4444',
  },
  typography: {
    fontFamily: 'Inter',
    fontSize: '16px',
    fontWeight: '400',
  },
  content: {
    businessName: 'Your Business',
    tagline: 'Your Amazing Tagline Here',
    description: 'Describe your business in a few compelling sentences that capture the essence of what you do.',
    ctaText: 'Get Started',
    aboutText: 'Tell your story here. Share your mission, values, and what makes your business unique.',
  },
  images: {
    logo: '',
    banner: '',
    heroImage: '',
    aboutImage: '',
    galleryImages: [],
  },
  sections: {
    hero: true,
    about: true,
    services: true,
    gallery: true,
    testimonials: true,
    contact: true,
  },
  social: {
    facebook: '',
    instagram: '',
    tiktok: '',
    whatsapp: '',
  },
  contact: {
    email: 'contact@yourbusiness.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Street, City, State 12345',
  },
};

export const fontOptions = [
  'Inter',
  'Poppins',
  'Roboto',
  'Open Sans',
  'Montserrat',
  'Playfair Display',
  'Lato',
  'Raleway',
];
