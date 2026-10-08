export interface LoginResponse {
  token: string;
}

export interface KroonSmartSearchResponse {
  [key: string]: unknown;
}

export interface KroonSmartSearchItemDto {
  title: string;
  years: string;
  url: string;
  id: number;
}

export interface KroonSmartSearchGroupDto {
  title: string;
  items: KroonSmartSearchItemDto[];
}

export interface KroonSmartSearchResponseDto {
  categories: KroonSmartSearchGroupDto[];
}
//
export interface KroonProductRecommendationResponseDto {
  id: number;
  title: string;
  years: string;
  components: KroonProductRecommendationComponentDto[];
}

export interface KroonProductRecommendationComponentDto {
  title: string;
  volume?: string;
  products: KroonProductRecommendationProductDto[];
  replacement?: string;
}

export interface KroonProductRecommendationProductDto {
  title: string;
  url: string;
  id: number;
  code?: string;
}

export interface KroonProductRecommendationProductDto {
  title: string;
  url: string;
  id: number;

  /**
   * Kroon internal product code.
   * Example: 02226
   */
  kroonCode?: string;

  /**
   * External Autotechnics code.
   * Example: KL02226
   */
  code?: string;
}
