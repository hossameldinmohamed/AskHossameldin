declare module "arabic-reshaper" {
  interface ArabicReshaper {
    convertArabic(text: string): string;
    convertArabicBack(text: string): string;
  }
  const reshaper: ArabicReshaper;
  export default reshaper;
}
