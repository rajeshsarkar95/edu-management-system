import { COURSES, type AdmissionStatus } from "./constants";
import type { FileMeta } from "./schema";
import type { Application, TimelineEvent } from "./types";

/* Deterministic PRNG so seed data is stable between loads. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST_NAMES = [
  "Aarav", "Ananya", "Vihaan", "Diya", "Arjun", "Isha", "Rohan", "Meera", "Kabir", "Saanvi", "Aditya", "Riya", "Karan", "Priya",
  "Devansh", "Tanvi", "Yash", "Kavya", "Harsh", "Neha", "Ishaan", "Pooja", "Siddharth", "Anjali", "Manav", "Sneha", "Pranav", "Nisha",
  "Rahul", "Shreya", "Nikhil", "Aditi", "Varun", "Simran", "Dhruv", "Tara", "Lakshya", "Ritika", "Tushar", "Bhavna", "Mohit", "Palak",
  "Ayaan", "Jiya", "Krish", "Muskan", "Naman", "Sakshi", "Parth", "Khushi",
];
const LAST_NAMES = ["Sharma", "Verma", "Gupta", "Singh", "Rawat", "Negi", "Bisht", "Joshi", "Nautiyal", "Bhatt", "Kapoor", "Mehta", "Agarwal", "Chauhan", "Thakur", "Pandey", "Rana", "Saxena"];
const FATHER_FIRST = ["Rajesh", "Suresh", "Mahesh", "Anil", "Vinod", "Sanjay", "Manoj", "Deepak", "Ramesh", "Ashok", "Pradeep", "Vijay"];
const MOTHER_FIRST = ["Sunita", "Anita", "Rekha", "Seema", "Kavita", "Meena", "Pushpa", "Geeta", "Sarita", "Nirmala", "Usha", "Radha"];
const OCCUPATIONS = ["Business Owner", "Government Employee", "Teacher", "Farmer", "Software Engineer", "Doctor", "Shopkeeper", "Bank Manager", "Army Personnel", "Contractor"];
const SCHOOLS = [
  "St. Joseph's Academy, Dehradun", "Doon Public School", "Kendriya Vidyalaya No. 2", "DAV Inter College", "Welham Girls' School",
  "Army Public School", "Modern Convent School", "Government Inter College, Haridwar", "Delhi Public School, Roorkee", "Carmel Convent School",
];
const BOARDS = ["CBSE", "ICSE", "Uttarakhand Board", "UP Board", "HNB Garhwal University", "Delhi University"];
const QUALIFICATIONS_BY_LEVEL = {
  ug: ["12th / Higher Secondary"],
  pg: ["Bachelor's Degree"],
} as const;
const PG = new Set(["MBA", "MCA"]);

const BASE = new Date("2026-11-20T10:30:00+05:30").getTime();
const DAY = 86_400_000;

const file = (name: string, size: number, type = "application/pdf"): FileMeta => ({ name, size, type });

function timelineFor(
  idx: number,
  status: AdmissionStatus,
  appliedAt: number,
  rand: () => number,
): { timeline: TimelineEvent[]; decidedAt?: string; remarks?: string } {
  const mk = (n: number, kind: TimelineEvent["kind"], title: string, at: number, by: string, description?: string): TimelineEvent => ({
    id: `seed-${idx}-${n}`,
    kind,
    title,
    description,
    at: new Date(at).toISOString(),
    by,
  });
  const events: TimelineEvent[] = [mk(1, "submitted", "Application submitted", appliedAt, "Applicant", "Online application received.")];
  let decidedAt: string | undefined;
  let remarks: string | undefined;
  if (status !== "pending") {
    const t1 = appliedAt + (1 + Math.floor(rand() * 2)) * DAY;
    events.push(mk(2, "documents", "Documents verified", t1, "Admissions Office", "All mandatory documents checked."));
    const t2 = t1 + DAY * 0.5;
    events.push(mk(3, "review", "Moved to review", t2, "Admissions Office", "Forwarded to the department for evaluation."));
    if (status === "approved" || status === "rejected") {
      const t3 = t2 + (1 + Math.floor(rand() * 3)) * DAY;
      decidedAt = new Date(t3).toISOString();
      if (status === "approved") {
        remarks = "Eligible as per merit criteria. Admission offered.";
        events.push(mk(4, "approved", "Admission approved", t3, "Admission Committee", remarks));
      } else {
        remarks = ["Did not meet the minimum eligibility criteria.", "Incomplete academic documentation.", "Seats full for the selected course."][Math.floor(rand() * 3)];
        events.push(mk(4, "rejected", "Application rejected", t3, "Admission Committee", remarks));
      }
    }
  }
  return { timeline: events, decidedAt, remarks };
}

export function buildSeedApplications(count = 48): Application[] {
  const rand = mulberry32(2026);
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
  const apps: Application[] = [];

  for (let i = 0; i < count; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = pick(LAST_NAMES);
    const course = COURSES[Math.floor(rand() * COURSES.length)];
    const isPG = PG.has(course.name);
    const gender = ["Ananya", "Diya", "Isha", "Meera", "Saanvi", "Riya", "Priya", "Tanvi", "Kavya", "Neha", "Pooja", "Anjali", "Sneha", "Nisha", "Shreya", "Aditi", "Simran", "Tara", "Ritika", "Bhavna", "Palak", "Jiya", "Muskan", "Sakshi", "Khushi"].includes(first)
      ? "Female"
      : "Male";

    // Spread applications over ~170 days, newest first by index; skew toward recent.
    const daysAgo = Math.floor(Math.pow(rand(), 1.35) * 170) + 1;
    const appliedAt = BASE - daysAgo * DAY - Math.floor(rand() * 8) * 3_600_000;

    // Older applications are more likely to be decided.
    const r = rand() + (daysAgo > 60 ? 0.25 : daysAgo > 25 ? 0.1 : -0.15);
    const status: AdmissionStatus = r > 0.95 ? "rejected" : r > 0.55 ? "approved" : r > 0.3 ? "under_review" : "pending";

    const gradeIsCgpa = rand() > 0.75;
    const score = gradeIsCgpa ? (6 + rand() * 3.8).toFixed(1) : (55 + rand() * 42).toFixed(1);
    const dobYear = isPG ? 2002 - Math.floor(rand() * 3) : 2008 - Math.floor(rand() * 2);
    const dob = `${dobYear}-${String(1 + Math.floor(rand() * 12)).padStart(2, "0")}-${String(1 + Math.floor(rand() * 27)).padStart(2, "0")}`;
    const fatherName = `${pick(FATHER_FIRST)} ${last}`;
    const mobile = `${pick(["98", "97", "99", "89", "70", "88"])}${String(Math.floor(rand() * 1e8)).padStart(8, "0")}`;
    const guardianMobile = `${pick(["98", "97", "99", "89"])}${String(Math.floor(rand() * 1e8)).padStart(8, "0")}`;
    const t = appliedAt;
    const { timeline, decidedAt, remarks } = timelineFor(i, status, t, rand);
    const term = `${course.termType} 1`;
    const hasTransfer = rand() > 0.6;
    const hasMigration = rand() > 0.75;
    const sessionYear = new Date(appliedAt).getFullYear();
    const session = new Date(appliedAt).getMonth() >= 5 ? `${sessionYear}-${String((sessionYear + 1) % 100).padStart(2, "0")}` : `${sessionYear - 1}-${String(sessionYear % 100).padStart(2, "0")}`;
    const normalizedSession = (["2024-25", "2025-26", "2026-27", "2027-28"].includes(session) ? session : "2026-27") as Application["session"];

    apps.push({
      id: `APP-2026-${String(count - i + 1000).padStart(4, "0")}`,
      applicationDate: new Date(appliedAt).toISOString(),
      status,
      remarks,
      decidedAt,
      timeline,
      fullName: `${first} ${last}`,
      dob,
      gender,
      email: `${first}.${last}${Math.floor(rand() * 90 + 10)}@mail.com`.toLowerCase(),
      mobile,
      photo: file(`${first.toLowerCase()}-photo.jpg`, 64_000 + Math.floor(rand() * 90_000), "image/jpeg"),
      fatherName,
      motherName: `${pick(MOTHER_FIRST)} ${last}`,
      guardianName: fatherName,
      guardianMobile,
      parentOccupation: pick(OCCUPATIONS),
      previousSchool: pick(SCHOOLS),
      qualification: QUALIFICATIONS_BY_LEVEL[isPG ? "pg" : "ug"][0],
      board: isPG ? pick(["HNB Garhwal University", "Delhi University"]) : pick(["CBSE", "ICSE", "Uttarakhand Board", "UP Board"]),
      passingYear: String(isPG ? 2024 + Math.floor(rand() * 2) : 2025 + (rand() > 0.6 ? 1 : 0) - (rand() > 0.85 ? 1 : 0)),
      gradeType: gradeIsCgpa ? "CGPA" : "Percentage",
      score,
      session: normalizedSession,
      department: course.department as Application["department"],
      course: course.name,
      term,
      admissionType: pick(["Regular", "Regular", "Regular", "Lateral Entry", "Management Quota", "Scholarship"] as const),
      marksheet: file(`marksheet-${first.toLowerCase()}.pdf`, 220_000 + Math.floor(rand() * 400_000)),
      transferCertificate: hasTransfer ? file(`tc-${first.toLowerCase()}.pdf`, 120_000 + Math.floor(rand() * 200_000)) : null,
      migrationCertificate: hasMigration ? file(`migration-${first.toLowerCase()}.pdf`, 120_000 + Math.floor(rand() * 200_000)) : null,
      identityProof: file(`aadhaar-${first.toLowerCase()}.jpg`, 300_000 + Math.floor(rand() * 500_000), "image/jpeg"),
      addressProof: file(`address-proof-${first.toLowerCase()}.pdf`, 180_000 + Math.floor(rand() * 300_000)),
      declaration: true,
    });
  }

  return apps.sort((a, b) => b.applicationDate.localeCompare(a.applicationDate));
}
