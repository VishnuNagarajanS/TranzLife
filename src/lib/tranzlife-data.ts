import rawData from '@/data/tranzlife.json';

export type FocusType = 'breathe' | 'cleanse' | 'balance';

export interface ProductComment {
  from: string;
  text: string;
  id: string;
}

export interface IconItem {
  title: string;
  icon: string;
  text?: string;
}

export interface ProductVariant {
  name: string;
  short: string;
  color: string;
  tint: string;
  image: string;
  forWhom: string;
  aroma: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  amount: string;
  flavour: string;
  price: string;
  accent: string;
  tint: string;
  image: string;
  introTitle: string;
  retailSlang: string;
  description: string;
  promotionText: string;
  benefits: IconItem[];
  detailsTitle: string;
  details: Record<string, string>;
  howToUse: (IconItem & { text: string })[];
  caution: string;
  storage: string;
  comments: ProductComment[];
  whyItWorks: { title: string; text: string }[];
  natureTitle: string;
  natureAmount: string;
  natureAmountLabel: string;
  natureAmountDescription: string;
  /** lungs: outline that fills on scroll · circle: ingredient ring · list: ingredient chips · variants: the 4 packs */
  natureVisual: 'lungs' | 'circle' | 'list' | 'variants';
  natureDescription: string;
  focus: FocusType;
  variants?: ProductVariant[];
  programme?: { week: string; title: string; text: string }[];
}

export interface FocusArea {
  type: FocusType;
  title: string;
  subtitle: string;
  color: string;
  tint: string;
  icon: string;
  image: string;
  descriptionShort: string;
  description: string;
  whoTitle: string;
  whoText: string;
  whatTitle: string;
  whatText: string;
}

interface Link {
  text: string;
  url: string;
  id?: string;
  target?: string;
}

export interface TranzLifeData {
  brand: { company: string; shortName: string; tagline: string; motto: string; url: string };
  navigation: { links: { url: string; text: string; id: string }[] };
  home: {
    title: string;
    titleSmall: string;
    subtitle: string;
    /** Story video for the hero; while empty the green orb is shown instead. */
    heroVideo: string;
    heroVideoPoster: string;
    cta: string;
    ctaSecondary: string;
    intro: { eyebrow: string; text: string; facts: { value: string; label: string }[] };
    bandEyebrow: string;
    bandTitle: string;
    bandText: string;
    /** `video` (optional) plays over the image while the card is hovered. */
    triptych: { title: string; text: string; image: string; video?: string }[];
    whatWeDo: (IconItem & { text: string })[];
    /** Before/after story: damaged → restored. Swap the images for the DNA videos when they arrive. */
    story: {
      eyebrow: string;
      beforeImage: string;
      afterImage: string;
      hint: string;
      stages: { title: string; text: string; tags: string[] }[];
    };
    focusEyebrow: string;
    focusTitle: string;
    ingredientsEyebrow: string;
    ingredientsTitle: string;
    ingredients: { name: string; latin: string; role: string; products: string[] }[];
    futureEyebrow: string;
    futureTitle: string;
    futureImage: string;
    partnerTitle: string;
    partnerText: string;
    trustTitle: string;
    trust: { label: string; icon: string; show: boolean }[];
  };
  productsPage: { title: string; titleSmall: string; subtitle: string };
  products: Product[];
  focusAreas: FocusArea[];
  about: {
    heroTitle: string;
    heroText: string;
    rootsTitle: string;
    roots: { title: string; art: string; text: string }[];
    visionTitle: string;
    vision: string;
    missionTitle: string;
    mission: string[];
    valuesTitle: string;
    values: (IconItem & { text: string })[];
    whatWeDoTitle: string;
    strengthsTitle: string;
    strengths: { title: string; text: string }[];
    recognitionEyebrow: string;
    recognitionTitle: string;
    recognitionText: string;
    events: { image: string; caption: string }[];
    credentialsTitle: string;
    /** `logo` from /certificates; `dark` marks a logo drawn for a dark background (GeM). */
    credentials: { title: string; description: string; logo?: string; dark?: boolean; show: boolean }[];
    joinTitle: string;
    joinText: string;
    joinOptions: { title: string; text: string }[];
  };
  science: {
    heroTitle: string;
    intro: string;
    pillarsTitle: string;
    pillars: (IconItem & { text: string })[];
    comingTitle: string;
    comingIntro: string;
    pipeline: { name: string; group: string; text: string }[];
  };
  contact: {
    title: string;
    intro: string;
    reasons: { value: string; label: string }[];
    email: string;
    phone: string;
    whatsapp: string;
    address: string[];
    mapUrl: string;
    website: string;
  };
  enquire: { title: string; stock: string; description: string; buttonText: string; buttonUrl: string };
  socials: { title: string; links: Link[] };
  footer: {
    title: string;
    entries: { title: string; links: Link[]; id: string }[];
    meta: { text: string; url?: string }[];
  };
}

export const siteData = rawData as unknown as TranzLifeData;

export function getProductBySlug(slug: string): Product | undefined {
  return siteData.products.find((p) => p.slug === slug);
}

export function getFocusByType(type: string): FocusArea | undefined {
  return siteData.focusAreas.find((f) => f.type === type);
}

export function getProductsByFocus(type: string): Product[] {
  return siteData.products.filter((p) => p.focus === type);
}

/** Internal links start with `/` and are not files or mailto links. */
export function isRouteLink(url: string) {
  return url.startsWith('/') && !/\.[a-z0-9]+$/i.test(url.split('#')[0]);
}
