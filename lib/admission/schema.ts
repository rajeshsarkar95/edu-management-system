import { z } from "zod";
import {
  ACADEMIC_SESSIONS,
  ADMISSION_TYPES,
  COURSES,
  DEPARTMENTS,
  GENDERS,
  GRADE_TYPES,
  QUALIFICATIONS,
  courseByName,
  termsForCourse,
} from "./constants";

export const fileSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
  url: z.string().optional(),      
  dataUrl: z.string().optional(),
});
export type FileMeta = z.infer<typeof fileSchema>;

const requiredFile = (message: string) =>
  fileSchema.nullable().refine((v) => v !== null, { message });
const optionalFile = fileSchema.nullable();

const phone = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

const personName = (label: string) =>
  z
    .string()
    .trim()
    .min(2, `${label} must be at least 2 characters`)
    .max(80, `${label} is too long`)
    .regex(/^[A-Za-z][A-Za-z .'-]*$/, `${label} can only contain letters`);

const MIN_AGE = 14;
const MAX_AGE = 60;

function ageFrom(dob: string) {
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export const personalSchema = z.object({
  fullName: personName("Full name"),
  dob: z
    .string()
    .min(1, "Date of birth is required")
    .refine((v) => !Number.isNaN(new Date(v).getTime()), "Enter a valid date")
    .refine((v) => new Date(v) <= new Date(), "Date of birth cannot be in the future")
    .refine((v) => ageFrom(v) >= MIN_AGE, `Student must be at least ${MIN_AGE} years old`)
    .refine((v) => ageFrom(v) <= MAX_AGE, "Please check the date of birth"),
  gender: z.enum(GENDERS, { message: "Select a gender" }),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  mobile: phone("Mobile number"),
  photo: requiredFile("Student photograph is required"),
});

export const parentSchema = z.object({
  fatherName: personName("Father's name"),
  motherName: personName("Mother's name"),
  guardianName: personName("Guardian name"),
  guardianMobile: phone("Guardian mobile number"),
  parentOccupation: z.string().trim().min(2, "Parent occupation is required").max(80),
});

const thisYear = new Date().getFullYear();

export const academicSchema = z
  .object({
    previousSchool: z.string().trim().min(3, "Previous school/college is required").max(120),
    qualification: z.enum(QUALIFICATIONS, { message: "Select a qualification" }),
    board: z.string().trim().min(2, "Board/University is required").max(120),
    passingYear: z
      .string()
      .regex(/^\d{4}$/, "Enter a 4-digit year")
      .refine((v) => Number(v) >= 1990 && Number(v) <= thisYear, `Year must be between 1990 and ${thisYear}`),
    gradeType: z.enum(GRADE_TYPES),
    score: z
      .string()
      .trim()
      .min(1, "Score is required")
      .regex(/^\d+(\.\d{1,2})?$/, "Enter a valid number (max 2 decimals)"),
  })
  .superRefine((v, ctx) => {
    const n = Number(v.score);
    if (Number.isNaN(n)) return;
    if (v.gradeType === "Percentage" && (n < 33 || n > 100)) {
      ctx.addIssue({ code: "custom", path: ["score"], message: "Percentage must be between 33 and 100" });
    }
    if (v.gradeType === "CGPA" && (n < 3 || n > 10)) {
      ctx.addIssue({ code: "custom", path: ["score"], message: "CGPA must be between 3 and 10" });
    }
  });

export const courseSchema = z
  .object({
    session: z.enum(ACADEMIC_SESSIONS, { message: "Select an academic session" }),
    department: z.enum(DEPARTMENTS, { message: "Select a department" }),
    course: z.string().min(1, "Select a course"),
    term: z.string().min(1, "Select a class/semester"),
    admissionType: z.enum(ADMISSION_TYPES, { message: "Select an admission type" }),
  })
  .superRefine((v, ctx) => {
    const c = courseByName(v.course);
    if (v.course && (!c || c.department !== v.department)) {
      ctx.addIssue({ code: "custom", path: ["course"], message: "Course does not belong to this department" });
    }
    if (v.course && v.term && !termsForCourse(v.course).includes(v.term)) {
      ctx.addIssue({ code: "custom", path: ["term"], message: "Select a valid class/semester" });
    }
  });

export const documentsSchema = z.object({
  photo: requiredFile("Student photograph is required"),
  marksheet: requiredFile("Previous marksheet is required"),
  transferCertificate: optionalFile,
  migrationCertificate: optionalFile,
  identityProof: requiredFile("Identity proof is required"),
  addressProof: requiredFile("Address proof is required"),
});

export const reviewSchema = z.object({
  declaration: z.boolean().refine((v) => v === true, "You must accept the declaration to submit"),
});

export const admissionFormSchema = z.object({
  ...personalSchema.shape,
  ...parentSchema.shape,
  ...academicSchema.shape,
  ...courseSchema.shape,
  ...documentsSchema.shape,
  ...reviewSchema.shape,
});

export type AdmissionFormValues = {
  fullName: string;
  dob: string;
  gender: (typeof GENDERS)[number] | "";
  email: string;
  mobile: string;
  photo: FileMeta | null;
  fatherName: string;
  motherName: string;
  guardianName: string;
  guardianMobile: string;
  parentOccupation: string;
  previousSchool: string;
  qualification: (typeof QUALIFICATIONS)[number] | "";
  board: string;
  passingYear: string;
  gradeType: (typeof GRADE_TYPES)[number];
  score: string;
  session: (typeof ACADEMIC_SESSIONS)[number] | "";
  department: (typeof DEPARTMENTS)[number] | "";
  course: string;
  term: string;
  admissionType: (typeof ADMISSION_TYPES)[number] | "";
  marksheet: FileMeta | null;
  transferCertificate: FileMeta | null;
  migrationCertificate: FileMeta | null;
  identityProof: FileMeta | null;
  addressProof: FileMeta | null;
  declaration: boolean;
};

export const emptyFormValues: AdmissionFormValues = {
  fullName: "",
  dob: "",
  gender: "",
  email: "",
  mobile: "",
  photo: null,
  fatherName: "",
  motherName: "",
  guardianName: "",
  guardianMobile: "",
  parentOccupation: "",
  previousSchool: "",
  qualification: "",
  board: "",
  passingYear: "",
  gradeType: "Percentage",
  score: "",
  session: "",
  department: "",
  course: "",
  term: "",
  admissionType: "",
  marksheet: null,
  transferCertificate: null,
  migrationCertificate: null,
  identityProof: null,
  addressProof: null,
  declaration: false,
};

export const FORM_STEPS = [
  { id: "personal", title: "Personal", description: "Student details", schema: personalSchema, fields: Object.keys(personalSchema.shape) },
  { id: "parent", title: "Parent", description: "Family details", schema: parentSchema, fields: Object.keys(parentSchema.shape) },
  { id: "academic", title: "Academic", description: "Previous education", schema: academicSchema, fields: Object.keys(academicSchema.shape) },
  { id: "course", title: "Course", description: "Program selection", schema: courseSchema, fields: ["session", "department", "course", "term", "admissionType"] },
  { id: "documents", title: "Documents", description: "Uploads", schema: documentsSchema, fields: Object.keys(documentsSchema.shape) },
  { id: "review", title: "Review", description: "Confirm & submit", schema: reviewSchema, fields: ["declaration"] },
] as const;

export { COURSES };
