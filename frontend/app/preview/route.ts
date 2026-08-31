import { parsePreviewRequest } from "@cmsjs/cms/preview";
import { config } from "@cmsjs/config";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(request: Request): Promise<Response> {
  const preview = parsePreviewRequest(request.url, config.previewSecret);
  if (!preview) {
    return new Response("Unauthorized", { status: 401 });
  }

  const draft = await draftMode();
  if (preview.status === "draft") {
    draft.enable();
  } else {
    draft.disable();
  }

  redirect(preview.pathname);
}

export async function POST(_request: Request): Promise<Response> {
  (await draftMode()).disable();
  return new Response(null, { status: 303, headers: { Location: "/" } });
}
