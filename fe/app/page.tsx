// frontend/app/page.tsx
import Image from "next/image";
interface BackendData {
  message: string;
  timestamp: string;
}

// Tipe untuk hasil error dari proses fetch
type FetchError = {
  message: string;
  error: string;
};

// Tipe gabungan: hasil bisa sukses ATAU error
type FetchResult = BackendData | FetchError;

async function getData(): Promise<FetchResult> {
  try {
    const res = await fetch("http://localhost:5000/api/data", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Gagal mengambil data dari server: ${res.status}`);
    }
    const jsonData = await res.json();
    return jsonData as BackendData;
  } catch (error) {
    console.error("Terjadi kesalahan saat koneksi ke back end:", error);
    return {
      message: "Tidak dapat terhubung ke server Express.js.",
      error: (error as Error).message || "Kesalahan tidak diketahui",
    } as FetchError;
  }
}
const DataDisplay = ({ data }: { data: FetchResult }) => (
  <div className="mt-8 p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg w-full">
    <h2 className="text-xl font-bold mb-2 text-black dark:text-zinc-50">
      Data dari Back-end:
    </h2>

    {/* Type Guard: Memeriksa apakah properti 'error' ada di objek data */}
    {"error" in data ? (
      // Kasus 1: Tampilkan Pesan Error
      <p className="text-red-500">❌ Error Koneksi: {data.message}</p>
    ) : (
      // Kasus 2: Tampilkan Data JSON yang sukses diambil
      <pre className="text-sm text-zinc-700 dark:text-zinc-300 overflow-x-auto bg-zinc-100 dark:bg-zinc-900 p-2 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    )}
  </div>
);

// ======================================================================
// 3. KOMPONEN UTAMA HALAMAN (Server Component)
// ======================================================================
export default async function HomePage() {
  const data = await getData();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Aplikasi Next.js & Express.js Berjalan!
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Next.js (FE) berusaha mengambil data dari Express.js (BE) di port
            5000.
          </p>

          <DataDisplay data={data} />
        </div>

        {/* Konten link-link di bawah tetap sama */}
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
