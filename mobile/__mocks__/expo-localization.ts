export const locale = 'en-US';
export const locales = ['en-US'];
export const timezone = 'America/New_York';
export const region = 'US';
export const isRTL = false;

export function getLocales() {
  return [
    {
      languageTag: locale,
      languageCode: locale.split('-')[0] ?? 'en',
      regionCode: locale.split('-')[1] ?? null,
      currencyCode: 'USD',
      decimalSeparator: '.',
      digitGroupingSeparator: ',',
      textDirection: 'ltr',
      measurementSystem: 'us',
      temperatureUnit: 'fahrenheit',
    },
  ];
}

export default { locale, locales, timezone, region, isRTL, getLocales };
