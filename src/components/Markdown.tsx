import { ReactNode } from "react";

const inlinePattern = /(!\[[^\]]*]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

function Inline({ value }: { value: string }) {
  const nodes: ReactNode[] = value.split(inlinePattern).map((part, index) => {
    const image = part.match(/^!\[([^\]]*)]\(([^)]+)\)$/);
    if (image) {
      return <img key={index} src={image[2]} alt={image[1]} loading="lazy" />;
    }
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (/^\*[^*]+\*$/.test(part)) return <em key={index}>{part.slice(1, -1)}</em>;
    if (/^`[^`]+`$/.test(part)) return <code key={index}>{part.slice(1, -1)}</code>;

    return part.split("\n").flatMap((line, lineIndex, lines) =>
      lineIndex < lines.length - 1 ? [line, <br key={`${index}-${lineIndex}`} />] : [line],
    );
  });

  return <>{nodes}</>;
}

export function Markdown({ value }: { value: string }) {
  return (
    <>
      {value
        .split(/\n{2,}/)
        .filter(Boolean)
        .map((paragraph, index) => (
          <p key={index}>
            <Inline value={paragraph} />
          </p>
        ))}
    </>
  );
}

export function InlineMarkdown({ value }: { value: string }) {
  return <Inline value={value} />;
}
