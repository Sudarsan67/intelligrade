-- ====================================================================
-- INTELLIGRADE — Complete PostgreSQL Database Schema & Security Policies
-- Phase 3 Implementation: 22 Normalized Tables, Foreign Keys, RLS & Triggers
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER PROFILES
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  department TEXT NOT NULL,
  class_year TEXT,
  roll_number TEXT UNIQUE,
  designation TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending_approval', 'disabled')),
  must_change_password BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STUDENT ROSTER (Teacher/Admin managed pre-verification registry)
CREATE TABLE IF NOT EXISTS student_roster (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roll_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  institutional_email TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  year TEXT NOT NULL,
  semester TEXT NOT NULL,
  is_registered BOOLEAN DEFAULT FALSE,
  registered_user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. STAFF ACCESS REQUESTS
CREATE TABLE IF NOT EXISTS staff_access_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  designation TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES user_profiles(id),
  reviewed_at TIMESTAMPTZ
);

-- 5. DEPARTMENTS & SUBJECTS
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  semester TEXT NOT NULL,
  credits INT DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SYLLABUS DOCUMENTS & TOPICS
CREATE TABLE IF NOT EXISTS syllabus_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  semester TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  version INT DEFAULT 1,
  file_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS syllabus_topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  syllabus_id UUID REFERENCES syllabus_documents(id) ON DELETE CASCADE,
  unit_number INT NOT NULL,
  unit_title TEXT NOT NULL,
  topic_title TEXT NOT NULL,
  description TEXT,
  learning_outcomes TEXT[] DEFAULT '{}',
  importance_weight INT DEFAULT 3 CHECK (importance_weight BETWEEN 1 AND 5),
  estimated_hours NUMERIC(4,1) DEFAULT 4.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EXAMINATIONS & QUESTION PAPERS
CREATE TABLE IF NOT EXISTS examinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('CAT 1', 'CAT 2', 'Model Examination', 'Semester Examination', 'Lab Practical', 'Assignment')),
  department TEXT NOT NULL,
  semester TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_marks NUMERIC(5,2) NOT NULL,
  passing_marks NUMERIC(5,2) NOT NULL,
  instructions TEXT,
  syllabus_version_id UUID REFERENCES syllabus_documents(id),
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  examination_id UUID REFERENCES examinations(id) ON DELETE CASCADE,
  question_number TEXT NOT NULL,
  question_text TEXT NOT NULL,
  max_marks NUMERIC(5,2) NOT NULL,
  unit_number INT NOT NULL,
  topic_id UUID REFERENCES syllabus_topics(id),
  model_answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  examination_id UUID REFERENCES examinations(id) ON DELETE CASCADE,
  exam_date DATE NOT NULL,
  hall_number TEXT,
  invigilator_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ANSWER SUBMISSIONS & PAGES (Uploads & Camera Scans)
CREATE TABLE IF NOT EXISTS answer_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  examination_id UUID REFERENCES examinations(id) ON DELETE CASCADE,
  student_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('upload', 'camera_scan')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  verified_by_teacher BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS answer_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES answer_submissions(id) ON DELETE CASCADE,
  page_number INT NOT NULL,
  image_url TEXT NOT NULL,
  ocr_text TEXT,
  ocr_confidence NUMERIC(5,2),
  needs_review BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. RUBRICS & EVALUATION RESULTS
CREATE TABLE IF NOT EXISTS evaluation_rubrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES exam_questions(id) ON DELETE CASCADE,
  criterion_name TEXT NOT NULL,
  max_marks NUMERIC(5,2) NOT NULL,
  description TEXT,
  accepted_alternatives TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evaluation_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES answer_submissions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES exam_questions(id) ON DELETE CASCADE,
  criterion_scores JSONB NOT NULL DEFAULT '[]',
  ai_awarded_marks NUMERIC(5,2) NOT NULL,
  teacher_adjusted_marks NUMERIC(5,2),
  final_marks NUMERIC(5,2) NOT NULL,
  evidence TEXT,
  missing_concepts TEXT[] DEFAULT '{}',
  strengths TEXT[] DEFAULT '{}',
  areas_for_improvement TEXT[] DEFAULT '{}',
  feedback TEXT,
  ai_confidence NUMERIC(5,2),
  needs_human_review BOOLEAN DEFAULT FALSE,
  review_reason TEXT,
  evaluated_by UUID REFERENCES user_profiles(id),
  evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. STUDENT MARKS & CONTROLLED PUBLICATION RECORDS
CREATE TABLE IF NOT EXISTS student_marks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  examination_id UUID REFERENCES examinations(id) ON DELETE CASCADE,
  student_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  total_marks_obtained NUMERIC(5,2) NOT NULL,
  max_marks NUMERIC(5,2) NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  grade TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'NOT_EVALUATED' CHECK (status IN ('NOT_EVALUATED', 'AI_PROCESSING', 'NEEDS_REVIEW', 'AI_EVALUATED', 'TEACHER_APPROVED', 'PUBLISHED')),
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES user_profiles(id),
  publication_version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS publication_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  examination_id UUID REFERENCES examinations(id) ON DELETE CASCADE,
  published_by UUID REFERENCES user_profiles(id),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  affected_students_count INT NOT NULL,
  publication_version INT NOT NULL,
  notes TEXT
);

-- 11. STUDY PLANNER (Manual & Smart Spaced Repetition)
CREATE TABLE IF NOT EXISTS student_study_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  subject_name TEXT NOT NULL,
  unit_number INT,
  topic_title TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INT NOT NULL,
  priority TEXT CHECK (priority IN ('High', 'Medium', 'Low')),
  difficulty TEXT CHECK (difficulty IN ('Hard', 'Moderate', 'Easy')),
  is_smart_scheduled BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  interval_days INT DEFAULT 1,
  ease_factor NUMERIC(4,2) DEFAULT 2.50,
  repetitions INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS student_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  available_start_time TIME NOT NULL,
  available_end_time TIME NOT NULL,
  daily_max_hours NUMERIC(4,1) DEFAULT 4.0,
  break_preference_minutes INT DEFAULT 15
);

CREATE TABLE IF NOT EXISTS study_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  generated_for_exam_id UUID REFERENCES examinations(id),
  schedule_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. MENTORING, NOTIFICATIONS & AUDIT LOGS
CREATE TABLE IF NOT EXISTS mentoring_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  recommended_actions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'alert')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES user_profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentoring_sessions ENABLE ROW LEVEL SECURITY;

-- 1. Student Permissions
CREATE POLICY "Students can view only their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Students can view only published marks for themselves"
  ON student_marks FOR SELECT
  USING (
    student_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    AND is_published = TRUE
  );

CREATE POLICY "Students can manage only their own study tasks"
  ON student_study_tasks FOR ALL
  USING (student_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Students can view only their own mentoring sessions"
  ON mentoring_sessions FOR ALL
  USING (student_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid()));

-- 2. Teacher & Admin Permissions
CREATE POLICY "Teachers and Admins can view and manage examination marks"
  ON student_marks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE auth_user_id = auth.uid()
      AND role IN ('teacher', 'admin')
      AND status = 'active'
    )
  );

CREATE POLICY "Teachers and Admins can manage answer submissions"
  ON answer_submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE auth_user_id = auth.uid()
      AND role IN ('teacher', 'admin')
      AND status = 'active'
    )
  );

CREATE POLICY "Admins can manage staff access requests and roster"
  ON staff_access_requests FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE auth_user_id = auth.uid()
      AND role = 'admin'
      AND status = 'active'
    )
  );
