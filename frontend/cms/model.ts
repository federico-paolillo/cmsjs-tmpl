// High-level, @cmjs-tmpl specific, types. These types isolate us from the raw Strapi 5 data model

export interface ImageFormatDto {
  url: string;
  width: number;
  height: number;
}

export interface ImageDto {
  url: string;
  alt: string;
  width: number;
  height: number;
  mime: string;
  name?: string;
  caption?: string;
  formats?: Partial<Record<string, ImageFormatDto>>;
}

export interface TextDto {
  type: "text";
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

export interface LinkDto {
  type: "link";
  url: string;
  children: TextDto[];
}

export type InlineDto = TextDto | LinkDto;

export interface ParagraphBlockDto {
  type: "paragraph";
  children: InlineDto[];
}

export interface HeadingBlockDto {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: InlineDto[];
}

export interface ListItemDto {
  type: "list-item";
  children: InlineDto[];
}

export interface ListBlockDto {
  type: "list";
  format: "ordered" | "unordered";
  indentLevel?: number;
  children: (ListItemDto | ListBlockDto)[];
}

export interface QuoteBlockDto {
  type: "quote";
  children: InlineDto[];
}

export interface CodeBlockDto {
  type: "code";
  language?: string;
  children: InlineDto[];
}

export interface ImageBlockDto {
  type: "image";
  image: ImageDto;
}

export type BlockDto =
  | ParagraphBlockDto
  | HeadingBlockDto
  | ListBlockDto
  | QuoteBlockDto
  | CodeBlockDto
  | ImageBlockDto;

export type BlocksDto = BlockDto[];

export interface IdentityDto {
  slug: string;
  title: string;
}

export interface HeroDto {
  type: "hero";
  headline: string;
  subheading?: string;
  cta?: string;
  visual: ImageDto;
}

export interface SectionDto {
  type: "section";
  header?: string;
  hero?: ImageDto;
  content: BlocksDto;
}

export interface ArticleDto {
  pageType: "article";
  identity: IdentityDto;
  sections: SectionDto[];
}

export interface HomePageDto {
  pageType: "home-page";
  title: string;
  content: HeroDto[];
}

export interface EventDto {
  pageType: "event";
  identity: IdentityDto;
  summary: string;
  when?: string;
  content: BlocksDto;
}

export interface NewsDto {
  pageType: "news";
  identity: IdentityDto;
  summary: string;
  content: BlocksDto;
}

export type CmsPageDto = ArticleDto | HomePageDto | EventDto | NewsDto;

export type PageType = CmsPageDto["pageType"];
