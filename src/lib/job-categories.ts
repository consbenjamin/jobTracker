/**
 * Categorías de trabajo para vacantes descubiertas.
 * Slugs compatibles con Remotive API; se usan también para filtrar y para búsqueda LinkedIn.
 */
export const JOB_CATEGORIES = [
  { id: "software-development", label: "Software Development", linkedInQuery: "software developer" },
  { id: "marketing", label: "Marketing", linkedInQuery: "marketing manager" },
  { id: "design", label: "Design", linkedInQuery: "product designer" },
  { id: "customer-service", label: "Customer Service", linkedInQuery: "customer support" },
  { id: "sales-business", label: "Sales / Business", linkedInQuery: "sales representative" },
  { id: "product", label: "Product", linkedInQuery: "product manager" },
  { id: "project-management", label: "Project Management", linkedInQuery: "project manager" },
  { id: "ai-ml", label: "AI / ML", linkedInQuery: "machine learning engineer" },
  { id: "data", label: "Data Analysis", linkedInQuery: "data analyst" },
  { id: "devops", label: "DevOps / Sysadmin", linkedInQuery: "devops engineer" },
  { id: "finance", label: "Finance", linkedInQuery: "financial analyst" },
  { id: "human-resources", label: "Human Resources", linkedInQuery: "hr manager" },
  { id: "qa", label: "QA", linkedInQuery: "qa engineer" },
  { id: "writing", label: "Writing", linkedInQuery: "content writer" },
  { id: "legal", label: "Legal", linkedInQuery: "legal counsel" },
  { id: "medical", label: "Medical", linkedInQuery: "medical" },
  { id: "education", label: "Education", linkedInQuery: "education" },
  { id: "all-others", label: "All others", linkedInQuery: "remote jobs" },
] as const;

export type JobCategoryId = (typeof JOB_CATEGORIES)[number]["id"];

export const DEFAULT_JOB_CATEGORIES: JobCategoryId[] = ["software-development"];

export function getCategoryById(id: string): (typeof JOB_CATEGORIES)[number] | undefined {
  return JOB_CATEGORIES.find((c) => c.id === id);
}

export function getLinkedInQueryForCategory(categoryId: string): string {
  const cat = getCategoryById(categoryId);
  return cat?.linkedInQuery ?? "software developer";
}

export function parseUserJobCategories(json: string | null): string[] {
  if (!json?.trim()) return [...DEFAULT_JOB_CATEGORIES];
  try {
    const arr = JSON.parse(json) as unknown;
    if (!Array.isArray(arr)) return [...DEFAULT_JOB_CATEGORIES];
    const valid = arr.filter(
      (x): x is string => typeof x === "string" && JOB_CATEGORIES.some((c) => c.id === x)
    );
    return valid.length > 0 ? valid : [...DEFAULT_JOB_CATEGORIES];
  } catch {
    return [...DEFAULT_JOB_CATEGORIES];
  }
}
