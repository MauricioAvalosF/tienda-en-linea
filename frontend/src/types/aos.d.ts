declare module 'aos' {
  interface AosOptions {
    duration?: number;
    easing?: string;
    once?: boolean;
    offset?: number;
    delay?: number;
    anchor?: string;
    placement?: string;
    mirror?: boolean;
    disable?: boolean | 'phone' | 'tablet' | 'mobile';
  }

  const AOS: {
    init(options?: AosOptions): void;
    refresh(initialize?: boolean): void;
    refreshHard(): void;
  };

  export default AOS;
}
