import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { Octokit } from "octokit";

function extractGitHubRepoParts(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "github.com" || parsed.hostname === "www.github.com") {
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        return { owner: parts[0], repo: parts[1] };
      }
    }
  } catch {
    // ignore invalid URL
  }
  return null;
}

function extractGitHubUser(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "github.com" || parsed.hostname === "www.github.com") {
      const parts = parsed.pathname.split("/").filter(Boolean);
      return parts[0] || null;
    }
  } catch {
    // ignore invalid URL
  }
  return null;
}

function extractLinkedInSlug(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("linkedin.com")) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      return parts[0] === "in" ? parts[1] : parts[0] || null;
    }
  } catch {
    // ignore invalid URL
  }
  return null;
}

function normalizeTechStack(languages: Record<string, number>) {
  return Object.keys(languages || {}).sort((a, b) => (languages[b] || 0) - (languages[a] || 0)).slice(0, 8);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url");

    if (!targetUrl) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    const session = await getServerSession(authOptions) as any;
    const token = session?.accessToken || process.env.GITHUB_TOKEN || "";
    const octokit = new Octokit({ auth: token || undefined });

    const repoParts = extractGitHubRepoParts(targetUrl);
    if (repoParts) {
      const repo = await octokit.rest.repos.get({ owner: repoParts.owner, repo: repoParts.repo });
      const languages = await octokit.rest.repos.listLanguages({ owner: repoParts.owner, repo: repoParts.repo });
      return NextResponse.json({
        type: "repo",
        name: repo.data.name,
        description: repo.data.description || "",
        short_description: repo.data.description || "",
        tech_stack: normalizeTechStack(languages.data),
        homepage: repo.data.homepage || "",
        avatar: repo.data.owner?.avatar_url || "",
        owner: repo.data.owner?.login || repoParts.owner,
      });
    }

    const userName = extractGitHubUser(targetUrl);
    if (userName) {
      const user = await octokit.rest.users.getByUsername({ username: userName });
      return NextResponse.json({
        type: "profile",
        name: user.data.name || user.data.login,
        bio: user.data.bio || "",
        avatar: user.data.avatar_url || "",
        username: user.data.login,
        skills: [],
      });
    }

    const linkedinSlug = extractLinkedInSlug(targetUrl);
    if (linkedinSlug) {
      const response = await fetch(`https://www.linkedin.com/in/${linkedinSlug}`, {
        headers: {
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        redirect: "follow",
      });
      const html = await response.text();
      const avatarMatch = html.match(/property="og:image"[^>]+content="([^"]+)"/i) || html.match(/name="og:image"[^>]+content="([^"]+)"/i);
      const titleMatch = html.match(/property="og:title"[^>]+content="([^"]+)"/i) || html.match(/name="og:title"[^>]+content="([^"]+)"/i);
      return NextResponse.json({
        type: "linkedin",
        name: titleMatch?.[1]?.replace("| LinkedIn", "").trim() || linkedinSlug,
        avatar: avatarMatch?.[1] || "",
        bio: "",
        skills: [],
      });
    }

    return NextResponse.json({ error: "Unsupported URL" }, { status: 400 });
  } catch (error: any) {
    console.error("Metadata fetch error:", error);
    return NextResponse.json({ error: error.message || "Unable to fetch metadata" }, { status: 500 });
  }
}
