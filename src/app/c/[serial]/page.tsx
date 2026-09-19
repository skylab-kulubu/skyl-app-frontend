type PublicCertificate = {
  serial: string;
  recipientName: string;
  eventName: string;
  ownerTeam: string;
  status: 'valid' | 'revoked';
  verifyUrl: string;
  pdfUrl?: string;
  issuedAt: string;
  revokedAt?: string;
};

const coreApi = (
  process.env.CORE_API_URL ??
  process.env.NEXT_PUBLIC_CORE_API_URL ??
  'https://api.yildizskylab.com'
).replace(/\/+$/, '');

async function certificate(serial: string): Promise<PublicCertificate | null> {
  const response = await fetch(
    `${coreApi}/v1/public/certificates/${encodeURIComponent(serial)}`,
    { cache: 'no-store' },
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error('certificate lookup failed');
  return (await response.json()) as PublicCertificate;
}

function StatusIcon({ valid }: { valid: boolean }) {
  return valid ? (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="m5 12 4 4L19 6"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.2"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d="M7 7l10 10M17 7 7 17"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2.2"
      />
    </svg>
  );
}

export default async function CertificateVerificationPage({
  params,
}: {
  params: Promise<{ serial: string }>;
}) {
  const { serial } = await params;
  let item: PublicCertificate | null = null;
  let unavailable = false;
  try {
    item = await certificate(serial);
  } catch {
    unavailable = true;
  }

  if (!item) {
    return (
      <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#08090d] p-5 text-white">
        <div className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(79,70,229,.28),transparent_70%)]" />
        <section className="relative w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/[.045] p-8 text-center shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-12">
          <p className="text-xs font-bold tracking-[.26em] text-indigo-300">SKY LAB</p>
          <div className="mx-auto mt-8 grid h-14 w-14 place-items-center rounded-full bg-red-500/10 text-red-300 ring-1 ring-red-400/25">
            <StatusIcon valid={false} />
          </div>
          <h1 className="mt-6 text-3xl font-black tracking-tight">
            {unavailable ? 'Doğrulama şu anda kullanılamıyor' : 'Sertifika bulunamadı'}
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {unavailable
              ? 'Lütfen biraz sonra tekrar dene.'
              : 'Bağlantıyı kontrol et. Bu kod SKY LAB kayıtlarında yer almıyor.'}
          </p>
          <p className="mt-8 break-all font-mono text-xs text-zinc-600">{serial}</p>
        </section>
      </main>
    );
  }

  const valid = item.status === 'valid';
  const team = item.ownerTeam === 'YK' || item.ownerTeam === 'DK' || !item.ownerTeam
    ? 'SKY LAB'
    : item.ownerTeam;

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#08090d] p-5 text-white">
      <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,rgba(79,70,229,.3),transparent_68%)]" />
      <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-fuchsia-700/10 blur-3xl" />
      <section className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.045] shadow-2xl shadow-black/50 backdrop-blur-xl">
        <div className="border-b border-white/10 px-7 py-6 sm:px-10">
          <p className="text-xs font-bold tracking-[.26em] text-indigo-300">SKY LAB</p>
        </div>
        <div className="px-7 py-8 sm:px-10 sm:py-10">
          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ring-1 ${
              valid
                ? 'bg-emerald-500/10 text-emerald-300 ring-emerald-400/25'
                : 'bg-red-500/10 text-red-300 ring-red-400/25'
            }`}
          >
            <StatusIcon valid={valid} />
            {valid ? 'Geçerli sertifika' : 'İptal edilmiş sertifika'}
          </div>
          <h1 className="mt-7 text-4xl font-black tracking-tight text-balance sm:text-6xl">
            {item.recipientName}
          </h1>
          <p className="mt-3 text-lg text-zinc-300 sm:text-xl">{item.eventName}</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
            {valid
              ? 'Bu sertifika SKY LAB kayıtlarıyla doğrulandı ve geçerlidir.'
              : 'Bu sertifika iptal edilmiştir ve artık geçerli bir belge olarak kullanılamaz.'}
          </p>

          <dl className="mt-9 grid gap-5 border-t border-white/10 pt-7 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold tracking-[.14em] text-zinc-600 uppercase">Düzenleyen</dt>
              <dd className="mt-2 font-semibold text-zinc-200">{team}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-[.14em] text-zinc-600 uppercase">Verilme tarihi</dt>
              <dd className="mt-2 font-semibold text-zinc-200">
                {new Intl.DateTimeFormat('tr-TR', { dateStyle: 'long' }).format(new Date(item.issuedAt))}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold tracking-[.14em] text-zinc-600 uppercase">Sertifika kodu</dt>
              <dd className="mt-2 break-all font-mono text-sm text-zinc-300">{item.serial}</dd>
            </div>
          </dl>

          {valid && item.pdfUrl ? (
            <a
              href={item.pdfUrl}
              className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-extrabold text-zinc-950 transition hover:bg-indigo-100 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none"
            >
              PDF sertifikayı indir
            </a>
          ) : null}
        </div>
      </section>
    </main>
  );
}
