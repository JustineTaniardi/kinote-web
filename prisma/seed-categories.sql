-- Delete all existing categories and subcategories to start fresh
DELETE FROM `SubCategory`;
DELETE FROM `Category`;

-- Insert 5 main categories
INSERT INTO `Category` (name, createdAt) VALUES
('Productivity', NOW()),
('Health', NOW()),
('Learning', NOW()),
('Creativity', NOW()),
('Lifestyle', NOW());

-- Insert subcategories for Productivity (5 subcategories)
INSERT INTO `SubCategory` (name, categoryId, createdAt) VALUES
('Task Management', 1, NOW()),
('Time Blocking', 1, NOW()),
('Meeting Preparation', 1, NOW()),
('Email Management', 1, NOW()),
('Project Planning', 1, NOW());

-- Insert subcategories for Health (5 subcategories)
INSERT INTO `SubCategory` (name, categoryId, createdAt) VALUES
('Cardio Exercise', 2, NOW()),
('Weight Training', 2, NOW()),
('Yoga & Stretching', 2, NOW()),
('Meditation', 2, NOW()),
('Nutrition Planning', 2, NOW());

-- Insert subcategories for Learning (5 subcategories)
INSERT INTO `SubCategory` (name, categoryId, createdAt) VALUES
('Language Learning', 3, NOW()),
('Online Courses', 3, NOW()),
('Book Reading', 3, NOW()),
('Skill Development', 3, NOW()),
('Research & Study', 3, NOW());

-- Insert subcategories for Creativity (5 subcategories)
INSERT INTO `SubCategory` (name, categoryId, createdAt) VALUES
('Writing', 4, NOW()),
('Drawing & Design', 4, NOW()),
('Music & Audio', 4, NOW()),
('Video Production', 4, NOW()),
('Photography', 4, NOW());

-- Insert subcategories for Lifestyle (5 subcategories)
INSERT INTO `SubCategory` (name, categoryId, createdAt) VALUES
('Cooking', 5, NOW()),
('Home Organization', 5, NOW()),
('Social Activities', 5, NOW()),
('Travel Planning', 5, NOW()),
('Personal Development', 5, NOW());
