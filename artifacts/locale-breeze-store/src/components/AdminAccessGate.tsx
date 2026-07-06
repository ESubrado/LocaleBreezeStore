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
    <section className="relative z-10 mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 lg:py-8">
      <div className="rounded-3xl bg-white/5 px-5 py-4 ring-1 ring-white/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Current session
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-foreground">
              {session.email}
            </p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Logged in
              </dt>
              <dd className="mt-1 truncate text-sm text-slate-300">
                {formatSessionDate(session.loggedInAt)}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Role
              </dt>
              <dd className="mt-1 truncate text-sm capitalize text-slate-300">
                {session.role}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                User ID
              </dt>
              <dd className="mt-1 truncate text-xs text-slate-400">
                {session.userId}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Expires
              </dt>
              <dd className="mt-1 truncate text-sm text-slate-300">
                {formatSessionDate(session.expiresAt)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
