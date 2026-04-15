import DramaDetailClient from "./DramaDetailClient";

export default async function DramaDetailPage({ params, searchParams }) {
  // Next.js 16: `params`/`searchParams` bisa berupa Promise (sync dynamic APIs)
  const awaitedParams = params?.then ? await params : params;
  const awaitedSearchParams = searchParams?.then ? await searchParams : searchParams;

  const id = awaitedParams?.id;

  const initialDrama = {
    id,
    title: awaitedSearchParams?.title,
    cover_image: awaitedSearchParams?.cover,
    introduction: awaitedSearchParams?.intro,
    episode_count: awaitedSearchParams?.episodes
      ? Number(awaitedSearchParams.episodes)
      : undefined,
    tags: awaitedSearchParams?.tags
      ? String(awaitedSearchParams.tags).split(",").filter(Boolean)
      : [],
  };

  return <DramaDetailClient id={id} initialDrama={initialDrama} />;
}
