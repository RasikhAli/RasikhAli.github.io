import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { uploadImageToGitHub } from "@/lib/github";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions) as any;
    
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { path, base64Content, message } = body;

    if (!path || !base64Content || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const repoOwner = process.env.GITHUB_OWNER || session.user.username || "RasikhAli";
    const repoName = process.env.GITHUB_REPO || "rasikhali.github.io";
    const branch = process.env.GITHUB_BRANCH || "main";

    // Strip out the data url headers if present (e.g. data:image/png;base64,...)
    const cleanBase64 = base64Content.replace(/^data:image\/[a-z]+;base64,/, "");

    const data = await uploadImageToGitHub({
      path,
      base64Content: cleanBase64,
      message,
      token: session.accessToken,
      repoOwner,
      repoName,
      branch,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Server Image Upload Error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload image" }, { status: 500 });
  }
}
