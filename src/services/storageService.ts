import { Student, EvaluationRecord } from '../types';
import { INITIAL_STUDENTS, INITIAL_EVALUATIONS } from '../data/sampleData';

const STORAGE_KEYS = {
  STUDENTS: 'intelligrade_students_v1',
  EVALUATIONS: 'intelligrade_evaluations_v1',
  CUSTOM_DATASET: 'intelligrade_custom_dataset_v1',
};

export const storageService = {
  getStudents(): Student[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (!data) {
        this.saveStudents(INITIAL_STUDENTS);
        return INITIAL_STUDENTS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load students from localStorage:', e);
      return INITIAL_STUDENTS;
    }
  },

  saveStudents(students: Student[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error('Failed to save students to localStorage:', e);
    }
  },

  addStudent(student: Student): Student[] {
    const students = this.getStudents();
    const updated = [student, ...students];
    this.saveStudents(updated);
    return updated;
  },

  updateStudent(student: Student): Student[] {
    const students = this.getStudents();
    const updated = students.map((s) => (s.id === student.id ? student : s));
    this.saveStudents(updated);
    return updated;
  },

  deleteStudent(id: string): { students: Student[]; evaluations: EvaluationRecord[] } {
    const students = this.getStudents().filter((s) => s.id !== id);
    this.saveStudents(students);

    // Also remove or keep associated evaluations
    const evaluations = this.getEvaluations().filter((e) => e.studentId !== id);
    this.saveEvaluations(evaluations);

    return { students, evaluations };
  },

  getEvaluations(): EvaluationRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
      if (!data) {
        this.saveEvaluations(INITIAL_EVALUATIONS);
        return INITIAL_EVALUATIONS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load evaluations from localStorage:', e);
      return INITIAL_EVALUATIONS;
    }
  },

  saveEvaluations(evaluations: EvaluationRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));
    } catch (e) {
      console.error('Failed to save evaluations to localStorage:', e);
    }
  },

  addEvaluation(record: EvaluationRecord): EvaluationRecord[] {
    const evaluations = this.getEvaluations();
    const updated = [record, ...evaluations];
    this.saveEvaluations(updated);
    return updated;
  },

  updateEvaluation(record: EvaluationRecord): EvaluationRecord[] {
    const evaluations = this.getEvaluations();
    const updated = evaluations.map((e) => (e.id === record.id ? record : e));
    this.saveEvaluations(updated);
    return updated;
  },

  deleteEvaluation(id: string): EvaluationRecord[] {
    const evaluations = this.getEvaluations().filter((e) => e.id !== id);
    this.saveEvaluations(evaluations);
    return evaluations;
  },

  resetToDefaultData(): { students: Student[]; evaluations: EvaluationRecord[] } {
    this.saveStudents(INITIAL_STUDENTS);
    this.saveEvaluations(INITIAL_EVALUATIONS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOM_DATASET);
    return {
      students: INITIAL_STUDENTS,
      evaluations: INITIAL_EVALUATIONS,
    };
  },

  exportFullBackup(): string {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      students: this.getStudents(),
      evaluations: this.getEvaluations(),
    };
    return JSON.stringify(payload, null, 2);
  },

  importBackup(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed.students) || !Array.isArray(parsed.evaluations)) {
        return { success: false, message: 'Invalid backup file structure.' };
      }
      this.saveStudents(parsed.students);
      this.saveEvaluations(parsed.evaluations);
      return { success: true, message: `Imported ${parsed.students.length} students and ${parsed.evaluations.length} evaluation records.` };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Failed to parse JSON file' };
    }
  },
};
