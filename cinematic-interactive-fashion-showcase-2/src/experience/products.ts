export type Product = {
  id: string;
  name: string;
  chapter: string;
  description: string;
  image: string;
  accentFrom: string;
  accentTo: string;
  bgFrom: string;
  bgTo: string;
};

export const products: Product[] = [
  {
    id: "shoe",
    name: "AURORA RUNNER",
    chapter: "Chapter I — Motion as Couture",
    description: "A sculpted silhouette with liquid-light reflections. Built for midnight streets and gallery openings alike.",
    image: "/images/product-shoe.png",
    accentFrom: "#B8A7FF",
    accentTo: "#4DA3FF",
    bgFrom: "#070A0F",
    bgTo: "#0B1220",
  },
  {
    id: "jacket",
    name: "NOIR TAILORED JACKET",
    chapter: "Chapter II — Precision in the Dark",
    description: "Sharp structure, soft edges. A jacket that moves like a thought — silent, inevitable.",
    image: "/images/product-jacket.png",
    accentFrom: "#FFE0A3",
    accentTo: "#FF6B95",
    bgFrom: "#07080B",
    bgTo: "#150B12",
  },
  {
    id: "bag",
    name: "GLASS LEATHER BAG",
    chapter: "Chapter III — Carry the Light",
    description: "Minimal form. Maximal presence. A floating object of desire — engineered like jewelry.",
    image: "/images/product-bag.png",
    accentFrom: "#8FFFE0",
    accentTo: "#2F7BFF",
    bgFrom: "#050A0A",
    bgTo: "#07131F",
  },
  {
    id: "watch",
    name: "CHRONOS MARK I",
    chapter: "Chapter IV — Time, Refracted",
    description: "A metronome of metal and shadow. Precision you can feel — even before you look.",
    image: "/images/product-watch.png",
    accentFrom: "#A7F3FF",
    accentTo: "#A78BFA",
    bgFrom: "#06070E",
    bgTo: "#0D0A17",
  },
  {
    id: "sunglasses",
    name: "SPECTRA SUN",
    chapter: "Chapter V — The Gaze",
    description: "Cut like a secret. A lens that turns the world into a film.",
    image: "/images/product-sunglasses.png",
    accentFrom: "#FDE68A",
    accentTo: "#60A5FA",
    bgFrom: "#08080A",
    bgTo: "#10101A",
  },
  {
    id: "dress",
    name: "ECLIPSE DRESS",
    chapter: "Finale — Gravity, Optional",
    description: "A couture orbit. Light moves across the fabric as if it’s alive.",
    image: "/images/product-dress.png",
    accentFrom: "#FB7185",
    accentTo: "#C4B5FD",
    bgFrom: "#09060A",
    bgTo: "#140B10",
  },
];
