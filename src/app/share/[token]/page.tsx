import { ShareNotFoundSkin } from "@/components/skins/minimal/ShareNotFoundSkin";
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
    return <ShareNotFoundSkin />;
  }

  return <ShareViewSkin data={data} />;
}
