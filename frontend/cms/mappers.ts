// A set of Strapi 5 Data Model to @cmsjs-tmpl functions that map the Strapi 5 model to ours
// This is LLM-generated.

import type {
  ArticleData,
  EventData,
  HomePageData,
  NewsData,
} from "@cmsjs/cms/client";
import type {
  ArticleDto,
  BlockDto,
  BlocksDto,
  CodeBlockDto,
  EventDto,
  HeadingBlockDto,
  HeroDto,
  HomePageDto,
  IdentityDto,
  ImageBlockDto,
  ImageDto,
  ImageFormatDto,
  InlineDto,
  LinkDto,
  ListBlockDto,
  ListItemDto,
  NewsDto,
  ParagraphBlockDto,
  QuoteBlockDto,
  SectionDto,
  TextDto,
} from "@cmsjs/cms/model";
import { ok, type Result, validationError } from "@cmsjs/cms/result";

function record(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

function array(value: unknown): unknown[] | undefined {
  return Array.isArray(value) ? value : undefined;
}

function requiredString(
  node: Record<string, unknown>,
  field: string,
  path: string,
  problems: string[],
): string | undefined {
  const value = node[field];
  if (typeof value !== "string") {
    problems.push(`expected string at ${path}.${field}`);
    return undefined;
  }
  return value;
}

function optionalString(
  node: Record<string, unknown>,
  field: string,
  path: string,
  problems: string[],
): string | undefined {
  const value = node[field];
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "string") {
    problems.push(`expected string at ${path}.${field}`);
    return undefined;
  }
  return value;
}

function requiredNumber(
  node: Record<string, unknown>,
  field: string,
  path: string,
  problems: string[],
): number | undefined {
  const value = node[field];
  if (typeof value !== "number") {
    problems.push(`expected number at ${path}.${field}`);
    return undefined;
  }
  return value;
}

function optionalNumber(
  node: Record<string, unknown>,
  field: string,
  path: string,
  problems: string[],
): number | undefined {
  const value = node[field];
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "number") {
    problems.push(`expected number at ${path}.${field}`);
    return undefined;
  }
  return value;
}

function optionalBoolean(
  node: Record<string, unknown>,
  field: string,
  path: string,
  problems: string[],
): boolean | undefined {
  const value = node[field];
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value !== "boolean") {
    problems.push(`expected boolean at ${path}.${field}`);
    return undefined;
  }
  return value;
}

function freezeDeep<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      freezeDeep(item);
    }
    return Object.freeze(value);
  }
  const node = value as Record<string, unknown>;
  for (const key of Object.keys(node)) {
    freezeDeep(node[key]);
  }
  return Object.freeze(value);
}

function mapResource<T>(
  resource: string,
  raw: unknown,
  parse: (value: unknown, path: string, problems: string[]) => T | undefined,
): Result<T> {
  const problems: string[] = [];
  const parsed = parse(raw, "$", problems);
  if (parsed === undefined || problems.length > 0) {
    return validationError({ resource }, problems);
  }
  return ok(parsed);
}

function imageFormat(
  value: unknown,
  path: string,
  problems: string[],
): ImageFormatDto | undefined {
  const node = record(value);
  if (!node) {
    problems.push(`expected object at ${path}`);
    return undefined;
  }
  const url = requiredString(node, "url", path, problems);
  const width = requiredNumber(node, "width", path, problems);
  const height = requiredNumber(node, "height", path, problems);
  if (url === undefined || width === undefined || height === undefined) {
    return undefined;
  }
  return freezeDeep<ImageFormatDto>({ url, width, height });
}

function image(
  value: unknown,
  path: string,
  problems: string[],
): ImageDto | undefined {
  const node = record(value);
  if (!node) {
    problems.push(`expected object at ${path}`);
    return undefined;
  }
  const url = requiredString(node, "url", path, problems);
  const width = requiredNumber(node, "width", path, problems);
  const height = requiredNumber(node, "height", path, problems);
  const mime = requiredString(node, "mime", path, problems);
  if (
    url === undefined ||
    width === undefined ||
    height === undefined ||
    mime === undefined
  ) {
    return undefined;
  }
  const name = optionalString(node, "name", path, problems);
  const caption = optionalString(node, "caption", path, problems);
  const alt = optionalString(node, "alternativeText", path, problems);
  let formats: Partial<Record<string, ImageFormatDto>> | undefined;
  if (node.formats !== undefined && node.formats !== null) {
    const formatNode = record(node.formats);
    if (!formatNode) {
      problems.push(`expected object at ${path}.formats`);
      return undefined;
    }
    const parsedFormats: Record<string, ImageFormatDto> = {};
    for (const key of Object.keys(formatNode)) {
      const format = imageFormat(
        formatNode[key],
        `${path}.formats.${key}`,
        problems,
      );
      if (format === undefined) {
        return undefined;
      }
      parsedFormats[key] = format;
    }
    formats =
      freezeDeep<Partial<Record<string, ImageFormatDto>>>(parsedFormats);
  }
  return freezeDeep<ImageDto>({
    url,
    alt: alt ?? "",
    width,
    height,
    mime,
    ...(name !== undefined ? { name } : {}),
    ...(caption !== undefined ? { caption } : {}),
    ...(formats !== undefined ? { formats } : {}),
  });
}

function withMarks(
  node: Record<string, unknown>,
  path: string,
  problems: string[],
): Pick<TextDto, "bold" | "italic" | "underline" | "strikethrough" | "code"> {
  const marks: Partial<
    Pick<TextDto, "bold" | "italic" | "underline" | "strikethrough" | "code">
  > = {};
  for (const mark of [
    "bold",
    "italic",
    "underline",
    "strikethrough",
    "code",
  ] as const) {
    const value = optionalBoolean(node, mark, path, problems);
    if (value !== undefined) {
      marks[mark] = value;
    }
  }
  return marks;
}

function textNode(
  node: Record<string, unknown>,
  path: string,
  problems: string[],
): TextDto | undefined {
  const text = requiredString(node, "text", path, problems);
  if (text === undefined) {
    return undefined;
  }
  return freezeDeep<TextDto>({
    type: "text",
    text,
    ...withMarks(node, path, problems),
  });
}

function linkNode(
  node: Record<string, unknown>,
  path: string,
  problems: string[],
): LinkDto | undefined {
  const url = requiredString(node, "url", path, problems);
  const children = linkChildren(node, path, problems);
  if (url === undefined || children === undefined) {
    return undefined;
  }
  return freezeDeep<LinkDto>({ type: "link", url, children });
}

function linkChildren(
  node: Record<string, unknown>,
  path: string,
  problems: string[],
): TextDto[] | undefined {
  const raw = array(node.children);
  if (!raw) {
    problems.push(`expected array at ${path}.children`);
    return undefined;
  }
  const children: TextDto[] = [];
  for (let i = 0; i < raw.length; i++) {
    const child = record(raw[i]);
    if (!child) {
      problems.push(`expected object at ${path}.children[${i}]`);
      return undefined;
    }
    const childType = requiredString(
      child,
      "type",
      `${path}.children[${i}]`,
      problems,
    );
    if (childType !== "text") {
      return undefined;
    }
    const text = textNode(child, `${path}.children[${i}]`, problems);
    if (text === undefined) {
      return undefined;
    }
    children.push(text);
  }
  return freezeDeep<TextDto[]>(children);
}

function inlineChildren(
  node: Record<string, unknown>,
  path: string,
  problems: string[],
): InlineDto[] | undefined {
  const raw = array(node.children);
  if (!raw) {
    problems.push(`expected array at ${path}.children`);
    return undefined;
  }
  const children: InlineDto[] = [];
  for (let i = 0; i < raw.length; i++) {
    const child = parseInline(raw[i], `${path}.children[${i}]`, problems);
    if (child === undefined) {
      return undefined;
    }
    children.push(child);
  }
  return freezeDeep<InlineDto[]>(children);
}

function parseInline(
  value: unknown,
  path: string,
  problems: string[],
): InlineDto | undefined {
  const node = record(value);
  if (!node) {
    problems.push(`expected object at ${path}`);
    return undefined;
  }
  const type = requiredString(node, "type", path, problems);
  if (type === undefined) {
    return undefined;
  }
  switch (type) {
    case "text":
      return textNode(node, path, problems);
    case "link":
      return linkNode(node, path, problems);
    default:
      problems.push(`unsupported inline node "${type}" at ${path}`);
      return undefined;
  }
}

function paragraph(
  value: unknown,
  path: string,
  problems: string[],
): ParagraphBlockDto | undefined {
  const node = record(value);
  if (!node) {
    problems.push(`expected object at ${path}`);
    return undefined;
  }
  const children = inlineChildren(node, path, problems);
  if (children === undefined) {
    return undefined;
  }
  return freezeDeep<ParagraphBlockDto>({ type: "paragraph", children });
}

function heading(
  value: unknown,
  path: string,
  problems: string[],
): HeadingBlockDto | undefined {
  const node = record(value);
  if (!node) {
    problems.push(`expected object at ${path}`);
    return undefined;
  }
  const level = requiredNumber(node, "level", path, problems);
  if (level === undefined) {
    return undefined;
  }
  if (level < 1 || level > 6) {
    problems.push(`expected level between 1 and 6 at ${path}.level`);
    return undefined;
  }
  const children = inlineChildren(node, path, problems);
  if (children === undefined) {
    return undefined;
  }
  return freezeDeep<HeadingBlockDto>({
    type: "heading",
    level: level as HeadingBlockDto["level"],
    children,
  });
}

function quote(
  value: unknown,
  path: string,
  problems: string[],
): QuoteBlockDto | undefined {
  const node = record(value);
  if (!node) {
    problems.push(`expected object at ${path}`);
    return undefined;
  }
  const children = inlineChildren(node, path, problems);
  if (children === undefined) {
    return undefined;
  }
  return freezeDeep<QuoteBlockDto>({ type: "quote", children });
}

function codeBlock(
  value: unknown,
  path: string,
  problems: string[],
): CodeBlockDto | undefined {
  const node = record(value);
  if (!node) {
    problems.push(`expected object at ${path}`);
    return undefined;
  }
  const language = optionalString(node, "language", path, problems);
  const children = inlineChildren(node, path, problems);
  if (children === undefined) {
    return undefined;
  }
  return freezeDeep<CodeBlockDto>({
    type: "code",
    ...(language !== undefined ? { language } : {}),
    children,
  });
}

function imageBlock(
  value: unknown,
  path: string,
  problems: string[],
): ImageBlockDto | undefined {
  const node = record(value);
  if (!node) {
    problems.push(`expected object at ${path}`);
    return undefined;
  }
  const imageDto = image(node.image, `${path}.image`, problems);
  if (imageDto === undefined) {
    return undefined;
  }
  return freezeDeep<ImageBlockDto>({ type: "image", image: imageDto });
}

function listItem(
  node: Record<string, unknown>,
  path: string,
  problems: string[],
): ListItemDto | undefined {
  const children = inlineChildren(node, path, problems);
  if (children === undefined) {
    return undefined;
  }
  return freezeDeep<ListItemDto>({ type: "list-item", children });
}

function listBlock(
  value: unknown,
  path: string,
  problems: string[],
): ListBlockDto | undefined {
  const node = record(value);
  if (!node) {
    problems.push(`expected object at ${path}`);
    return undefined;
  }
  const format = requiredString(node, "format", path, problems);
  if (format !== "ordered" && format !== "unordered") {
    problems.push(`expected "ordered" or "unordered" at ${path}.format`);
    return undefined;
  }
  const indentLevel = optionalNumber(node, "indentLevel", path, problems);
  const children = listChildren(node, path, problems);
  if (children === undefined) {
    return undefined;
  }
  return freezeDeep<ListBlockDto>({
    type: "list",
    format,
    ...(indentLevel !== undefined ? { indentLevel } : {}),
    children,
  });
}

function listChildren(
  node: Record<string, unknown>,
  path: string,
  problems: string[],
): (ListItemDto | ListBlockDto)[] | undefined {
  const raw = array(node.children);
  if (!raw) {
    problems.push(`expected array at ${path}.children`);
    return undefined;
  }
  const children: (ListItemDto | ListBlockDto)[] = [];
  for (let i = 0; i < raw.length; i++) {
    const child = parseListChild(raw[i], `${path}.children[${i}]`, problems);
    if (child === undefined) {
      return undefined;
    }
    children.push(child);
  }
  return freezeDeep<(ListItemDto | ListBlockDto)[]>(children);
}

function parseListChild(
  value: unknown,
  path: string,
  problems: string[],
): ListItemDto | ListBlockDto | undefined {
  const node = record(value);
  if (!node) {
    problems.push(`expected object at ${path}`);
    return undefined;
  }
  const type = requiredString(node, "type", path, problems);
  if (type === undefined) {
    return undefined;
  }
  switch (type) {
    case "list-item":
      return listItem(node, path, problems);
    case "list":
      return listBlock(value, path, problems);
    default:
      problems.push(`unsupported list child "${type}" at ${path}`);
      return undefined;
  }
}

function parseBlock(
  value: unknown,
  path: string,
  problems: string[],
): BlockDto | undefined {
  const node = record(value);
  if (!node) {
    problems.push(`expected object at ${path}`);
    return undefined;
  }
  const type = requiredString(node, "type", path, problems);
  if (type === undefined) {
    return undefined;
  }
  switch (type) {
    case "paragraph":
      return paragraph(value, path, problems);
    case "heading":
      return heading(value, path, problems);
    case "list":
      return listBlock(value, path, problems);
    case "quote":
      return quote(value, path, problems);
    case "code":
      return codeBlock(value, path, problems);
    case "image":
      return imageBlock(value, path, problems);
    default:
      problems.push(`unsupported block "${type}" at ${path}`);
      return undefined;
  }
}

function blocks(
  value: unknown,
  path: string,
  problems: string[],
): BlocksDto | undefined {
  const raw = array(value);
  if (!raw) {
    problems.push(`expected array at ${path}`);
    return undefined;
  }
  const parsed: BlockDto[] = [];
  for (let i = 0; i < raw.length; i++) {
    const block = parseBlock(raw[i], `${path}[${i}]`, problems);
    if (block === undefined) {
      return undefined;
    }
    parsed.push(block);
  }
  return freezeDeep<BlocksDto>(parsed);
}

function identity(
  value: unknown,
  path: string,
  problems: string[],
): IdentityDto | undefined {
  const node = record(value);
  if (!node) {
    problems.push(`expected object at ${path}`);
    return undefined;
  }
  const slug = requiredString(node, "slug", path, problems);
  const title = requiredString(node, "title", path, problems);
  if (slug === undefined || title === undefined) {
    return undefined;
  }
  return freezeDeep<IdentityDto>({ slug, title });
}

function hero(
  value: unknown,
  path: string,
  problems: string[],
): HeroDto | undefined {
  const node = record(value);
  if (!node) {
    problems.push(`expected object at ${path}`);
    return undefined;
  }
  const headline = requiredString(node, "headline", path, problems);
  const visual = image(node.visual, `${path}.visual`, problems);
  if (headline === undefined || visual === undefined) {
    return undefined;
  }
  const subheading = optionalString(node, "subheading", path, problems);
  const cta = optionalString(node, "cta", path, problems);
  return freezeDeep<HeroDto>({
    type: "hero",
    headline,
    ...(subheading !== undefined ? { subheading } : {}),
    ...(cta !== undefined ? { cta } : {}),
    visual,
  });
}

function section(
  value: unknown,
  path: string,
  problems: string[],
): SectionDto | undefined {
  const node = record(value);
  if (!node) {
    problems.push(`expected object at ${path}`);
    return undefined;
  }
  const header = optionalString(node, "header", path, problems);
  const heroImage =
    node.hero == null ? undefined : image(node.hero, `${path}.hero`, problems);
  if (node.hero != null && heroImage === undefined) {
    return undefined;
  }
  const content = blocks(node.content, `${path}.content`, problems);
  if (content === undefined) {
    return undefined;
  }
  return freezeDeep<SectionDto>({
    type: "section",
    ...(header !== undefined ? { header } : {}),
    ...(heroImage !== undefined ? { hero: heroImage } : {}),
    content,
  });
}

function sectionEntries(
  value: unknown,
  path: string,
  problems: string[],
): SectionDto[] | undefined {
  const raw = array(value);
  if (!raw) {
    problems.push(`expected array at ${path}`);
    return undefined;
  }
  const parsed: SectionDto[] = [];
  for (let i = 0; i < raw.length; i++) {
    const entry = section(raw[i], `${path}[${i}]`, problems);
    if (entry === undefined) {
      return undefined;
    }
    parsed.push(entry);
  }
  return freezeDeep<SectionDto[]>(parsed);
}

function heroEntries(
  value: unknown,
  path: string,
  problems: string[],
): HeroDto[] | undefined {
  const raw = array(value);
  if (!raw) {
    problems.push(`expected array at ${path}`);
    return undefined;
  }
  const parsed: HeroDto[] = [];
  for (let i = 0; i < raw.length; i++) {
    const entry = hero(raw[i], `${path}[${i}]`, problems);
    if (entry === undefined) {
      return undefined;
    }
    parsed.push(entry);
  }
  return freezeDeep<HeroDto[]>(parsed);
}

function article(
  value: unknown,
  path: string,
  problems: string[],
): ArticleDto | undefined {
  const node = record(value);
  if (!node) {
    problems.push(`expected object at ${path}`);
    return undefined;
  }
  const identityDto = identity(node.identity, `${path}.identity`, problems);
  if (identityDto === undefined) {
    return undefined;
  }
  const sections = sectionEntries(node.sections, `${path}.sections`, problems);
  if (sections === undefined) {
    return undefined;
  }
  return freezeDeep<ArticleDto>({
    pageType: "article",
    identity: identityDto,
    sections,
  });
}

function homePage(
  value: unknown,
  path: string,
  problems: string[],
): HomePageDto | undefined {
  const node = record(value);
  if (!node) {
    problems.push(`expected object at ${path}`);
    return undefined;
  }
  const title = requiredString(node, "title", path, problems);
  const content = heroEntries(node.content, `${path}.content`, problems);
  if (title === undefined || content === undefined) {
    return undefined;
  }
  return freezeDeep<HomePageDto>({ pageType: "home-page", title, content });
}

function event(
  value: unknown,
  path: string,
  problems: string[],
): EventDto | undefined {
  const node = record(value);
  if (!node) {
    problems.push(`expected object at ${path}`);
    return undefined;
  }
  const identityDto = identity(node.identity, `${path}.identity`, problems);
  if (identityDto === undefined) {
    return undefined;
  }
  const summary = requiredString(node, "summary", path, problems);
  const when = optionalString(node, "when", path, problems);
  const content = blocks(node.content, `${path}.content`, problems);
  if (summary === undefined || content === undefined) {
    return undefined;
  }
  return freezeDeep<EventDto>({
    pageType: "event",
    identity: identityDto,
    summary,
    ...(when !== undefined ? { when } : {}),
    content,
  });
}

function news(
  value: unknown,
  path: string,
  problems: string[],
): NewsDto | undefined {
  const node = record(value);
  if (!node) {
    problems.push(`expected object at ${path}`);
    return undefined;
  }
  const identityDto = identity(node.identity, `${path}.identity`, problems);
  if (identityDto === undefined) {
    return undefined;
  }
  const summary = requiredString(node, "summary", path, problems);
  const content = blocks(node.content, `${path}.content`, problems);
  if (summary === undefined || content === undefined) {
    return undefined;
  }
  return freezeDeep<NewsDto>({
    pageType: "news",
    identity: identityDto,
    summary,
    content,
  });
}

export function toArticleDto(
  raw: ArticleData,
  mediaBaseUrl: string,
): Result<ArticleDto> {
  return normalizeResult(mapResource("article", raw, article), (value) => ({
    ...value,
    sections: value.sections.map((entry) =>
      normalizeSection(entry, mediaBaseUrl),
    ),
  }));
}

export function toHomePageDto(
  raw: HomePageData,
  mediaBaseUrl: string,
): Result<HomePageDto> {
  return normalizeResult(mapResource("home-page", raw, homePage), (value) => ({
    ...value,
    content: value.content.map((entry) => normalizeHero(entry, mediaBaseUrl)),
  }));
}

export function toEventDto(
  raw: EventData,
  mediaBaseUrl: string,
): Result<EventDto> {
  return normalizeResult(mapResource("event", raw, event), (value) => ({
    ...value,
    content: normalizeBlocks(value.content, mediaBaseUrl),
  }));
}

export function toNewsDto(
  raw: NewsData,
  mediaBaseUrl: string,
): Result<NewsDto> {
  return normalizeResult(mapResource("news", raw, news), (value) => ({
    ...value,
    content: normalizeBlocks(value.content, mediaBaseUrl),
  }));
}

function normalizeResult<T>(
  result: Result<T>,
  normalize: (value: T) => T,
): Result<T> {
  return result.ok ? ok(freezeDeep(normalize(result.value))) : result;
}

function normalizeHero(value: HeroDto, mediaBaseUrl: string): HeroDto {
  return { ...value, visual: normalizeImage(value.visual, mediaBaseUrl) };
}

function normalizeSection(value: SectionDto, mediaBaseUrl: string): SectionDto {
  return {
    ...value,
    ...(value.hero ? { hero: normalizeImage(value.hero, mediaBaseUrl) } : {}),
    content: normalizeBlocks(value.content, mediaBaseUrl),
  };
}

function normalizeBlocks(value: BlocksDto, mediaBaseUrl: string): BlocksDto {
  return value.map((block) =>
    block.type === "image"
      ? { ...block, image: normalizeImage(block.image, mediaBaseUrl) }
      : block,
  );
}

function normalizeImage(value: ImageDto, mediaBaseUrl: string): ImageDto {
  return {
    ...value,
    url: new URL(value.url, mediaBaseUrl).href,
    ...(value.formats
      ? {
          formats: Object.fromEntries(
            Object.entries(value.formats).map(([name, format]) => [
              name,
              format
                ? { ...format, url: new URL(format.url, mediaBaseUrl).href }
                : format,
            ]),
          ),
        }
      : {}),
  };
}
