import type {
  BlockDto,
  BlocksDto,
  HeroDto,
  ImageDto,
  InlineDto,
  ListBlockDto,
  SectionDto,
  TextDto,
} from "@cmsjs/cms/model";
import Image from "next/image";
import type { ReactNode } from "react";

export function Hero({ hero }: { hero: HeroDto }) {
  return (
    <section>
      <h2>{hero.headline}</h2>
      {hero.subheading && <p>{hero.subheading}</p>}
      <CmsImage loading="eager" image={hero.visual} />
      {hero.cta && <p>{hero.cta}</p>}
    </section>
  );
}

export function Section({ section }: { section: SectionDto }) {
  return (
    <section>
      {section.header && <h2>{section.header}</h2>}
      {section.hero && <CmsImage image={section.hero} />}
      <Blocks blocks={section.content} />
    </section>
  );
}

export function Blocks({ blocks }: { blocks: BlocksDto }) {
  return blocks.map((block, index) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: Strapi blocks have no stable IDs and never reorder client-side.
    <Block block={block} key={index} />
  ));
}

function Block({ block }: { block: BlockDto }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p>
          <Inline nodes={block.children} />
        </p>
      );
    case "heading":
      return <Heading level={block.level} nodes={block.children} />;
    case "list":
      return <List list={block} />;
    case "quote":
      return (
        <blockquote>
          <Inline nodes={block.children} />
        </blockquote>
      );
    case "code":
      return (
        <pre>
          <code>
            <Inline nodes={block.children} />
          </code>
        </pre>
      );
    case "image":
      return <CmsImage image={block.image} />;
  }
}

function Heading({
  level,
  nodes,
}: {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  nodes: InlineDto[];
}) {
  const content = <Inline nodes={nodes} />;
  switch (level) {
    case 1:
      return <h1>{content}</h1>;
    case 2:
      return <h2>{content}</h2>;
    case 3:
      return <h3>{content}</h3>;
    case 4:
      return <h4>{content}</h4>;
    case 5:
      return <h5>{content}</h5>;
    case 6:
      return <h6>{content}</h6>;
  }
}

function List({ list }: { list: ListBlockDto }) {
  const children = list.children.map((item, index) =>
    item.type === "list" ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: Strapi list nodes have no stable IDs and never reorder client-side.
      <List key={index} list={item} />
    ) : (
      // biome-ignore lint/suspicious/noArrayIndexKey: Strapi list nodes have no stable IDs and never reorder client-side.
      <li key={index}>
        <Inline nodes={item.children} />
      </li>
    ),
  );
  return list.format === "ordered" ? <ol>{children}</ol> : <ul>{children}</ul>;
}

function Inline({ nodes }: { nodes: InlineDto[] }) {
  return nodes.map((node, index) =>
    node.type === "link" ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: Strapi inline nodes have no stable IDs and never reorder client-side.
      <a href={node.url} key={index}>
        <Inline nodes={node.children} />
      </a>
    ) : (
      // biome-ignore lint/suspicious/noArrayIndexKey: Strapi inline nodes have no stable IDs and never reorder client-side.
      <Text key={index} text={node} />
    ),
  );
}

function Text({ text }: { text: TextDto }) {
  let content: ReactNode = text.text;
  if (text.code) content = <code>{content}</code>;
  if (text.bold) content = <strong>{content}</strong>;
  if (text.italic) content = <em>{content}</em>;
  if (text.underline) content = <u>{content}</u>;
  if (text.strikethrough) content = <s>{content}</s>;
  return content;
}

function CmsImage({
  image,
  loading,
}: {
  image: ImageDto;
  loading?: "eager" | "lazy" | undefined;
}) {
  return (
    <Image
      alt={image.alt}
      height={image.height}
      src={image.url}
      width={image.width}
      loading={loading}
    />
  );
}
