export type TemplateId = "modern" | "classic" | "compact";

export type CodeType = "qr" | "barcode" | "none";

export interface SchoolInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  website: string;
  sessionLabel: string; // e.g. "2026 – 2027"
  logoDataUrl?: string; // base64, optional
  signatureLabel: string; // e.g. "Principal"
}

export interface Student {
  id: string; // internal row id (client-generated)
  name: string;
  studentId: string;
  rollNumber: string;
  className: string; // e.g. "Grade 9"
  section: string; // e.g. "B"
  admissionNumber: string;
  dob: string; // DD/MM/YYYY as entered
  bloodGroup: string;
  guardianName: string;
  guardianPhone: string;
  address: string;
  validThrough: string; // e.g. "06/2027"
  photoDataUrl?: string;
}

export const emptyStudent = (): Student => ({
  id: crypto.randomUUID(),
  name: "",
  studentId: "",
  rollNumber: "",
  className: "",
  section: "",
  admissionNumber: "",
  dob: "",
  bloodGroup: "",
  guardianName: "",
  guardianPhone: "",
  address: "",
  validThrough: "",
  photoDataUrl: undefined,
});

export const defaultSchoolInfo: SchoolInfo = {
  name: "Greenfield Academy",
  tagline: "Learning Today, Leading Tomorrow",
  address: "14 Meridian Road, Meerut, Uttar Pradesh",
  phone: "+91 98765 43210",
  website: "www.greenfieldacademy.edu",
  sessionLabel: "2026 – 2027",
  signatureLabel: "Principal",
};

/** CSV columns expected for bulk import — order-independent, header-matched. */
export const CSV_FIELD_MAP: Record<string, keyof Student> = {
  name: "name",
  "student name": "name",
  studentid: "studentId",
  "student id": "studentId",
  roll: "rollNumber",
  rollnumber: "rollNumber",
  "roll number": "rollNumber",
  class: "className",
  "class/section": "className",
  section: "section",
  admissionnumber: "admissionNumber",
  "admission number": "admissionNumber",
  admissionno: "admissionNumber",
  dob: "dob",
  "date of birth": "dob",
  bloodgroup: "bloodGroup",
  "blood group": "bloodGroup",
  guardian: "guardianName",
  "guardian name": "guardianName",
  guardianphone: "guardianPhone",
  "guardian phone": "guardianPhone",
  address: "address",
  validthrough: "validThrough",
  "valid through": "validThrough",
};
