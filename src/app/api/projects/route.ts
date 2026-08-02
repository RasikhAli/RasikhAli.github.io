import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const projectsFilePath = path.join(process.cwd(), "data", "projects.json");

export async function GET() {
  try {
    if (fs.existsSync(projectsFilePath)) {
      const fileData = fs.readFileSync(projectsFilePath, "utf-8");
      const projects = JSON.parse(fileData);
      return NextResponse.json(projects);
    }
    return NextResponse.json([]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const projects = await request.json();
    if (!Array.isArray(projects)) {
      return NextResponse.json({ error: "Invalid projects data format" }, { status: 400 });
    }

    // Write updated projects array to local data/projects.json file
    fs.writeFileSync(projectsFilePath, JSON.stringify(projects, null, 2), "utf-8");

    return NextResponse.json({ success: true, count: projects.length });
  } catch (error: any) {
    console.error("Error saving projects to local disk:", error);
    return NextResponse.json({ error: error.message || "Failed to save projects to disk" }, { status: 500 });
  }
}
