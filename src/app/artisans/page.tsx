import { redirect } from "next/navigation";

interface ArtisansPageProps {
  searchParams: Promise<{
    category?: string;
    location?: string;
    q?: string;
  }>;
}

export default async function ArtisansPage({ searchParams }: ArtisansPageProps) {
  const params = await searchParams;
  const queryParts: string[] = [];

  if (params.category) queryParts.push(`category=${encodeURIComponent(params.category)}`);
  if (params.location) queryParts.push(`location=${encodeURIComponent(params.location)}`);
  if (params.q) queryParts.push(`q=${encodeURIComponent(params.q)}`);

  const queryString = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
  redirect(`/find-artisans${queryString}`);
}
