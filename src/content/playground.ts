export type PlaygroundImage = {
  url: string;
  width: number;
  height: number;
  alt: string;
};

export type PlaygroundCard = {
  _key: string;
  title: string;
  year?: string;
  eyebrow?: string;
  href?: string;
  image: PlaygroundImage;
};

export type PlaygroundGenre = {
  _key: string;
  name: string;
  slug: string;
  accent: string;
  cards: PlaygroundCard[];
};

export type PlaygroundPageData = {
  title: string;
  seoTitle: string;
  description: string;
  indexable: boolean;
  genres: PlaygroundGenre[];
};
