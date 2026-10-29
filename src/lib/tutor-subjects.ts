import { SUBJECTS, type Subject } from "./data";

export interface TutorSubjectGroup {
  label: string;
  subjects: Subject[];
}

const GROUPS: { label: string; ids: string[] }[] = [
  {
    label: "Mathematics",
    ids: [
      "general-mathematics",
      "statistics-and-probability",
      "pre-calculus",
      "basic-calculus",
    ],
  },
  {
    label: "Sciences",
    ids: [
      "general-biology-1",
      "general-biology-2",
      "general-chemistry-1",
      "general-chemistry-2",
      "general-physics-1",
      "general-physics-2",
      "earth-and-life-science",
    ],
  },
  {
    label: "Research & Applied STEM",
    ids: [
      "research-1",
      "research-2",
      "capstone-project",
      "empowerment-technologies",
      "science-technology-and-society",
    ],
  },
];

export const TUTOR_SUBJECT_GROUPS: TutorSubjectGroup[] = GROUPS.map(
  (group) => ({
    label: group.label,
    subjects: group.ids
      .map((id) => SUBJECTS.find((subject) => subject.id === id))
      .filter((subject): subject is Subject => Boolean(subject)),
  })
).filter((group) => group.subjects.length > 0);

export const TUTOR_SUBJECTS: Subject[] = TUTOR_SUBJECT_GROUPS.flatMap(
  (group) => group.subjects
);

export const DEFAULT_TUTOR_SUBJECT = "Pre-Calculus";

export function isTutorSubject(name: string): boolean {
  return TUTOR_SUBJECTS.some((subject) => subject.name === name);
}
