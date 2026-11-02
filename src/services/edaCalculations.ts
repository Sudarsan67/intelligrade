import {
  EvaluationRecord,
  EDAStats,
  SubjectName,
  SubjectComparison,
  CorrelationCell,
  BoxPlotData,
} from '../types';

export const ALL_SUBJECTS: SubjectName[] = [
  'Mathematics',
  'Data Structures',
  'Database Management Systems',
  'Artificial Intelligence',
  'Data Exploration and Visualization',
];

/**
 * Calculates comprehensive descriptive statistics for an array of numbers
 */
export function calculateEDAStats(values: number[], maxMarksRef: number = 100): EDAStats {
  if (!values || values.length === 0) {
    return {
      count: 0,
      mean: 0,
      median: 0,
      mode: [],
      min: 0,
      max: 0,
      range: 0,
      stdDev: 0,
      variance: 0,
      q1: 0,
      q3: 0,
      iqr: 0,
      passPercentage: 0,
      failCount: 0,
      passCount: 0,
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.length;
  const sum = sorted.reduce((acc, val) => acc + val, 0);
  const mean = Math.round((sum / count) * 100) / 100;

  // Median
  let median = 0;
  const mid = Math.floor(count / 2);
  if (count % 2 === 0) {
    median = Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 100) / 100;
  } else {
    median = sorted[mid];
  }

  // Min, Max, Range
  const min = sorted[0];
  const max = sorted[count - 1];
  const range = Math.round((max - min) * 100) / 100;

  // Mode
  const frequencyMap: Record<number, number> = {};
  let maxFreq = 0;
  sorted.forEach((val) => {
    frequencyMap[val] = (frequencyMap[val] || 0) + 1;
    if (frequencyMap[val] > maxFreq) maxFreq = frequencyMap[val];
  });

  const mode: number[] = [];
  if (maxFreq > 1) {
    Object.keys(frequencyMap).forEach((k) => {
      const num = Number(k);
      if (frequencyMap[num] === maxFreq && !mode.includes(num)) {
        mode.push(num);
      }
    });
  }

  // Variance & Standard Deviation
  const varianceSum = sorted.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  const variance = count > 1 ? Math.round((varianceSum / (count - 1)) * 100) / 100 : 0;
  const stdDev = Math.round(Math.sqrt(variance) * 100) / 100;

  // Quartiles (using standard interpolation)
  const getPercentile = (arr: number[], p: number): number => {
    if (arr.length === 1) return arr[0];
    const index = (arr.length - 1) * p;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return Math.round((arr[lower] * (1 - weight) + arr[upper] * weight) * 100) / 100;
  };

  const q1 = getPercentile(sorted, 0.25);
  const q3 = getPercentile(sorted, 0.75);
  const iqr = Math.round((q3 - q1) * 100) / 100;

  // Pass vs Fail (Passing mark is 50% of the relative scale or value >= 50)
  const passThreshold = maxMarksRef > 0 ? maxMarksRef * 0.5 : 50;
  const passCount = sorted.filter((v) => v >= passThreshold).length;
  const failCount = count - passCount;
  const passPercentage = Math.round((passCount / count) * 1000) / 10;

  return {
    count,
    mean,
    median,
    mode,
    min,
    max,
    range,
    stdDev,
    variance,
    q1,
    q3,
    iqr,
    passPercentage,
    failCount,
    passCount,
  };
}

/**
 * Calculates Tukey outliers for a given numeric list
 */
export function getOutliers(values: number[]): { outliers: number[]; lowerFence: number; upperFence: number } {
  if (values.length < 4) return { outliers: [], lowerFence: 0, upperFence: 100 };
  const sorted = [...values].sort((a, b) => a - b);
  const stats = calculateEDAStats(sorted);
  const lowerFence = Math.round((stats.q1 - 1.5 * stats.iqr) * 100) / 100;
  const upperFence = Math.round((stats.q3 + 1.5 * stats.iqr) * 100) / 100;
  const outliers = sorted.filter((v) => v < lowerFence || v > upperFence);
  return { outliers, lowerFence, upperFence };
}

/**
 * Calculates Box Plot data for all 5 subjects
 */
export function getSubjectBoxPlotData(records: EvaluationRecord[]): BoxPlotData[] {
  return ALL_SUBJECTS.map((subject) => {
    const subjectRecords = records.filter((r) => r.subject === subject);
    const percentages = subjectRecords.map((r) => r.percentage);
    if (percentages.length === 0) {
      return { subject, min: 0, q1: 0, median: 0, q3: 0, max: 0, outliers: [] };
    }
    const stats = calculateEDAStats(percentages, 100);
    const { outliers } = getOutliers(percentages);

    return {
      subject,
      min: stats.min,
      q1: stats.q1,
      median: stats.median,
      q3: stats.q3,
      max: stats.max,
      outliers,
    };
  });
}

/**
 * Computes Pearson Correlation Coefficient between two arrays of numbers
 */
export function calculatePearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 1000;
}

/**
 * Computes full correlation matrix across subjects
 */
export function calculateSubjectCorrelationMatrix(records: EvaluationRecord[]): CorrelationCell[] {
  // Aggregate student percentages by subject: studentId -> { subject: percentage }
  const studentSubjectMap: Record<string, Partial<Record<SubjectName, number>>> = {};

  records.forEach((r) => {
    if (!studentSubjectMap[r.studentId]) {
      studentSubjectMap[r.studentId] = {};
    }
    studentSubjectMap[r.studentId][r.subject] = r.percentage;
  });

  const matrix: CorrelationCell[] = [];

  for (let i = 0; i < ALL_SUBJECTS.length; i++) {
    for (let j = 0; j < ALL_SUBJECTS.length; j++) {
      const subA = ALL_SUBJECTS[i];
      const subB = ALL_SUBJECTS[j];

      if (i === j) {
        matrix.push({ subjectA: subA, subjectB: subB, correlation: 1.0 });
        continue;
      }

      // Collect paired data points
      const pairsX: number[] = [];
      const pairsY: number[] = [];

      Object.values(studentSubjectMap).forEach((scores) => {
        if (scores[subA] !== undefined && scores[subB] !== undefined) {
          pairsX.push(scores[subA]!);
          pairsY.push(scores[subB]!);
        }
      });

      const corr = calculatePearsonCorrelation(pairsX, pairsY);
      matrix.push({ subjectA: subA, subjectB: subB, correlation: corr });
    }
  }

  return matrix;
}

/**
 * Computes linear regression parameters for scatter plot: y = m*x + b
 */
export function calculateLinearRegression(x: number[], y: number[]) {
  if (x.length !== y.length || x.length < 2) {
    return { slope: 0, intercept: 0, rSquared: 0, correlation: 0 };
  }
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return { slope: 0, intercept: 0, rSquared: 0, correlation: 0 };

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  const correlation = calculatePearsonCorrelation(x, y);
  const rSquared = Math.round(correlation * correlation * 1000) / 1000;

  return {
    slope: Math.round(slope * 1000) / 1000,
    intercept: Math.round(intercept * 100) / 100,
    rSquared,
    correlation,
  };
}

/**
 * Generates histogram bin frequencies
 */
export function generateHistogramBins(
  values: number[],
  binSize: number = 10,
  minVal: number = 0,
  maxVal: number = 100
): { binLabel: string; count: number; rangeStart: number; rangeEnd: number }[] {
  const bins: { binLabel: string; count: number; rangeStart: number; rangeEnd: number }[] = [];

  for (let start = minVal; start < maxVal; start += binSize) {
    const end = Math.min(start + binSize, maxVal);
    const count = values.filter((v) => (end === maxVal ? v >= start && v <= end : v >= start && v < end)).length;
    bins.push({
      binLabel: `${start}-${end}%`,
      count,
      rangeStart: start,
      rangeEnd: end,
    });
  }

  return bins;
}

/**
 * Computes comparative metrics for all 5 subjects
 */
export function calculateSubjectComparisons(records: EvaluationRecord[]): SubjectComparison[] {
  return ALL_SUBJECTS.map((subject) => {
    const subjectRecords = records.filter((r) => r.subject === subject);
    const percentages = subjectRecords.map((r) => r.percentage);
    const marks = subjectRecords.map((r) => r.finalMarks);

    if (percentages.length === 0) {
      return {
        subject,
        averageMarks: 0,
        averagePercentage: 0,
        highestMarks: 0,
        lowestMarks: 0,
        passRate: 0,
        studentCount: 0,
        stdDev: 0,
      };
    }

    const stats = calculateEDAStats(percentages);
    const marksStats = calculateEDAStats(marks);

    return {
      subject,
      averageMarks: marksStats.mean,
      averagePercentage: stats.mean,
      highestMarks: marksStats.max,
      lowestMarks: marksStats.min,
      passRate: stats.passPercentage,
      studentCount: subjectRecords.length,
      stdDev: stats.stdDev,
    };
  });
}
