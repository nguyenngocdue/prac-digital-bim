import Link from "next/link";

type Props = {
  searchParams?: { [key: string]: string | string[] | undefined };
};

export default function ProjectPage({ searchParams }: Props) {
  const id = Array.isArray(searchParams?.id) ? searchParams?.id[0] : searchParams?.id;

  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Project</h2>
        {id ? (
          <div className="rounded-md border p-4 bg-card">
            <p className="text-sm text-muted-foreground mb-2">Project ID (from query)</p>
            <pre className="break-all">{id}</pre>
          </div>
        ) : (
          <div className="rounded-md border p-4 bg-card text-muted-foreground">No project id provided. Pass ?id=UUID</div>
        )}

        <div className="mt-6 flex gap-2">
          <Link href="/" className="underline">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
