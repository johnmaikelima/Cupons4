interface Window {
  dataLayer: {
    push: (event: {
      event: string;
      [key: string]: any;
    }) => void;
  }[];
}
