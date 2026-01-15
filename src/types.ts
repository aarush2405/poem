export type Mode = "read" | "write";

export type PoemPage = {
  page_no: number;
  title: string;
  body: string;
};

export type Profile = {
  id: string;
  role: "reader" | "writer";
};
