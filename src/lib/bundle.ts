export type BundleLink = {
  label: string;
  url: string;
};

export type Choice = {
  text: string;
  correct: boolean;
};

export type Question = {
  title: string;
  prompt: string;
  choices: Choice[];
  explanation?: string;
};

export type BundleDocument =
  | { kind: "index"; title: string; links: BundleLink[] }
  | { kind: "quiz"; title: string; questions: Question[] };

function frontMatter(markdown: string) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { fields: new Map<string, string>(), body: markdown };

  const fields = new Map(
    match[1]
      .split(/\r?\n/)
      .map((line) => line.match(/^([^:]+):\s*(.+)$/))
      .filter((entry): entry is RegExpMatchArray => entry !== null)
      .map(([, key, value]): [string, string] => [key.trim(), value.trim()]),
  );

  return { fields, body: markdown.slice(match[0].length) };
}

function documentTitle(markdown: string, fallback: string) {
  return markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? fallback;
}

function resolveUrl(href: string, baseUrl: string) {
  return new URL(href, baseUrl).toString();
}

function resolveImages(markdown: string, baseUrl: string) {
  return markdown.replace(/(!\[[^\]]*]\()([^)]+)(\))/g, (_, start, href, end) => {
    return `${start}${resolveUrl(href, baseUrl)}${end}`;
  });
}

export function parseBundleDocument(markdown: string, sourceUrl: string): BundleDocument {
  const { fields, body } = frontMatter(markdown);
  const title = fields.get("title") ?? documentTitle(body, "Untitled bundle");

  if (fields.get("type") !== "quiz") {
    const links = [...body.matchAll(/^\s*[-*]\s+\[([^\]]+)\]\(([^)]+)\)/gm)].map(
      ([, label, href]) => ({
        label: label.trim(),
        url: resolveUrl(href.trim(), sourceUrl),
      }),
    );
    return { kind: "index", title, links };
  }

  const headings = [...body.matchAll(/^##\s+(?:Question\s+)?(.+)$/gm)];
  const questions = headings.map((heading, index) => {
    const questionTitle = heading[1];
    const sectionStart = (heading.index ?? 0) + heading[0].length;
    const sectionEnd = headings[index + 1]?.index ?? body.length;
    const section = body.slice(sectionStart, sectionEnd);
    const choiceMatches = [...section.matchAll(/^\s*-\s+\[([ xX])\]\s+(.+)$/gm)];
    const firstChoice = choiceMatches[0]?.index ?? section.length;
    const prompt = resolveImages(section.slice(0, firstChoice).trim(), sourceUrl);
    const explanationMatch = section.match(
      /^>\s+(?:\*\*)?Explanation:?(?:\*\*)?\s*(.+(?:\r?\n>\s+.+)*)$/m,
    );

    const explanation = explanationMatch?.[1]
      .replace(/\r?\n>\s?/g, "\n")
      .trim();

    return {
      title: questionTitle.trim(),
      prompt,
      choices: choiceMatches.map(([, checked, text]) => ({
        correct: checked.toLowerCase() === "x",
        text: resolveImages(text.trim(), sourceUrl),
      })),
      explanation: explanation ? resolveImages(explanation, sourceUrl) : undefined,
    };
  });

  return { kind: "quiz", title, questions };
}
