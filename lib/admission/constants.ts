export const STATUSES = ["pending", "under_review", "approved", "rejected"] as const;
export type AdmissionStatus = (typeof STATUSES)[number];

export const STATUS_META: Record<AdmissionStatus, { label: string; variant: "warning" | "info" | "success" | "destructive" }> = {
  pending: { label: "Pending", variant: "warning" },
  under_review: { label: "Under Review", variant: "info" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
};

export const ACADEMIC_SESSIONS = ["2024-25", "2025-26", "2026-27", "2027-28"] as const;
export const CURRENT_SESSION = "2026-27";

export const GENDERS = ["Male", "Female", "Other"] as const;
export const ADMISSION_TYPES = ["Regular", "Lateral Entry", "Transfer", "Management Quota", "Scholarship"] as const;
export const QUALIFICATIONS = ["10th / Secondary", "12th / Higher Secondary", "Diploma", "Bachelor's Degree", "Master's Degree"] as const;
export const GRADE_TYPES = ["Percentage", "CGPA"] as const;

export interface CourseDef {
  name: string;
  code: string;
  department: string;
  /** Number of terms. Labelled "Semester" when `termType` is semester, otherwise "Year". */
  terms: number;
  termType: "Semester" | "Year";
}

export const DEPARTMENTS = ["Engineering", "Commerce & Management", "Science", "Arts & Humanities", "Computer Applications"] as const;

export const COURSES: CourseDef[] = [
  { name: "B.Tech Computer Science", code: "BTCS", department: "Engineering", terms: 8, termType: "Semester" },
  { name: "B.Tech Mechanical", code: "BTME", department: "Engineering", terms: 8, termType: "Semester" },
  { name: "B.Tech Electronics", code: "BTEC", department: "Engineering", terms: 8, termType: "Semester" },
  { name: "B.Com (Hons)", code: "BCOM", department: "Commerce & Management", terms: 6, termType: "Semester" },
  { name: "BBA", code: "BBA", department: "Commerce & Management", terms: 6, termType: "Semester" },
  { name: "MBA", code: "MBA", department: "Commerce & Management", terms: 4, termType: "Semester" },
  { name: "B.Sc Physics", code: "BSPH", department: "Science", terms: 6, termType: "Semester" },
  { name: "B.Sc Chemistry", code: "BSCH", department: "Science", terms: 6, termType: "Semester" },
  { name: "B.Sc Mathematics", code: "BSMA", department: "Science", terms: 6, termType: "Semester" },
  { name: "BA English", code: "BAEN", department: "Arts & Humanities", terms: 3, termType: "Year" },
  { name: "BA Economics", code: "BAEC", department: "Arts & Humanities", terms: 3, termType: "Year" },
  { name: "BCA", code: "BCA", department: "Computer Applications", terms: 6, termType: "Semester" },
  { name: "MCA", code: "MCA", department: "Computer Applications", terms: 4, termType: "Semester" },
];

export const courseByName = (name: string) => COURSES.find((c) => c.name === name);
export const coursesForDepartment = (department: string) => COURSES.filter((c) => c.department === department);
export const termsForCourse = (courseName: string) => {
  const c = courseByName(courseName);
  if (!c) return [];
  return Array.from({ length: c.terms }, (_, i) => `${c.termType} ${i + 1}`);
};

export const DOCUMENT_KEYS = ["marksheet", "transferCertificate", "migrationCertificate", "identityProof", "addressProof"] as const;
export type DocumentKey = (typeof DOCUMENT_KEYS)[number];

export const DOCUMENT_META: Record<DocumentKey, { label: string; required: boolean; hint: string }> = {
  marksheet: { label: "Previous Marksheet", required: true, hint: "Latest qualifying examination marksheet" },
  transferCertificate: { label: "Transfer Certificate", required: false, hint: "Required if transferring from another institution" },
  migrationCertificate: { label: "Migration Certificate", required: false, hint: "Required for students from another board/university" },
  identityProof: { label: "Identity Proof", required: true, hint: "Aadhaar, passport or voter ID" },
  addressProof: { label: "Address Proof", required: true, hint: "Utility bill, rent agreement or bank statement" },
};

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const ACCEPTED_DOC_TYPES = ["application/pdf", "image/jpeg", "image/png"];
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
