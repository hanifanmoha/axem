import Link from "next/link";
import { SourceForm } from "@/components/SourceForm";
import { Topbar } from "@/components/Topbar";

export default function Home() {
  return (
    <>
      <Topbar>
        <SourceForm />
      </Topbar>

      <main>
        <section className="welcome">
          <h1>Practice from any bundle.</h1>
          <p>
            Paste the URL of a Markdown quiz bundle, such as one hosted on GitHub. Axem fetches it
            and turns it into a focused practice session.
          </p>
          <Link className="button" href="/docs">
            Read the documentation
          </Link>
        </section>
      </main>
    </>
  );
}
