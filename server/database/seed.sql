INSERT INTO users (username, password_hash, full_name, role, active) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IyF8HwF5z6gQ5gQ5gQ5gQ5gQ5gQ5', 'System Administrator', 'admin', 1);

INSERT INTO assessment_criteria (name, description, max_points, active) VALUES
('Low Income (income per capita <= 5,000)', 'Household income per capita is at or below the poverty threshold', 3, 1),
('Vulnerable Member', 'Household has a recognized vulnerable member', 2, 1),
('Disability or Senior', 'Household has a person with disability or senior citizen', 2, 1),
('Dependent Children', 'Household has dependent children', 1, 1),
('Housing Insecurity', 'Household lives in informal or inadequate housing', 2, 1),
('Emergency Situation', 'Household is currently in an emergency or crisis situation', 3, 1);

INSERT INTO assessment_criteria (name, description, max_points, active) VALUES
('Unemployed', 'Household head is unemployed', 2, 1),
('Indigent Family', 'Family is identified as indigent by local government', 3, 1);
