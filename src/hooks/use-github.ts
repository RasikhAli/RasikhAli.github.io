"use client";

import { useState, useEffect, useCallback } from "react";
import { Developer, Project, SiteConfig } from "@/lib/schemas";
import { commitFileToGitHub, uploadImageToGitHub } from "@/lib/github";

export function useGitHub() {
  const [token, setToken] = useState<string>("");
  const [repoOwner, setRepoOwner] = useState<string>("RasikhAli");
  const [repoName, setRepoName] = useState<string>("rasikhali.github.io");
  const [branch, setBranch] = useState<string>("main");
  const [isClientMode, setIsClientMode] = useState<boolean>(true);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("github_pat") || "";
      const storedOwner = localStorage.getItem("github_owner") || "RasikhAli";
      const storedRepo = localStorage.getItem("github_repo") || "rasikhali.github.io";
      const storedBranch = localStorage.getItem("github_branch") || "main";
      
      setToken(storedToken);
      setRepoOwner(storedOwner);
      setRepoName(storedRepo);
      setBranch(storedBranch);

      // Check if we are running in NextAuth server mode
      // If GITHUB_ID environment variable is set dynamically, we can use server endpoints
      // But for safety, we allow overriding mode
      const storedMode = localStorage.getItem("cms_mode");
      if (storedMode) {
        setIsClientMode(storedMode === "client");
      }
    }
  }, []);

  const saveConfig = useCallback((newToken: string, newOwner: string, newRepo: string, newBranch: string, mode: "client" | "server") => {
    setToken(newToken);
    setRepoOwner(newOwner);
    setRepoName(newRepo);
    setBranch(newBranch);
    setIsClientMode(mode === "client");

    localStorage.setItem("github_pat", newToken);
    localStorage.setItem("github_owner", newOwner);
    localStorage.setItem("github_repo", newRepo);
    localStorage.setItem("github_branch", newBranch);
    localStorage.setItem("cms_mode", mode);
  }, []);

  const clearConfig = useCallback(() => {
    setToken("");
    localStorage.removeItem("github_pat");
  }, []);

  const executeCommit = async (path: string, newContent: string, message: string) => {
    setStatus("loading");
    setErrorMsg("");
    try {
      if (isClientMode) {
        if (!token) {
          throw new Error("GitHub Personal Access Token is required in client mode.");
        }
        await commitFileToGitHub({
          path,
          content: newContent,
          message,
          token,
          repoOwner,
          repoName,
          branch,
        });
      } else {
        // Server mode - call API endpoint
        const res = await fetch("/api/commit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path, content: newContent, message }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to commit changes to GitHub server.");
        }
      }
      setStatus("success");
      return true;
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message || "An error occurred while committing to GitHub");
      return false;
    }
  };

  const updateSiteConfig = async (config: SiteConfig) => {
    const content = JSON.stringify(config, null, 2);
    return await executeCommit("data/site-config.json", content, "CMS: Update Site Settings");
  };

  const updateDevelopersList = async (developers: Developer[], action: string, name: string) => {
    const content = JSON.stringify(developers, null, 2);
    return await executeCommit("data/developers.json", content, `CMS: ${action} Developer ${name}`);
  };

  const updateProjectsList = async (projects: Project[], action: string, title: string) => {
    const content = JSON.stringify(projects, null, 2);
    return await executeCommit("data/projects.json", content, `CMS: ${action} Project ${title}`);
  };

  const uploadFile = async (fileName: string, base64Content: string) => {
    setStatus("loading");
    setErrorMsg("");
    const path = `public/uploads/${fileName}`;
    try {
      if (isClientMode) {
        if (!token) {
          throw new Error("GitHub PAT required for upload.");
        }
        await uploadImageToGitHub({
          path,
          base64Content,
          message: `CMS: Upload screenshot ${fileName}`,
          token,
          repoOwner,
          repoName,
          branch,
        });
      } else {
        const res = await fetch("/api/commit/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path, base64Content, message: `CMS: Upload screenshot ${fileName}` }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Image upload failed");
        }
      }
      setStatus("success");
      return `uploads/${fileName}`; // Return relative path from public folder
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message || "Failed to upload image");
      return null;
    }
  };

  return {
    token,
    repoOwner,
    repoName,
    branch,
    isClientMode,
    status,
    errorMsg,
    saveConfig,
    clearConfig,
    updateSiteConfig,
    updateDevelopersList,
    updateProjectsList,
    uploadFile,
    setStatus,
  };
}
