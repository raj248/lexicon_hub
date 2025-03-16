export type Metadata = {
  title: string;
  language: string;
  date: string;
  creator: string;
  identifier: string;
  contributor?: string;
  coverImage?: string;
};
export type Spine = {
  id: string;
  href: string;
};
export type OPFData = {
  metadata: Metadata;
  spine: Spine[];
};
export type TocEntry = {
  id: string;      // The unique ID of the chapter
  title: string;   // The title of the chapter
  href: string;    // The relative path to the chapter content
};