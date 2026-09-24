CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'social_worker',
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS households (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    household_code TEXT UNIQUE NOT NULL,
    address TEXT,
    barangay TEXT,
    city TEXT,
    province TEXT,
    monthly_income REAL DEFAULT 0,
    household_size INTEGER DEFAULT 1,
    housing_status TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS applicants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    household_id INTEGER NOT NULL,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    birth_date TEXT,
    sex TEXT,
    civil_status TEXT,
    contact_number TEXT,
    occupation TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    applicant_id INTEGER NOT NULL,
    assessed_by INTEGER NOT NULL,
    income_per_capita REAL DEFAULT 0,
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
    decision_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE,
    FOREIGN KEY (assessed_by) REFERENCES users(id),
    FOREIGN KEY (decision_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS assessment_criteria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    max_points INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS beneficiaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    applicant_id INTEGER NOT NULL,
    registered_by INTEGER NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    registered_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE,
    FOREIGN KEY (registered_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS assistance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    beneficiary_id INTEGER NOT NULL,
    assistance_type TEXT NOT NULL,
    amount REAL NOT NULL DEFAULT 0,
    distribution_date TEXT NOT NULL,
    program_source TEXT,
    reference_number TEXT,
    status TEXT DEFAULT 'RELEASED',
    released_by INTEGER,
    remarks TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE CASCADE,
    FOREIGN KEY (released_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id INTEGER,
    details TEXT,
    ip_address TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_applicants_household ON applicants(household_id);
CREATE INDEX IF NOT EXISTS idx_assessments_applicant ON assessments(applicant_id);
CREATE INDEX IF NOT EXISTS idx_assessments_priority ON assessments(recommended_priority);
CREATE INDEX IF NOT EXISTS idx_assessments_decision ON assessments(decision);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_status ON beneficiaries(status);
CREATE INDEX IF NOT EXISTS idx_assistance_beneficiary ON assistance_records(beneficiary_id);
