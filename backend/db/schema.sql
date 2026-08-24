-- =====================================================
-- AI STUDY PLANNER DATABASE SCHEMA
-- =====================================================

-- =====================================================
-- USERS
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TASKS
-- =====================================================

CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    subject TEXT NOT NULL,
    time TEXT NOT NULL,

    estimated_minutes INTEGER NOT NULL
        CHECK (estimated_minutes > 0),

    completed_minutes INTEGER NOT NULL DEFAULT 0
        CHECK (completed_minutes >= 0),

    difficulty TEXT NOT NULL DEFAULT 'medium'
        CHECK (difficulty IN ('easy', 'medium', 'hard')),

    priority TEXT NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high')),

    completed BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (completed_minutes <= estimated_minutes)
);

-- =====================================================
-- EXAMS
-- =====================================================

CREATE TABLE IF NOT EXISTS exams (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    subject TEXT NOT NULL,
    exam_date DATE NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- STUDY SESSIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS study_sessions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    task_id BIGINT
        REFERENCES tasks(id)
        ON DELETE SET NULL,

    minutes INTEGER NOT NULL
        CHECK (minutes > 0),

    session_date DATE NOT NULL DEFAULT CURRENT_DATE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_tasks_user_id
    ON tasks(user_id);

CREATE INDEX IF NOT EXISTS idx_exams_user_id
    ON exams(user_id);

CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id
    ON study_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_study_sessions_task_id
    ON study_sessions(task_id);