import { ShareViewSkin } from "@/components/skins/minimal/ShareViewSkin";
import { getShareViewByToken } from "@/services/magicLinkService";

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getShareViewByToken(token);

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <p className="text-sm text-zinc-600">Link not found</p>
      </main>
    );
  }

  return <ShareViewSkin data={data} />;
}
