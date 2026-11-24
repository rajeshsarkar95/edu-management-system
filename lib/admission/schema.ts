
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
  name: z.string().default(""),
  size: z.number().nonnegative().default(0),
  type: z.string().default(""),
  url: z.string().optional(),
  dataUrl: z.string().optional(),
});

export type FileMeta = z.infer<typeof fileSchema>;

const requiredFile = (message: string) =>
  z.preprocess(
    (value) => value === undefined ? null : value,
    fileSchema.nullable().refine((value) => value !== null, {
      message,
    })
  );

const optionalFile = z.preprocess(
  (value) => value === undefined ? null : value,
  fileSchema.nullable()
);

const requiredString = (label: string, min = 1, max = 120) =>
  z.preprocess(
    (value) => value ?? "",
    z.string()
      .trim()
      .min(min, `${label} is required`)
      .max(max, `${label} is too long`)
  );

const phone = (label: string) =>
  z.preprocess(
    (value) => value ?? "",
    z.string()
      .trim()
      .min(1, `${label} is required`)
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")
  );

const personName = (label:string) =>
  z.preprocess(
    (value) => value ?? "",
    z.string()
      .trim()
      .min(2, `${label} must be at least 2 characters`)
      .max(80, `${label} is too long`)
      .regex(
        /^[A-Za-z][A-Za-z .'-]*$/,
        `${label} can only contain letters`
      )
  );

const requiredEnum = <T extends readonly [string, ...string[]]>(
  values: T,
  message: string
) =>
  z.preprocess(
    (value) => value ?? "",
    z.enum(values, { message })
  );

const MIN_AGE = 14;
const MAX_AGE = 60;
function ageFrom(dob: string) {
  const date = new Date(`${dob}T00:00:00`);
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDifference = now.getMonth() - date.getMonth();
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && now.getDate() < date.getDate())
  ) {
    age--;
  }

  return age;
}


const dobSchema = z.preprocess(
  (value) => value ?? "",
  z.string()
    .trim()
    .min(1, "Date of birth is required")
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Enter a valid date"
    )
    .refine((value) => {
      const [year, month, day] = value.split("-").map(Number);

      const date = new Date(year, month - 1, day);

      return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
      );
    }, "Enter a valid date")
    .refine(
      (value) => ageFrom(value) >= MIN_AGE,
      `Student must be at least ${MIN_AGE} years old`
    )
    .refine(
      (value) => ageFrom(value) <= MAX_AGE,
      `Student age cannot exceed ${MAX_AGE} years`
    )
    .refine(
      (value) => {
        const [year, month, day] = value.split("-").map(Number);
        const dob = new Date(year, month - 1, day);
        const today = new Date();

        today.setHours(0, 0, 0, 0);

        return dob <= today;
      },
      "Date of birth cannot be in the future"
    )
);


/* =========================================
   PERSONAL INFORMATION
========================================= */


export const personalSchema = z.object({
  fullName: personName("Full name"),

  dob: dobSchema,

  gender: requiredEnum(
    GENDERS,
    "Select a gender"
  ),

  email: z.preprocess(
    (value) => value ?? "",
    z.string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address")
  ),

  mobile: z
    .string()
    .trim()
    .min(1, "Mobile number is required")
    .regex(
      /^[6-9]\d{9}$/,
      "Enter a valid 10-digit Indian mobile number"
    ),

  photo: requiredFile("Student photograph is required"),
});





export const parentSchema = z.object({
  fatherName: personName("Father's name"),

  motherName: personName("Mother's name"),

  guardianName: personName("Guardian name"),

  guardianMobile: phone("Guardian mobile number"),

  parentOccupation: requiredString(
    "Parent occupation",
    2,
    80
  ),
});


const thisYear = new Date().getFullYear();

export const academicSchema = z
  .object({
    previousSchool: requiredString(
      "Previous school/college",
      3,
      120
    ),

    qualification: requiredEnum(
      QUALIFICATIONS,
      "Select a qualification"
    ),

    board: requiredString(
      "Board/University",
      2,
      120
    ),

    passingYear: z.preprocess(
      (value) => value ?? "",
      z.string()
        .regex(/^\d{4}$/, "Enter a 4-digit year")
        .refine(
          (value) =>
            Number(value) >= 1990 &&
            Number(value) <= thisYear,
          `Year must be between 1990 and ${thisYear}`
        )
    ),

    gradeType: requiredEnum(
      GRADE_TYPES,
      "Select a grade type"
    ),

    score: z.preprocess(
      (value) => value ?? "",
      z.string()
        .trim()
        .min(1, "Score is required")
        .regex(
          /^\d+(\.\d{1,2})?$/,
          "Enter a valid number (maximum 2 decimals)"
        )
    ),
  })
  .superRefine((value, ctx) => {
    const score = Number(value.score);

    if (Number.isNaN(score)) return;

    if (
      value.gradeType === "Percentage" &&
      (score < 33 || score > 100)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["score"],
        message: "Percentage must be between 33 and 100",
      });
    }

    if (
      value.gradeType === "CGPA" &&
      (score < 3 || score > 10)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["score"],
        message: "CGPA must be between 3 and 10",
      });
    }
  });

export const courseSchema = z
  .object({
    session: requiredEnum(
      ACADEMIC_SESSIONS,
      "Select an academic session"
    ),

    department: requiredEnum(
      DEPARTMENTS,
      "Select a department"
    ),

    course: requiredString(
      "Course",
      1,
      120
    ),

    term: requiredString(
      "Class/Semester",
      1,
      80
    ),

    admissionType: requiredEnum(
      ADMISSION_TYPES,
      "Select an admission type"
    ),
  })
  .superRefine((value, ctx) => {
    const course = courseByName(value.course);

    if (
      value.course &&
      (!course || course.department !== value.department)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["course"],
        message: "Course does not belong to this department",
      });
    }

    if (
      value.course &&
      value.term &&
      !termsForCourse(value.course).includes(value.term)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["term"],
        message: "Select a valid class/semester",
      });
    }
  });

/* =========================================
   DOCUMENT INFORMATION
========================================= */

export const documentsSchema = z.object({
  photo: requiredFile("Student photograph is required"),

  marksheet: requiredFile("Previous marksheet is required"),

  transferCertificate: optionalFile,

  migrationCertificate: optionalFile,

  identityProof: requiredFile("Identity proof is required"),

  addressProof: requiredFile("Address proof is required"),
});

/* =========================================
   DECLARATION
========================================= */

export const reviewSchema = z.object({
  declaration: z.preprocess(
    (value) => value ?? false,
    z.boolean().refine(
      (value) => value === true,
      "You must accept the declaration to submit"
    )
  ),
});

/* =========================================
   COMPLETE ADMISSION FORM
========================================= */

export const admissionFormSchema = z.object({
  ...personalSchema.shape,
  ...parentSchema.shape,
  ...academicSchema.shape,
  ...courseSchema.shape,
  ...documentsSchema.shape,
  ...reviewSchema.shape,
});

/* =========================================
   TYPESCRIPT TYPES
========================================= */

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

/* =========================================
   EMPTY FORM VALUES
========================================= */

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

/* =========================================
   MULTI-STEP FORM CONFIGURATION
========================================= */

export const FORM_STEPS = [
  {
    id: "personal",
    title: "Personal",
    description: "Student details",
    schema: personalSchema,
    fields: Object.keys(personalSchema.shape),
  },
  {
    id: "parent",
    title: "Parent",
    description: "Family details",
    schema: parentSchema,
    fields: Object.keys(parentSchema.shape),
  },
  {
    id: "academic",
    title: "Academic",
    description: "Previous education",
    schema: academicSchema,
    fields: Object.keys(academicSchema.shape),
  },
  {
    id: "course",
    title: "Course",
    description: "Program selection",
    schema: courseSchema,
    fields: [
      "session",
      "department",
      "course",
      "term",
      "admissionType",
    ],
  },
  {
    id: "documents",
    title: "Documents",
    description: "Document uploads",
    schema: documentsSchema,
    fields: Object.keys(documentsSchema.shape),
  },
  {
    id: "review",
    title: "Review",
    description: "Confirm & submit",
    schema: reviewSchema,
    fields: ["declaration"],
  },
] as const;

export { COURSES };
