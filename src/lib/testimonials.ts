// Google Sheet Testimonials Parser & Utility

export interface Testimonial {
  timestamp: string;
  name: string;
  program: string;
  section: string;
  session: string;
  course: string;
  rating: number;
  feedback: string;
  dislike: string;
  improvement: string;
  recommend: string;
  skills: string[];
  linkedinUrl: string | null;
  githubUrl: string | null;
  githubUsername: string | null;
  avatarUrl: string | null;
  githubBio?: string | null;
}

// Simple in-memory cache for profiles
const profileCache: Record<string, { avatarUrl: string | null; bio: string | null }> = {};

/**
 * Extracts and normalizes GitHub usernames and URLs
 */
export function cleanGithubUrl(text: string): { url: string | null; username: string | null } {
  if (!text) return { url: null, username: null };
  const match = text.match(/(https?:\/\/(www\.)?github\.com\/([a-zA-Z0-9-_]+))/i);
  if (match) {
    const username = match[3];
    return {
      url: `https://github.com/${username}`,
      username: username
    };
  }
  // Try to match if they just wrote a username or handles
  const wordMatch = text.trim().match(/^([a-zA-Z0-9-_]+)$/);
  if (wordMatch && !['yes', 'no', 'true', 'false', 'connected'].includes(wordMatch[1].toLowerCase())) {
    return {
      url: `https://github.com/${wordMatch[1]}`,
      username: wordMatch[1]
    };
  }
  return { url: null, username: null };
}

/**
 * Extracts and cleans LinkedIn URLs
 */
export function cleanLinkedinUrl(text: string): string | null {
  if (!text) return null;
  const match = text.match(/(https?:\/\/(www\.)?([a-z]{2}\.)?linkedin\.com\/in\/([a-zA-Z0-9-_%]+))/i);
  if (match) {
    return `https://www.linkedin.com/in/${match[4]}`;
  }
  return null;
}

/**
 * Robust CSV parser that handles quoted cells, newlines inside cells, and commas inside cells.
 */
export function parseCSV(csvText: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let curr = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          curr += '"';
          i++; // Skip next quote
        } else {
          inQuotes = false;
        }
      } else {
        curr += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(curr.trim());
        curr = '';
      } else if (char === '\n' || char === '\r') {
        row.push(curr.trim());
        curr = '';
        if (row.length > 0 && (row.length > 1 || row[0] !== '')) {
          result.push(row);
        }
        row = [];
        if (char === '\r' && nextChar === '\n') {
          i++; // Skip \n in \r\n
        }
      } else {
        curr += char;
      }
    }
  }

  if (curr || row.length > 0) {
    row.push(curr.trim());
    result.push(row);
  }

  return result;
}

/**
 * Fetches the GitHub profile data (avatar, bio) of a user with local caching.
 */
export async function getGithubProfile(username: string): Promise<{ avatarUrl: string | null; bio: string | null }> {
  if (!username) return { avatarUrl: null, bio: null };
  if (profileCache[username]) return profileCache[username];
  
  try {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      }
    });
    if (res.ok) {
      const data = await res.json();
      const profile = {
        avatarUrl: data.avatar_url || null,
        bio: data.bio || null
      };
      profileCache[username] = profile;
      return profile;
    }
  } catch (e) {
    console.warn(`Failed to fetch profile for GitHub user ${username}:`, e);
  }
  return { avatarUrl: null, bio: null };
}

/**
 * Fetches and parses testimonials from a Google Sheets sharing/editing URL.
 */
export async function fetchTestimonials(sheetUrl: string): Promise<Testimonial[]> {
  if (!sheetUrl) return [];

  // Extract Google Sheets ID
  const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!sheetIdMatch) {
    console.error("Invalid Google Sheet URL format");
    return [];
  }
  const sheetId = sheetIdMatch[1];
  
  // Construct the CSV export link
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`HTTP error fetching sheet: ${response.status}`);
    }
    const csvText = await response.text();
    const rows = parseCSV(csvText);

    if (rows.length < 2) return [];

    const headers = rows[0].map(h => h.toLowerCase().trim());
    
    // Find column indexes dynamically
    const getIndex = (keywords: string[]) => {
      return headers.findIndex(h => keywords.some(k => h.includes(k)));
    };

    const idxTimestamp = getIndex(['timestamp']);
    const idxName = getIndex(['name']);
    const idxProgram = getIndex(['program']);
    const idxSection = getIndex(['section']);
    const idxSession = getIndex(['session']);
    const idxCourse = getIndex(['course name']);
    const idxRating = getIndex(['rating']);
    const idxFeedback = getIndex(['like most', 'what did you like']);
    const idxDislike = getIndex(['dislike', 'disliked']);
    const idxImprovement = getIndex(['improved', 'improvement']);
    const idxRecommend = getIndex(['recommend']);
    const idxSkills = getIndex(['skills']);
    const idxConsent = getIndex(['fine with me posting', 'consent', 'testimonial']);
    const idxLinkedin = getIndex(['linkedin url', 'linkedin']);
    const idxGithub = getIndex(['github url', 'github']);

    const testimonials: Testimonial[] = [];

    // Parse each response row
    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0 || !row[idxName]) continue;

      // Consent check
      const consentVal = idxConsent !== -1 ? row[idxConsent]?.toLowerCase().trim() : '';
      if (consentVal === 'no' || consentVal === 'false') {
        continue;
      }

      // LinkedIn & GitHub URL cleaner
      const rawLinkedin = idxLinkedin !== -1 ? row[idxLinkedin] : '';
      const rawGithub = idxGithub !== -1 ? row[idxGithub] : '';

      const linkedinUrl = cleanLinkedinUrl(rawLinkedin);
      const { url: githubUrl, username: githubUsername } = cleanGithubUrl(rawGithub);

      // Skills cleaner (split by comma)
      const rawSkills = idxSkills !== -1 ? row[idxSkills] : '';
      const skills = rawSkills
        ? rawSkills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const ratingVal = idxRating !== -1 ? parseFloat(row[idxRating]) : 10;

      testimonials.push({
        timestamp: idxTimestamp !== -1 ? row[idxTimestamp] : '',
        name: row[idxName] || 'Anonymous Student',
        program: idxProgram !== -1 ? row[idxProgram] : '',
        section: idxSection !== -1 ? row[idxSection] : '',
        session: idxSession !== -1 ? row[idxSession] : '',
        course: idxCourse !== -1 ? row[idxCourse] : '',
        rating: isNaN(ratingVal) ? 10 : ratingVal,
        feedback: idxFeedback !== -1 ? row[idxFeedback] : '',
        dislike: idxDislike !== -1 ? row[idxDislike] : '',
        improvement: idxImprovement !== -1 ? row[idxImprovement] : '',
        recommend: idxRecommend !== -1 ? row[idxRecommend] : '',
        skills,
        linkedinUrl,
        githubUrl,
        githubUsername,
        avatarUrl: null // will be resolved asynchronously
      });
    }

    return testimonials;
  } catch (error) {
    console.error("Error fetching/parsing testimonials:", error);
    return [];
  }
}
