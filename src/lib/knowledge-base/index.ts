import generated from "./datasets.generated.json";

export interface KnowledgeBaseQuestion {
  id: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  difficulty: number;
  difficultyLabel: string;
  questionText: string;
  options: { A: string; B: string; C: string; D: string };
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
  estTimeSec: number;
  source: {
    dataset: string;
    config: string;
    license: string;
    url: string;
    citation: string;
  };
}

export interface KnowledgeBaseTopic {
  id: string;
  name: string;
  questionCount: number;
}

export interface KnowledgeBaseSource {
  dataset: string;
  config: string;
  license: string;
  url: string;
  citation: string;
  questionCount: number;
}

export interface KnowledgeBaseSubject {
  id: string;
  name: string;
  category: string;
  description: string;
  folder: string;
  questionCount: number;
  topicCount: number;
  difficultyCounts: Record<string, number>;
  sources: KnowledgeBaseSource[];
  topics: KnowledgeBaseTopic[];
  questions: KnowledgeBaseQuestion[];
}

export interface KnowledgeBaseAttribution {
  dataset: string;
  config?: string;
  url: string;
  license: string;
  citation: string;
}

export interface KnowledgeBase {
  generatedAt: string;
  source: KnowledgeBaseAttribution;
  additionalSources: KnowledgeBaseAttribution[];
  method: string;
  totals: {
    subjects: number;
    questions: number;
    topics: number;
  };
  subjects: KnowledgeBaseSubject[];
}

export const KNOWLEDGE_BASE = generated as unknown as KnowledgeBase;
export const KNOWLEDGE_BASE_SUBJECTS = KNOWLEDGE_BASE.subjects;
export const KNOWLEDGE_BASE_TOTALS = KNOWLEDGE_BASE.totals;

export function getKnowledgeBaseSubject(
  subjectId: string
): KnowledgeBaseSubject | undefined {
  return KNOWLEDGE_BASE_SUBJECTS.find((subject) => subject.id === subjectId);
}

export function getKnowledgeBaseQuestionsForTopic(
  subjectId: string,
  topicId: string
): KnowledgeBaseQuestion[] {
  return (
    getKnowledgeBaseSubject(subjectId)?.questions.filter(
      (question) => question.topicId === topicId
    ) ?? []
  );
}
