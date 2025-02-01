import qs from 'qs';

export function useQueryParams() {
  const parseQuery = (query: string) =>
    qs.parse(query, { ignoreQueryPrefix: true });
  const stringifyQuery = (query: any) =>
    qs.stringify(query, {
      encode: false,
      arrayFormat: 'comma',
      commaRoundTrip: true,
    });

  return {
    parseQuery,
    stringifyQuery,
  };
}
