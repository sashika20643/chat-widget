/**
 * H100 shop identities (FCA). Used for chat_bot subscription and auth shop context.
 * @see client_key in source catalog — not required for subscription payload.
 */
export const FcaShop = {
  BOGEN33: 'BOGEN33',
  MEMORIE: 'MEMORIE',
  VIADUKT3: 'VIADUKT3',
} as const

export type FcaShop = (typeof FcaShop)[keyof typeof FcaShop]

export const FCA_SHOP_ID_BY_NAME: Record<FcaShop, string> = {
  [FcaShop.BOGEN33]: '1cd2e949-a1a2-45c5-aa28-6ef5b0860827',
  [FcaShop.MEMORIE]: 'bf6bfbc9-02b1-47e6-b8c3-afd406daade8',
  [FcaShop.VIADUKT3]: '65a84b37-3007-42d1-9fad-df670adfd3e9',
}

/** Default shop for subscription when the embed does not override context. */
export const DEFAULT_FCA_SHOP: FcaShop = FcaShop.BOGEN33

export const DEFAULT_FCA_SHOP_ID = FCA_SHOP_ID_BY_NAME[DEFAULT_FCA_SHOP]

/**
 * Newsletter `subCategories` indices aligned with shop order for this widget.
 * Backend expects numeric category ids; adjust if the API contract differs.
 */
export const NewsletterSubCategory = {
  Bogen33: 0,
  Memorie: 1,
  Viadukt3: 2,
} as const

export type NewsletterSubCategory = (typeof NewsletterSubCategory)[keyof typeof NewsletterSubCategory]
