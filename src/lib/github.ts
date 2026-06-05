import { Octokit } from "octokit";

export interface GitHubCommitParams {
  path: string;
  content: string;
  message: string;
  sha?: string;
  token: string;
  repoOwner: string;
  repoName: string;
  branch?: string;
}

export interface GitHubUploadParams {
  path: string;
  base64Content: string;
  message: string;
  token: string;
  repoOwner: string;
  repoName: string;
  branch?: string;
}

export async function fetchFileFromGitHub(
  path: string,
  token: string,
  repoOwner: string,
  repoName: string,
  branch = "main"
) {
  const octokit = new Octokit({ auth: token });
  try {
    const response = await octokit.rest.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path,
      ref: branch,
    });

    if (Array.isArray(response.data)) {
      throw new Error("Target path is a directory, not a file");
    }

    if (response.data.type === "file") {
      const content = Buffer.from(response.data.content, "base64").toString("utf-8");
      return {
        content,
        sha: response.data.sha,
      };
    }
    throw new Error("Invalid file content type");
  } catch (error: any) {
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function commitFileToGitHub({
  path,
  content,
  message,
  sha,
  token,
  repoOwner,
  repoName,
  branch = "main",
}: GitHubCommitParams) {
  const octokit = new Octokit({ auth: token });
  
  // If SHA was not provided, try to fetch it first to avoid conflicts
  let fileSha = sha;
  if (!fileSha) {
    const existing = await fetchFileFromGitHub(path, token, repoOwner, repoName, branch);
    if (existing) {
      fileSha = existing.sha;
    }
  }

  const response = await octokit.rest.repos.createOrUpdateFileContents({
    owner: repoOwner,
    repo: repoName,
    path,
    message,
    content: Buffer.from(content).toString("base64"),
    sha: fileSha,
    branch,
  });

  return response.data;
}

export async function uploadImageToGitHub({
  path,
  base64Content,
  message,
  token,
  repoOwner,
  repoName,
  branch = "main",
}: GitHubUploadParams) {
  const octokit = new Octokit({ auth: token });
  
  // Check if image already exists to get SHA (for overwrite)
  let fileSha: string | undefined;
  try {
    const existing = await octokit.rest.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path,
      ref: branch,
    });
    if (!Array.isArray(existing.data) && existing.data.type === "file") {
      fileSha = existing.data.sha;
    }
  } catch (e) {
    // Ignore 404
  }

  const response = await octokit.rest.repos.createOrUpdateFileContents({
    owner: repoOwner,
    repo: repoName,
    path,
    message,
    content: base64Content, // Must be already encoded to base64
    sha: fileSha,
    branch,
  });

  return response.data;
}
