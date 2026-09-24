CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'social_worker',
    active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS households (
    id SERIAL PRIMARY KEY,
    household_code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT,
    barangay TEXT,
    city TEXT,
    province TEXT,
    monthly_income DOUBLE PRECISION DEFAULT 0,
    household_size INTEGER DEFAULT 1,
    housing_status TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applicants (
    id SERIAL PRIMARY KEY,
    household_id INTEGER NOT NULL,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    birth_date TEXT,
    sex TEXT,
    civil_status TEXT,
    contact_number TEXT,
    occupation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    applicant_id INTEGER NOT NULL,
    assessed_by INTEGER NOT NULL,
    income_per_capita DOUBLE PRECISION DEFAULT 0,
    low_income INTEGER DEFAULT 0,
    vulnerable_member INTEGER DEFAULT 0,
    disability_or_senior INTEGER DEFAULT 0,
    dependent_children INTEGER DEFAULT 0,
    housing_insecurity INTEGER DEFAULT 0,
    emergency_situation INTEGER DEFAULT 0,
    criteria_score INTEGER DEFAULT 0,
    recommended_priority TEXT DEFAULT 'LOW',
    notes TEXT,
    decision TEXT DEFAULT 'PENDING',
    decision_by INTEGER,
    decision_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE,
    FOREIGN KEY (assessed_by) REFERENCES users(id),
    FOREIGN KEY (decision_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS assessment_criteria (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    max_points INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS beneficiaries (
    id SERIAL PRIMARY KEY,
    applicant_id INTEGER NOT NULL,
    registered_by INTEGER NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE,
    FOREIGN KEY (registered_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS assistance_records (
    id SERIAL PRIMARY KEY,
    beneficiary_id INTEGER NOT NULL,
    assistance_type TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    distribution_date TEXT NOT NULL,
    program_source TEXT,
    reference_number TEXT,
    status TEXT DEFAULT 'RELEASED',
    released_by INTEGER,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE CASCADE,
    FOREIGN KEY (released_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id INTEGER,
    details TEXT,
    ip_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_applicants_household ON applicants(household_id);
CREATE INDEX IF NOT EXISTS idx_assessments_applicant ON assessments(applicant_id);
CREATE INDEX IF NOT EXISTS idx_assessments_priority ON assessments(recommended_priority);
CREATE INDEX IF NOT EXISTS idx_assessments_decision ON assessments(decision);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_status ON beneficiaries(status);
CREATE INDEX IF NOT EXISTS idx_assistance_beneficiary ON assistance_records(beneficiary_id);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
