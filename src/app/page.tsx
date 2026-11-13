import { SourceForm } from "@/components/SourceForm";
import { Welcome } from "@/components/Welcome";
import { Topbar } from "@/components/Topbar";

export default function Home() {
  return (
    <>
      <Topbar>
        <SourceForm />
      </Topbar>

      <main>
        <Welcome />
      </main>
    </>
  );
}
