export function formatCreatorPrices(text: string) {
    const match = text.match(/\d+/);
    const number = match ? match[0] : null;
    return number;
  }
  