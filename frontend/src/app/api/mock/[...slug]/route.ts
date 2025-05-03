import { type NextRequest } from "next/server";
import { getPresignedUrl } from "~/lib/s3";

const services = {
  "styletts2": {
    voices: ["duyanh", "woman"],
  },
  "seed-vc": {
    voices: ["duyanh", "woman", "trump"],
  },
  "make-an-audio": {
    voices: [],
  },
};

export function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } },
) {
  const slug = params.slug;
  const [service, endpoint] = slug;

  if (!services[service as keyof typeof services]) {
    return Response.json({ error: "Service not found" }, { status: 404 });
  }

  if (endpoint === "voices") {
    return Response.json({
      voices: services[service as keyof typeof services].voices,
    });
  }

  if (endpoint === "health") {
    return Response.json({
      status: "healthy",
      model: "loaded",
    });
  }

  return Response.json({ error: "Not found" }, { status: 404 });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string[] } },
) {
  const awaitedParams = params;
  const slug = awaitedParams.slug;
  const [service] = slug;

  if (!services[service as keyof typeof services]) {
    return Response.json({ error: "Service not found" }, { status: 404 });
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const s3Key = "styletts2-output/14a8ed0c-7a56-420e-80ff-f91cc7ceed90.wav";
  const presignedUrl = await getPresignedUrl({ key: s3Key });

  return Response.json({
    audio_url: presignedUrl,
    s3_key: s3Key,
  });
}