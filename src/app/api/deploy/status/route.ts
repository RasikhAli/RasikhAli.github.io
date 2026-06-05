import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { Octokit } from "octokit";

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as any;
    const token = session?.accessToken || process.env.GITHUB_TOKEN;

    if (!token) {
      return NextResponse.json({ error: "GitHub access token is not available" }, { status: 401 });
    }

    const repoOwner = process.env.GITHUB_OWNER || session?.user?.username || "RasikhAli";
    const repoName = process.env.GITHUB_REPO || "rasikhali.github.io";

    const octokit = new Octokit({ auth: token });
    const runs = await octokit.rest.actions.listWorkflowRuns({
      owner: repoOwner,
      repo: repoName,
      workflow_id: "deploy.yml",
      per_page: 5,
      branch: "main",
    });

    const latestRun = runs.data.workflow_runs.find((run) => run.path?.includes("deploy.yml")) || runs.data.workflow_runs[0];

    if (!latestRun) {
      return NextResponse.json({ status: "idle", message: "No deployment workflow found" });
    }

    const run = await octokit.rest.actions.getWorkflowRun({
      owner: repoOwner,
      repo: repoName,
      run_id: latestRun.id,
    });

    return NextResponse.json({
      status: run.data.status,
      conclusion: run.data.conclusion,
      html_url: run.data.html_url,
      id: run.data.id,
      created_at: run.data.created_at,
      updated_at: run.data.updated_at,
    });
  } catch (error: any) {
    console.error("Deployment status error:", error);
    return NextResponse.json({ error: error.message || "Failed to get deployment status" }, { status: 500 });
  }
}
