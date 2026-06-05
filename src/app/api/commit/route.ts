import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { commitFileToGitHub } from "@/lib/github";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions) as any;
    
    // Server-side authentication check
    if (!session || !session.accessToken) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { path, content, message } = body;

    if (!path || !content || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const repoOwner = process.env.GITHUB_OWNER || session.user.username || "RasikhAli";
    const repoName = process.env.GITHUB_REPO || "rasikhali.github.io";
    const branch = process.env.GITHUB_BRANCH || "main";

    const data = await commitFileToGitHub({
      path,
      content,
      message,
      token: session.accessToken,
      repoOwner,
      repoName,
      branch,
    });

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Server Commit Error:", error);
    return NextResponse.json({ error: error.message || "Failed to commit content" }, { status: 500 });
  }
}
