import { Topbar } from "@/components/Topbar";
import { Viewer } from "@/components/Viewer";

export default async function SourcePage({
  params,
}: {
  params: Promise<{ source: string }>;
}) {
  const { source } = await params;

  return (
    <>
      <Topbar />
      <main>
        <Viewer encoded={source} />
      </main>
    </>
  );
}
