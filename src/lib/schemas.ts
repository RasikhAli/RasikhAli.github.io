import { z } from "zod";

export const siteConfigSchema = z.object({
  site_title: z.string().min(1, "Site title is required"),
  site_subtitle: z.string().min(1, "Site subtitle is required"),
  hero_headline: z.string().min(1, "Hero headline is required"),
  hero_description: z.string().min(1, "Hero description is required"),
  portfolio_owner_name: z.string().min(1, "Portfolio owner name is required"),
  resume_url: z.string().url("Must be a valid URL").or(z.string().length(0)),
  contact_email: z.string().email("Must be a valid email"),
  github_url: z.string().url("Must be a valid URL").or(z.string().length(0)),
  linkedin_url: z.string().url("Must be a valid URL").or(z.string().length(0)),
  twitter_url: z.string().url("Must be a valid URL").or(z.string().length(0)),
  footer_content: z.string().min(1, "Footer content is required"),
  profile_bio: z.string().optional().default(""),
  profile_typing_lines: z.array(z.string()).optional().default([]),
  github_username: z.string().optional().default(""),
  seo_defaults: z.object({
    title: z.string().min(1, "SEO title is required"),
    description: z.string().min(1, "SEO description is required"),
    og_image: z.string().url("Must be a valid URL").or(z.string().length(0)),
    keywords: z.array(z.string())
  }),
  testimonials_config: z.object({
    sheet_url: z.string().url("Must be a valid URL").or(z.string().length(0)),
    title: z.string().min(1, "Testimonials title is required"),
    show_rating: z.boolean().default(true),
    show_feedback: z.boolean().default(true),
    show_dislike: z.boolean().default(false),
    show_skills: z.boolean().default(true),
    show_course: z.boolean().default(true),
    show_linkedin: z.boolean().default(true),
    show_github: z.boolean().default(true)
  }).optional().default({
    sheet_url: "",
    title: "Students Testimonial",
    show_rating: true,
    show_feedback: true,
    show_dislike: false,
    show_skills: true,
    show_course: true,
    show_linkedin: true,
    show_github: true
  })
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;

export const developerSchema = z.object({
  id: z.string().min(2, "ID must be at least 2 characters").regex(/^[a-z0-9-]+$/, "ID must be alphanumeric and lowercase with hyphens"),
  name: z.string().min(1, "Name is required"),
  designation: z.string().min(1, "Designation is required"),
  avatar: z.string().url("Must be a valid image URL").or(z.string().length(0)),
  bio: z.string().min(1, "Bio is required"),
  email: z.string().email("Must be a valid email").or(z.string().length(0)),
  github_url: z.string().url("Must be a valid URL").or(z.string().length(0)),
  linkedin_url: z.string().url("Must be a valid URL").or(z.string().length(0)),
  portfolio_url: z.string().url("Must be a valid URL").or(z.string().length(0)),
  skills: z.array(z.string()),
  featured: z.boolean().default(false),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export type Developer = z.infer<typeof developerSchema>;

export const projectSchema = z.object({
  id: z.string().min(2, "ID must be at least 2 characters").regex(/^[a-z0-9-]+$/, "ID must be alphanumeric and lowercase with hyphens"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  short_description: z.string().min(1, "Short description is required").max(200, "Short description is too long"),
  tech_stack: z.array(z.string()).min(1, "Select at least one technology"),
  screenshots: z.array(z.string()).default([]),
  start_date: z.union([z.string(), z.null()]).optional(),
  end_date: z.union([z.string(), z.null()]).optional(),
  status: z.enum(["completed", "in_progress", "planned"]),
  featured: z.boolean().default(false),
  github_repo_url: z.string().url("Must be a valid URL").or(z.string().length(0)),
  linkedin_post_url: z.string().url("Must be a valid URL").or(z.string().length(0)),
  live_url: z.string().url("Must be a valid URL").or(z.string().length(0)),
  developer_ids: z.array(z.string()).min(1, "Select at least one developer"),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export type Project = z.infer<typeof projectSchema>;