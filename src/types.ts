export type Mode = "read" | "write";

export type PoemPage = {
  id: string;
  title: string;
  body: string;
};

export type SavedState = {
  mode?: Mode;
  pages?: PoemPage[];
};
