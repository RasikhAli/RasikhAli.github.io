"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  X,
  FolderKanban,
  AlertCircle,
  Loader2,
  Sparkles,
  Wand2,
  Check,
  ExternalLink,
  RefreshCw,
  Search,
  CheckSquare,
  Square,
  Globe,
} from "lucide-react";
import { Github, Linkedin } from "@/components/brand-icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, Project } from "@/lib/schemas";
import { ScreenshotUploader, type PendingFile } from "@/components/screenshot-uploader";
import { useGitHub } from "@/hooks/use-github";
import { Badge } from "@/components/ui/badge";
import initialProjects from "../../../../data/projects.json";
import developersData from "../../../../data/developers.json";
import siteConfig from "../../../../data/site-config.json";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

interface GitHubRepoItem {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  updated_at: string;
  is_already_added: boolean;
}

export default function AdminProjectsPage() {
  const { updateProjectsList, status, statusMessage, errorMsg, token, repoOwner } = useGitHub();

  const [projects, setProjects] = useState<Project[]>([]);
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      if (!a.start_date) return 1;
      if (!b.start_date) return -1;
      return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
    });
  }, [projects]);

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [localError, setLocalError] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  // Form local state for screenshots array, tech stack & select devs
  const [screenshotsList, setScreenshotsList] = useState<string[]>([]);
  const [selectedDevIds, setSelectedDevIds] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [techStackList, setTechStackList] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");

  // GitHub Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);
  const [isBatchImporting, setIsBatchImporting] = useState(false);
  const [batchImportProgress, setBatchImportProgress] = useState("");
  const [githubRepos, setGithubRepos] = useState<GitHubRepoItem[]>([]);
  const [selectedRepoUrls, setSelectedRepoUrls] = useState<string[]>([]);
  const [importSearchQuery, setImportSearchQuery] = useState("");
  const [importDevIds, setImportDevIds] = useState<string[]>([]);
  const [importUsername, setImportUsername] = useState("RasikhAli");
  const [importToken, setImportToken] = useState("");
  const [importError, setImportError] = useState("");

  useEffect(() => {
    setIsClient(true);
    if (developersData.length > 0) {
      setImportDevIds([developersData[0].id]);
    }

    const stored = typeof window !== "undefined" ? localStorage.getItem("cms_projects") : null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed);
        } else {
          setProjects(initialProjects as Project[]);
        }
      } catch {
        setProjects(initialProjects as Project[]);
      }
    } else {
      setProjects(initialProjects as Project[]);
    }

    fetch("/api/projects")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("cms_projects", JSON.stringify(data));
            } catch (e) {
              console.warn("localStorage quota exceeded:", e);
            }
          }
        }
      })
      .catch((err) => console.warn("Failed to fetch /api/projects:", err));
  }, []);

  useEffect(() => {
    if (repoOwner || siteConfig.github_username) {
      setImportUsername(repoOwner || siteConfig.github_username || "RasikhAli");
    }
    if (token) {
      setImportToken(token);
    }
  }, [repoOwner, token]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Project>({
    resolver: zodResolver(projectSchema) as any,
  });

  const watchedTitle = watch("title");
  const watchedId = watch("id");

  useEffect(() => {
    if (!editingProject && watchedTitle && !watchedId) {
      setValue("id", slugify(watchedTitle));
    }
  }, [watchedTitle, watchedId, editingProject, setValue]);

  useEffect(() => {
    if (isFormOpen) {
      setValue("developer_ids", selectedDevIds, { shouldValidate: false });
    }
  }, [selectedDevIds, isFormOpen, setValue]);

  useEffect(() => {
    if (isFormOpen) {
      setValue("tech_stack", techStackList, { shouldValidate: false });
    }
  }, [techStackList, isFormOpen, setValue]);

  const formatRepoName = (name: string): string => {
    return name
      .replace(/[-_]/g, " ")
      .replace(/\.git$/i, "")
      .replace(/\/$/, "")
      .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  };

  const extractReadmeSummary = (readme: string): { full: string; short: string } => {
    const lines = readme.split("\n");
    const firstHeadingIndex = lines.findIndex((l) => l.trim().startsWith("# "));
    let contentStart = 0;
    if (firstHeadingIndex === 0) {
      contentStart = 1;
      while (contentStart < lines.length && lines[contentStart].trim() === "") contentStart++;
    }
    const body = lines.slice(contentStart).join("\n").trim();
    const plainShort = body
      .replace(/^#{1,6}\s+/gm, "")
      .replace(/\*\*(.+?)\*\*/g, "$1")
      .replace(/\*(.+?)\*/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .trim();
    return { full: body, short: plainShort.slice(0, 200) };
  };

  const fetchReadme = async (owner: string, repo: string, headers: Record<string, string>): Promise<string> => {
    const readmeVariants = ["README.md", "Readme.md", "readme.md"];
    for (const variant of readmeVariants) {
      try {
        let res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${variant}`, { headers });
        if (!res.ok && res.status === 401 && headers["Authorization"]) {
          const cleanHeaders = { ...headers };
          delete cleanHeaders["Authorization"];
          res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${variant}`, { headers: cleanHeaders });
        }
        if (res.ok) {
          const data = await res.json();
          if (data.content) {
            return atob(data.content.replace(/\n/g, ""));
          }
        }
      } catch {
        // Try next
      }
    }
    return "";
  };

  const fetchCommitDates = async (
    owner: string,
    repo: string,
    headers: Record<string, string>
  ): Promise<{ first: string; last: string }> => {
    try {
      const firstPageRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1&page=1`,
        { headers }
      );

      let firstCommitDate = "";
      let lastCommitDate = "";

      const firstPageData = firstPageRes.ok ? await firstPageRes.json() : [];
      if (Array.isArray(firstPageData) && firstPageData.length > 0) {
        lastCommitDate = firstPageData[0].commit?.committer?.date || firstPageData[0].commit?.author?.date || "";
      }

      const linkHeader = firstPageRes.headers.get("link") || "";
      const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
      if (lastPageMatch) {
        const lastPage = lastPageMatch[1];
        const lastPageRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1&page=${lastPage}`,
          { headers }
        );
        if (lastPageRes.ok) {
          const lastPageData = await lastPageRes.json();
          if (Array.isArray(lastPageData) && lastPageData.length > 0) {
            firstCommitDate = lastPageData[0].commit?.committer?.date || lastPageData[0].commit?.author?.date || "";
          }
        }
      }

      return { first: firstCommitDate, last: lastCommitDate };
    } catch {
      return { first: "", last: "" };
    }
  };

  const autoFillRepo = async (sourceUrl?: string) => {
    const repoUrl = sourceUrl || watch("github_repo_url");
    if (!repoUrl) {
      alert("Please enter a valid GitHub repository URL first.");
      return;
    }

    setIsAutoFilling(true);
    try {
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) {
        alert("Invalid GitHub URL format. Example: https://github.com/owner/repo");
        setIsAutoFilling(false);
        return;
      }
      const owner = match[1];
      const repo = match[2].replace(/\.git$/, "").replace(/\/$/, "");

      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token.trim()}`;
      }

      let repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if (!repoRes.ok && repoRes.status === 401 && headers["Authorization"]) {
        delete headers["Authorization"];
        repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      }

      if (!repoRes.ok) {
        if (repoRes.status === 401) {
          throw new Error("Invalid GitHub Token (Bad credentials). Please update your PAT in CMS Settings.");
        }
        throw new Error(`Repository not found or access denied (Status ${repoRes.status}).`);
      }
      const repoData = await repoRes.json();

      if (!watch("title")) {
        setValue("title", formatRepoName(repoData.name));
        if (!watch("id")) setValue("id", slugify(repoData.name));
      }

      const readmeText = await fetchReadme(owner, repo, headers);
      if (readmeText) {
        const { full, short } = extractReadmeSummary(readmeText);
        if (full) setValue("description", full);
        if (short) setValue("short_description", short);
      } else if (repoData.description) {
        setValue("description", repoData.description);
        setValue("short_description", repoData.description.slice(0, 200));
      }

      if (repoData.homepage) {
        setValue("live_url", repoData.homepage);
      }

      const langsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers });
      const langsData = langsRes.ok ? await langsRes.json() : {};
      const languages = Object.keys(langsData).slice(0, 10);
      if (languages.length > 0) {
        setTechStackList(languages);
        setValue("tech_stack", languages);
      } else if (repoData.language) {
        setTechStackList([repoData.language]);
        setValue("tech_stack", [repoData.language]);
      }

      const { first, last } = await fetchCommitDates(owner, repo, headers);
      if (first) setValue("start_date", first.split("T")[0]);
      if (last) setValue("end_date", last.split("T")[0]);

      setSuccessMsg(`Auto-filled metadata for "${repoData.name}"!`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error: any) {
      alert(error.message || "Unable to fetch repository details right now.");
    } finally {
      setIsAutoFilling(false);
    }
  };

  const openCreateForm = () => {
    setEditingProject(null);
    setScreenshotsList([]);
    setSelectedDevIds(developersData.length > 0 ? [developersData[0].id] : []);
    setPendingFiles([]);
    setTechStackList([]);
    setTechInput("");
    reset({
      id: "",
      title: "",
      description: "",
      short_description: "",
      tech_stack: [],
      screenshots: [],
      start_date: null,
      end_date: null,
      status: "completed",
      featured: false,
      github_repo_url: "",
      linkedin_post_url: "",
      live_url: "",
      developer_ids: developersData.length > 0 ? [developersData[0].id] : [],
    });
    setIsFormOpen(true);
  };

  const openEditForm = (proj: Project) => {
    setEditingProject(proj);
    setScreenshotsList(proj.screenshots || []);
    setSelectedDevIds(proj.developer_ids || []);
    setPendingFiles([]);
    setTechStackList(proj.tech_stack || []);
    setTechInput("");
    reset(proj);

    if (proj.start_date) setValue("start_date", proj.start_date.split("T")[0]);
    if (proj.end_date) setValue("end_date", proj.end_date.split("T")[0]);

    setIsFormOpen(true);
  };

  const toggleDeveloperSelection = (devId: string) => {
    setSelectedDevIds((prev) =>
      prev.includes(devId) ? prev.filter((id) => id !== devId) : [...prev, devId]
    );
  };

  const handleAddTech = () => {
    const trimmed = techInput.trim();
    if (trimmed && !techStackList.includes(trimmed)) {
      const updated = [...techStackList, trimmed];
      setTechStackList(updated);
      setValue("tech_stack", updated);
      setTechInput("");
    }
  };

  const handleRemoveTech = (tech: string) => {
    const updated = techStackList.filter((t) => t !== tech);
    setTechStackList(updated);
    setValue("tech_stack", updated);
  };

  const handleFormSubmit = async (data: Project) => {
    setSuccessMsg("");
    setLocalError("");

    try {
      if (!data.title?.trim()) {
        setLocalError("Project title is required.");
        return;
      }
      if (!data.description?.trim()) {
        setLocalError("Project description is required.");
        return;
      }
      if (!data.short_description?.trim()) {
        setLocalError("Short description is required.");
        return;
      }
      if (!techStackList || techStackList.length === 0) {
        setLocalError("Please add at least one technology to the tech stack.");
        return;
      }
      if (selectedDevIds.length === 0) {
        setLocalError("Please assign at least one developer.");
        return;
      }
      if (!data.id || data.id.length < 2) {
        setLocalError("Project ID must be at least 2 characters.");
        return;
      }

      const newScreenshotDataUris: string[] = [];
      for (const pending of pendingFiles) {
        newScreenshotDataUris.push(pending.base64Content);
      }

      const allScreenshots = [...screenshotsList, ...newScreenshotDataUris];

      const projectData: Project = {
        ...data,
        tech_stack: techStackList,
        screenshots: allScreenshots,
        developer_ids: selectedDevIds,
      };

      let updatedList: Project[] = [];
      const timestamp = new Date().toISOString();

      if (editingProject) {
        projectData.updated_at = timestamp;
        updatedList = projects.map((p) => (p.id === editingProject.id ? projectData : p));
      } else {
        projectData.created_at = timestamp;
        projectData.updated_at = timestamp;

        if (projects.some((p) => p.id === projectData.id)) {
          setLocalError("A project with this ID already exists.");
          return;
        }
        updatedList = [...projects, projectData];
      }

      const action = editingProject ? "Update" : "Create";
      const success = await updateProjectsList(updatedList, action, projectData.title);
      if (success) {
        setProjects(updatedList);
        setPendingFiles([]);
        setIsFormOpen(false);
        setSuccessMsg(`Project "${projectData.title}" saved and committed successfully!`);
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err: any) {
      console.error("Form submit error:", err);
      setLocalError(err?.message || "An unexpected error occurred while saving.");
    }
  };

  const onInvalid = (formErrors: any) => {
    const errorMessages: string[] = [];
    Object.entries(formErrors).forEach(([field, err]: [string, any]) => {
      if (err?.message) {
        errorMessages.push(`${field}: ${err.message}`);
      }
    });
    setLocalError(errorMessages.join("\n"));
  };

  const handleDelete = async (proj: Project) => {
    if (!confirm(`Are you sure you want to delete ${proj.title}?`)) {
      return;
    }

    setSuccessMsg("");
    const updatedList = projects.filter((p) => p.id !== proj.id);
    const success = await updateProjectsList(updatedList, "Delete", proj.title);
    if (success) {
      setProjects(updatedList);
      setSuccessMsg(`Project "${proj.title}" removed successfully!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    }
  };

  // --- BATCH GITHUB IMPORT LOGIC ---

  const normalizeUrl = (url?: string) => {
    if (!url) return "";
    return url.toLowerCase().trim().replace(/\.git$/, "").replace(/\/$/, "");
  };

  const fetchGithubRepos = async (targetUsername?: string, customToken?: string) => {
    setIsFetchingRepos(true);
    setImportError("");
    setSelectedRepoUrls([]);

    const activeUsername = (targetUsername !== undefined ? targetUsername : importUsername) || repoOwner || siteConfig.github_username || "RasikhAli";
    const activeToken = customToken !== undefined ? customToken : importToken || token;

    if (customToken !== undefined && typeof window !== "undefined") {
      localStorage.setItem("github_pat", customToken);
    }

    const getHeaders = (useAuth = true): Record<string, string> => {
      const h: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
      };
      if (useAuth && activeToken && activeToken.trim().length > 0) {
        h["Authorization"] = `Bearer ${activeToken.trim()}`;
      }
      return h;
    };

    const existingUrls = new Set(projects.map((p) => normalizeUrl(p.github_repo_url)).filter(Boolean));
    const existingIds = new Set(projects.map((p) => p.id.toLowerCase()));

    try {
      let reposData: any[] = [];
      let fetchErrorMsg = "";

      // 1. If PAT token is provided, try fetching authenticated user repos first
      if (activeToken && activeToken.trim()) {
        try {
          const userRes = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated&type=all", {
            headers: getHeaders(true),
          });
          if (userRes.ok) {
            reposData = await userRes.json();
          }
        } catch (e) {
          console.warn("User repos fetch failed:", e);
        }
      }

      // 2. Fallback to fetching public repos for activeUsername
      if (!Array.isArray(reposData) || reposData.length === 0) {
        let res = await fetch(`https://api.github.com/users/${activeUsername}/repos?per_page=100&sort=updated`, {
          headers: getHeaders(true),
        });

        // If auth failed (e.g. invalid PAT), retry unauthenticated
        if (!res.ok && res.status === 401 && activeToken) {
          res = await fetch(`https://api.github.com/users/${activeUsername}/repos?per_page=100&sort=updated`, {
            headers: getHeaders(false),
          });
        }

        // Try org endpoint if user returns 404
        if (res.status === 404) {
          res = await fetch(`https://api.github.com/orgs/${activeUsername}/repos?per_page=100&sort=updated`, {
            headers: getHeaders(true),
          });
        }

        if (res.ok) {
          reposData = await res.json();
        } else {
          const errJson = await res.json().catch(() => ({}));
          if (res.status === 403) {
            fetchErrorMsg = "GitHub API Rate limit exceeded for unauthenticated requests. Please enter your Personal Access Token (PAT) below to increase your rate limit to 5,000 requests/hr.";
          } else if (res.status === 404) {
            fetchErrorMsg = `GitHub user or org "${activeUsername}" was not found.`;
          } else {
            fetchErrorMsg = errJson.message || `Failed to fetch repos (HTTP ${res.status}).`;
          }
        }
      }

      if (!Array.isArray(reposData)) {
        reposData = [];
      }

      if (reposData.length === 0 && fetchErrorMsg) {
        setImportError(fetchErrorMsg);
      }

      const processed: GitHubRepoItem[] = reposData.map((repo: any) => {
        const norm = normalizeUrl(repo.html_url);
        const slug = slugify(repo.name);
        const isAlreadyAdded = existingUrls.has(norm) || existingIds.has(slug);
        return {
          id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          html_url: repo.html_url,
          description: repo.description,
          homepage: repo.homepage,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
          updated_at: repo.updated_at,
          is_already_added: isAlreadyAdded,
        };
      });

      setGithubRepos(processed);
    } catch (err: any) {
      console.error("Failed to fetch repos:", err);
      setImportError(err.message || "An error occurred while fetching repositories.");
    } finally {
      setIsFetchingRepos(false);
    }
  };

  const openImportModal = async () => {
    setIsImportModalOpen(true);
    await fetchGithubRepos();
  };

  const filteredImportRepos = useMemo(() => {
    if (!importSearchQuery.trim()) return githubRepos;
    const q = importSearchQuery.toLowerCase();
    return githubRepos.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q)) ||
        (r.language && r.language.toLowerCase().includes(q))
    );
  }, [githubRepos, importSearchQuery]);

  const toggleSelectRepo = (url: string) => {
    setSelectedRepoUrls((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const toggleSelectAllRepos = () => {
    const unaddedFiltered = filteredImportRepos.filter((r) => !r.is_already_added);
    const unaddedUrls = unaddedFiltered.map((r) => r.html_url);
    const allSelected = unaddedUrls.every((url) => selectedRepoUrls.includes(url));

    if (allSelected) {
      setSelectedRepoUrls((prev) => prev.filter((url) => !unaddedUrls.includes(url)));
    } else {
      setSelectedRepoUrls((prev) => Array.from(new Set([...prev, ...unaddedUrls])));
    }
  };

  const toggleImportDevSelection = (devId: string) => {
    setImportDevIds((prev) =>
      prev.includes(devId) ? prev.filter((id) => id !== devId) : [...prev, devId]
    );
  };

  const handleExecuteBatchImport = async () => {
    if (selectedRepoUrls.length === 0) return;
    if (importDevIds.length === 0) {
      alert("Please select at least one developer to assign to the imported projects.");
      return;
    }

    setIsBatchImporting(true);
    setBatchImportProgress(`Importing ${selectedRepoUrls.length} projects...`);

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const selectedRepos = githubRepos.filter((r) => selectedRepoUrls.includes(r.html_url));
    const newProjectsToAdd: Project[] = [];
    const existingSlugs = new Set(projects.map((p) => p.id));
    const timestamp = new Date().toISOString();

    for (let i = 0; i < selectedRepos.length; i++) {
      const repoItem = selectedRepos[i];
      setBatchImportProgress(`Fetching details for ${repoItem.name} (${i + 1}/${selectedRepos.length})...`);

      try {
        const match = repoItem.html_url.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (!match) continue;
        const owner = match[1];
        const repo = match[2].replace(/\.git$/, "").replace(/\/$/, "");

        let baseSlug = slugify(repoItem.name);
        let finalSlug = baseSlug;
        let counter = 1;
        while (existingSlugs.has(finalSlug)) {
          finalSlug = `${baseSlug}-${counter}`;
          counter++;
        }
        existingSlugs.add(finalSlug);

        const readmeText = await fetchReadme(owner, repo, headers);
        let description = repoItem.description || formatRepoName(repoItem.name);
        let shortDescription = (repoItem.description || formatRepoName(repoItem.name)).slice(0, 200);

        if (readmeText) {
          const summary = extractReadmeSummary(readmeText);
          if (summary.full) description = summary.full;
          if (summary.short) shortDescription = summary.short;
        }

        const langsRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers });
        const langsData = langsRes.ok ? await langsRes.json() : {};
        const languages = Object.keys(langsData).slice(0, 10);
        const finalTechStack = languages.length > 0 ? languages : repoItem.language ? [repoItem.language] : ["TypeScript"];

        const { first, last } = await fetchCommitDates(owner, repo, headers);

        const newProj: Project = {
          id: finalSlug,
          title: formatRepoName(repoItem.name),
          description,
          short_description: shortDescription,
          tech_stack: finalTechStack,
          screenshots: [],
          start_date: first ? first.split("T")[0] : null,
          end_date: last ? last.split("T")[0] : null,
          status: "completed",
          featured: false,
          github_repo_url: repoItem.html_url,
          linkedin_post_url: "",
          live_url: repoItem.homepage || "",
          developer_ids: importDevIds,
          created_at: timestamp,
          updated_at: timestamp,
        };

        newProjectsToAdd.push(newProj);
      } catch (err) {
        console.error(`Failed to import ${repoItem.name}:`, err);
      }
    }

    if (newProjectsToAdd.length > 0) {
      setBatchImportProgress("Saving imported projects to repository...");
      const updatedList = [...projects, ...newProjectsToAdd];
      const success = await updateProjectsList(
        updatedList,
        "Batch Import",
        `${newProjectsToAdd.length} projects`
      );
      if (success) {
        setProjects(updatedList);
        setIsImportModalOpen(false);
        setSuccessMsg(`Successfully imported ${newProjectsToAdd.length} project(s) from GitHub!`);
        setTimeout(() => setSuccessMsg(""), 5000);
      }
    } else {
      alert("No new projects were imported.");
    }

    setIsBatchImporting(false);
    setBatchImportProgress("");
  };

  const getScreenshotSrc = (src: string): string => {
    if (!src) return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120";
    if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:")) return src;
    return `/${src}`;
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-indigo-500/30">
      <div className="fixed top-0 left-0 w-full h-[600px] -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.08),transparent)] pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 space-y-10">
        
        {/* Navigation Breadcrumb & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-neutral-900 gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Admin Dashboard</span>
          </Link>
          
          <div className="flex items-center gap-2.5">
            <button
              onClick={openImportModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-extrabold rounded-xl text-indigo-400 hover:text-indigo-300 transition-all shadow-sm"
            >
              <Github className="w-4 h-4 text-indigo-400" />
              <span>Import from GitHub</span>
            </button>
            <button
              onClick={openCreateForm}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-extrabold rounded-xl text-white transition-all shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
              <FolderKanban className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Manage Projects</h1>
          </div>
          <p className="text-xs text-neutral-400 ml-[3.25rem]">
            Create, edit, or delete projects showcase details, timelines, technologies, live demo links, and screenshot galleries.
          </p>
        </div>

        {/* Feedback Alert messages */}
        {successMsg && (
          <div className="flex items-center gap-2.5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {(errorMsg || localError) && (
          <div className="flex items-start gap-2.5 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-400 font-bold">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span style={{ whiteSpace: "pre-line" }}>{localError || errorMsg}</span>
          </div>
        )}

        {/* List Rows with Smooth Height Collapse on Removal */}
        <div className="space-y-3">
          <AnimatePresence>
            {sortedProjects.map((proj) => (
              <motion.div
                key={proj.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700/80 rounded-2xl gap-4 transition-all backdrop-blur-md">
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={getScreenshotSrc(proj.screenshots?.[0] || "")}
                      alt={proj.title}
                      className="w-16 h-12 rounded-xl object-cover border border-neutral-800 bg-neutral-950 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-white group-hover:text-indigo-400 transition-colors truncate">
                          {proj.title}
                        </h3>
                        {proj.featured && (
                          <Badge variant="primary" className="text-[9px]">Featured</Badge>
                        )}
                        <Badge variant={proj.status === "completed" ? "completed" : proj.status === "in_progress" ? "in_progress" : "planned"} className="text-[9px]">
                          {proj.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-neutral-400 truncate mt-1">{proj.short_description}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-neutral-400">
                        {proj.github_repo_url && (
                          <a href={proj.github_repo_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-indigo-400">
                            <Github className="w-3 h-3" /> GitHub
                          </a>
                        )}
                        {proj.live_url && (
                          <a href={proj.live_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-emerald-400">
                            <Globe className="w-3 h-3" /> Live
                          </a>
                        )}
                        {proj.linkedin_post_url && (
                          <a href={proj.linkedin_post_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-blue-400">
                            <Linkedin className="w-3 h-3" /> LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => openEditForm(proj)}
                      className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl text-neutral-300 hover:text-white transition-all text-xs font-bold flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(proj)}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-400 transition-all text-xs font-bold flex items-center gap-1.5 border border-rose-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Create / Edit Project Form Modal */}
        <AnimatePresence>
          {isFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative my-8"
              >
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
                  <h3 className="text-xl font-extrabold text-white">
                    {editingProject ? `Edit Project: ${editingProject.title}` : "Create New Project"}
                  </h3>
                  <button
                    onClick={() => {
                      setIsFormOpen(false);
                      setLocalError("");
                    }}
                    className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit, onInvalid)} className="space-y-6">
                  
                  {/* GitHub Repo URL with Auto-fill Wand */}
                  <div className="bg-neutral-950/80 p-4 border border-indigo-500/20 rounded-2xl space-y-2">
                    <label className="block text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider">
                      GitHub Repository URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="url"
                        {...register("github_repo_url")}
                        placeholder="https://github.com/username/repo-name"
                        className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => autoFillRepo()}
                        disabled={isAutoFilling}
                        className="px-4 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                        title="Auto fill title, descriptions, tech stack and dates from GitHub"
                      >
                        {isAutoFilling ? (
                          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                        ) : (
                          <Wand2 className="w-4 h-4 text-indigo-400" />
                        )}
                        <span>Auto Fill</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      Paste repo URL and click <strong className="text-neutral-300">Auto Fill</strong> to fetch title, README description, tech stack, and commit timeline directly.
                    </p>
                  </div>

                  {/* ID and Title */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">
                        Unique ID <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        disabled={!!editingProject}
                        {...register("id")}
                        placeholder="cineby-hub"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">
                        Project Title <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        {...register("title")}
                        placeholder="Streaming Platform"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  {/* Live URL & LinkedIn Post URL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">
                        Live Demo / Website URL
                      </label>
                      <input
                        type="url"
                        {...register("live_url")}
                        placeholder="https://myproject.com"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">
                        LinkedIn Post / Article URL
                      </label>
                      <input
                        type="url"
                        {...register("linkedin_post_url")}
                        placeholder="https://linkedin.com/posts/..."
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">
                        Short Description <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        {...register("short_description")}
                        placeholder="A real-time HTML editor built with Flask..."
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">
                        Full Markdown Description <span className="text-rose-400">*</span>
                      </label>
                      <textarea
                        rows={5}
                        {...register("description")}
                        placeholder="Provide detailed description in Markdown format..."
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  {/* Tech Stack */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">
                      Tech Stack <span className="text-rose-400">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {techStackList.map((tech) => (
                        <span
                          key={tech}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-lg text-xs font-bold"
                        >
                          {tech}
                          <button
                            type="button"
                            onClick={() => handleRemoveTech(tech)}
                            className="hover:text-rose-400 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={techInput}
                        onChange={(e) => setTechInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTech();
                          }
                        }}
                        placeholder="Type technology (e.g. Next.js, Python, Tailwind) and press Enter"
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddTech}
                        className="px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold rounded-xl transition-all shrink-0"
                      >
                        Add Tech
                      </button>
                    </div>
                  </div>

                  {/* Screenshots & Media Uploader */}
                  <ScreenshotUploader
                    screenshots={screenshotsList}
                    onChange={(updated) => setScreenshotsList(updated)}
                    pendingFiles={pendingFiles}
                    onAddPending={(file) => setPendingFiles((prev) => [...prev, file])}
                    onRemovePending={(fileName) =>
                      setPendingFiles((prev) => prev.filter((p) => p.fileName !== fileName))
                    }
                    isUploading={false}
                  />

                  {/* Status, Dates, Featured */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">Status</label>
                      <select
                        {...register("status")}
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="completed">Completed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="planned">Planned</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">Start Date</label>
                      <input
                        type="date"
                        {...register("start_date")}
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1.5">End Date</label>
                      <input
                        type="date"
                        {...register("end_date")}
                        className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-300 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Featured Checkbox */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featured"
                      {...register("featured")}
                      className="w-4 h-4 rounded bg-neutral-950 border-neutral-800 text-indigo-600 focus:ring-indigo-500 accent-indigo-600"
                    />
                    <label htmlFor="featured" className="text-xs font-bold text-neutral-300 cursor-pointer">
                      Feature this project on homepage & showcase grids
                    </label>
                  </div>

                  {/* Developer selection */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-2">
                      Assigned Developers <span className="text-rose-400">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {developersData.map((dev) => {
                        const isAssigned = selectedDevIds.includes(dev.id);
                        return (
                          <button
                            type="button"
                            key={dev.id}
                            onClick={() => toggleDeveloperSelection(dev.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                              isAssigned
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700"
                            }`}
                          >
                            {dev.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Submit button */}
                  <div className="flex items-center justify-end gap-3 pt-6 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                    >
                      {status === "loading" ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Committing changes...</span>
                        </>
                      ) : (
                        <span>Save & Commit to Repo</span>
                      )}
                    </button>
                  </div>

                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* BATCH IMPORT FROM GITHUB MODAL */}
        <AnimatePresence>
          {isImportModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden"
              >
                {/* Modal Header */}
                <div className="p-6 sm:p-8 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/80 backdrop-blur-md shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                      <Github className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-white">Import Projects from GitHub</h3>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Select one or multiple repositories to automatically fetch and import into your portfolio.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsImportModalOpen(false)}
                    disabled={isBatchImporting}
                    className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-all disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
                  
                  {/* GitHub Account & PAT Bar */}
                  <div className="bg-neutral-950/80 p-4 border border-neutral-800 rounded-2xl space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1">
                          Target GitHub Username / Org
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={importUsername}
                            onChange={(e) => setImportUsername(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                fetchGithubRepos();
                              }
                            }}
                            placeholder="RasikhAli"
                            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => fetchGithubRepos()}
                            disabled={isFetchingRepos}
                            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isFetchingRepos ? "animate-spin" : ""}`} />
                            <span>Fetch</span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider mb-1">
                          Personal Access Token (PAT) <span className="text-neutral-500 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="password"
                          value={importToken}
                          onChange={(e) => setImportToken(e.target.value)}
                          onBlur={() => {
                            if (importToken !== token) {
                              fetchGithubRepos(importUsername, importToken);
                            }
                          }}
                          placeholder="github_pat_..."
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Import Error Banner */}
                  {importError && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs font-bold text-amber-300 flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p>{importError}</p>
                        <p className="text-[11px] text-amber-400/80 font-normal">
                          Tip: Paste a GitHub Personal Access Token (PAT) above with <code>repo</code> access to resolve rate limits or access private repositories.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Status / Loading bar */}
                  {isBatchImporting && (
                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-xs font-bold text-indigo-300 flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-400 shrink-0" />
                      <span>{batchImportProgress}</span>
                    </div>
                  )}

                  {isFetchingRepos ? (
                    <div className="py-16 flex flex-col items-center justify-center gap-3 text-neutral-400">
                      <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                      <p className="text-xs font-bold">Fetching repositories for &quot;{importUsername}&quot;...</p>
                    </div>
                  ) : (
                    <>
                      {/* Controls: Search & Select All */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={importSearchQuery}
                            onChange={(e) => setImportSearchQuery(e.target.value)}
                            placeholder="Search repositories by name, language..."
                            className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={toggleSelectAllRepos}
                            className="px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-xl text-xs font-bold text-neutral-300 hover:text-white transition-all flex items-center gap-2"
                          >
                            <CheckSquare className="w-4 h-4 text-indigo-400" />
                            <span>Select / Deselect Unadded</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => fetchGithubRepos()}
                            className="p-2.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 rounded-xl text-neutral-400 hover:text-white transition-all"
                            title="Refresh Repositories"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Developer selection for imports */}
                      <div className="bg-neutral-950/50 p-4 border border-neutral-800/80 rounded-2xl space-y-2">
                        <label className="block text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">
                          Assign Developers to Imported Projects
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {developersData.map((dev) => {
                            const isAssigned = importDevIds.includes(dev.id);
                            return (
                              <button
                                type="button"
                                key={dev.id}
                                onClick={() => toggleImportDevSelection(dev.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                                  isAssigned
                                    ? "bg-indigo-600 text-white border-indigo-600"
                                    : "bg-neutral-900 text-neutral-400 border-neutral-800 hover:border-neutral-700"
                                }`}
                              >
                                {dev.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Repo List Grid */}
                      <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                        {filteredImportRepos.length === 0 ? (
                          <div className="py-10 text-center text-neutral-500 text-xs font-semibold">
                            No repositories found matching your query.
                          </div>
                        ) : (
                          filteredImportRepos.map((repo) => {
                            const isSelected = selectedRepoUrls.includes(repo.html_url);
                            return (
                              <div
                                key={repo.id}
                                onClick={() => {
                                  if (!repo.is_already_added && !isBatchImporting) {
                                    toggleSelectRepo(repo.html_url);
                                  }
                                }}
                                className={`flex items-start justify-between p-4 rounded-2xl border transition-all ${
                                  repo.is_already_added
                                    ? "bg-neutral-950/40 border-neutral-900 opacity-60 cursor-not-allowed"
                                    : isSelected
                                    ? "bg-indigo-600/10 border-indigo-500/50 cursor-pointer"
                                    : "bg-neutral-950/80 border-neutral-800/80 hover:border-neutral-700 cursor-pointer"
                                }`}
                              >
                                <div className="flex items-start gap-3 min-w-0">
                                  <div className="mt-0.5">
                                    {repo.is_already_added ? (
                                      <div className="w-5 h-5 rounded-md bg-neutral-800 flex items-center justify-center text-neutral-500">
                                        <Check className="w-3.5 h-3.5" />
                                      </div>
                                    ) : isSelected ? (
                                      <div className="w-5 h-5 rounded-md bg-indigo-600 flex items-center justify-center text-white">
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                      </div>
                                    ) : (
                                      <div className="w-5 h-5 rounded-md border border-neutral-700 bg-neutral-900" />
                                    )}
                                  </div>

                                  <div className="min-w-0 space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-extrabold text-sm text-white">{repo.name}</span>
                                      {repo.language && (
                                        <Badge variant="outline" className="text-[10px] bg-neutral-900 border-neutral-700 text-neutral-300">
                                          {repo.language}
                                        </Badge>
                                      )}
                                      {repo.stargazers_count > 0 && (
                                        <span className="text-[11px] text-amber-400 font-bold">
                                          ★ {repo.stargazers_count}
                                        </span>
                                      )}
                                      {repo.is_already_added && (
                                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                          Already Added
                                        </span>
                                      )}
                                    </div>
                                    {repo.description && (
                                      <p className="text-xs text-neutral-400 line-clamp-1">{repo.description}</p>
                                    )}
                                  </div>
                                </div>

                                <a
                                  href={repo.html_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 text-neutral-500 hover:text-neutral-300 transition-colors shrink-0"
                                  title="View on GitHub"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-neutral-800 bg-neutral-900/90 flex items-center justify-between shrink-0">
                  <span className="text-xs text-neutral-400 font-bold">
                    {selectedRepoUrls.length} repository(ies) selected
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsImportModalOpen(false)}
                      disabled={isBatchImporting}
                      className="px-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-bold text-neutral-400 hover:text-white disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteBatchImport}
                      disabled={selectedRepoUrls.length === 0 || isBatchImporting}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
                    >
                      {isBatchImporting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Importing...</span>
                        </>
                      ) : (
                        <span>Import Selected Repositories</span>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}