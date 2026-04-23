import { NextResponse } from "next/server";

const BRIGHTCOVE_ACCOUNT = "6415718365001";
const POLICY_KEY =
  "BCpkADawqM3l37Vq8trLJ95vVwxubXYZXYglAopEZXQTHTWX3YdalyF9xmkuknxjBgiMYwt8VZ_OZ1jAjYxz_yzuNh_cjC3uOaMspVTD-hZfNUHtNnBnhVD0Gmsih8TBF8QlQFXiCQM3W_u4ydJ1qK2Rx8ZutCUg3PHb7Q";

interface BrightcoveSource {
  src?: string;
  type?: string;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ milestoneId: string }> }
) {
  const { milestoneId } = await params;

  if (!/^\d+$/.test(milestoneId)) {
    return NextResponse.json({ error: "Invalid milestone ID" }, { status: 400 });
  }

  const res = await fetch(
    `https://edge.api.brightcove.com/playback/v1/accounts/${BRIGHTCOVE_ACCOUNT}/videos/${milestoneId}`,
    {
      headers: { Accept: `application/json;pk=${POLICY_KEY}` },
      next: { revalidate: 86400 },
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Video not found" }, { status: res.status });
  }

  const data: { sources?: BrightcoveSource[] } = await res.json();

  const hlsSource = (data.sources ?? []).find(
    (s) => s.type === "application/x-mpegURL" && s.src?.startsWith("https")
  );

  if (!hlsSource?.src) {
    return NextResponse.json({ error: "No HLS source" }, { status: 404 });
  }

  return NextResponse.json(
    { hlsUrl: hlsSource.src },
    { headers: { "Cache-Control": "public, max-age=86400" } }
  );
}
