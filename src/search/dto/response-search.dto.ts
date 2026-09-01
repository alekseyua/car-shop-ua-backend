export class RedisSearchResult {
  'itemNo': string;
  'name': string;
  'price': string;
  'catItemNo': string;
}

export class SearchResultResponse {
  'total': number;
  'products': RedisSearchResult[];
}
