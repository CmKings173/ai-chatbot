export const WEBSITE_TYPES = [
  'WORDPRESS',
  'SHOPIFY',
  'WIX',
  'CUSTOM_HTML',
  'OTHER',
] as const;

export type WebsiteType = (typeof WEBSITE_TYPES)[number];

export function websiteTypeLabel(type: WebsiteType): string {
  switch (type) {
    case 'WORDPRESS':
      return 'WordPress';
    case 'SHOPIFY':
      return 'Shopify';
    case 'WIX':
      return 'Wix';
    case 'CUSTOM_HTML':
      return 'Tùy chỉnh (HTML)';
    case 'OTHER':
      return 'Khác';
    default:
      return type;
  }
}
