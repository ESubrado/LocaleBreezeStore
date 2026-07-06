type AdminPageSession = {
  email: string;
  expiresAt?: string;
  loggedInAt?: string;
  role: string;
  userId: string;
};

function formatSessionDate(value?: string) {
  return value ? new Date(value).toLocaleString() : "Unavailable";
}

export default function AdminAccessGate({
  session,
}: {
  session: AdminPageSession;
}) {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-5 sm:px-8 lg:py-6">
      <div className="rounded-md border border-border bg-card px-4 py-3 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-normal text-primary">
              Current session
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-foreground">
              {session.email}
            </p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                Logged in
              </dt>
              <dd className="mt-1 truncate text-sm text-foreground">
                {formatSessionDate(session.loggedInAt)}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                Role
              </dt>
              <dd className="mt-1 truncate text-sm capitalize text-foreground">
                {session.role}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                User ID
              </dt>
              <dd className="mt-1 truncate text-xs text-muted-foreground">
                {session.userId}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                Expires
              </dt>
              <dd className="mt-1 truncate text-sm text-foreground">
                {formatSessionDate(session.expiresAt)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
