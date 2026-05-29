import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: "Nexa Motion · Workout",
    description: "A custom running workout built with Nexa Motion.",
    openGraph: {
      title: "Nexa Motion · Workout",
      description: "A custom running workout built with Nexa Motion.",
      images: [
        {
          url: "/nexa-logo.png",
          width: 1254,
          height: 1254,
          alt: "Nexa Motion",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Nexa Motion · Workout",
      description: "A custom running workout built with Nexa Motion.",
      images: ["/nexa-logo.png"],
    },
    other: { "x-share-id": id },
  };
}

export default async function SharePage({ params }: PageProps) {
  await params;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center bg-background relative overflow-hidden">
      {/* Ambient background blobs */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(168,85,247,0.18),transparent_60%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_80%_100%,rgba(59,130,246,0.12),transparent_60%)]"
      />

      <div className="relative inline-flex items-center justify-center mb-6 rounded-3xl overflow-hidden border border-white/10 shadow-glass">
        <Image
          src="/nexa-logo.png"
          alt="Nexa Motion"
          width={120}
          height={120}
          priority
        />
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-white text-balance gradient-text">
        Nexa Motion
      </h1>
      <p className="mt-3 text-[14px] text-text-secondary max-w-[340px] leading-relaxed text-balance">
        Someone shared a workout with you. Open the app to view the full plan
        and clone it to your own training schedule.
      </p>

      <Link
        href="/"
        className="btn-primary mt-7 px-5 py-3 inline-flex items-center justify-center gap-2 font-semibold text-[14px]"
      >
        Open Nexa Motion
      </Link>

      <p className="mt-10 text-[10px] uppercase tracking-[0.22em] text-text-muted font-semibold">
        Intelligent training, elevated
      </p>
    </div>
  );
}
