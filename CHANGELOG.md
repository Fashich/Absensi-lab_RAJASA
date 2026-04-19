# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with React frontend and PHP backend
- Login system for administrators and staff
- Parent access portal using NISN or phone number
- Student data management (CRUD operations)
- Laboratory attendance tracking with date filters
- Academic grades management with automatic calculation
- SPP payment tracking system
- Dashboard with statistical widgets
- Mobile-responsive UI design

### Changed
- Implemented dark mode UI with #1e293b sidebar and #0f172a header
- Applied consistent color scheme (#3b82f6 primary, #60a5fa hover, #93c5fd active)
- Used white text colors (#ffffff headings, #e2e8f0 body, #94a3b8 secondary)

### Fixed
- Implemented proper database relationships with foreign keys
- Added triggers for automatic timestamp updates
- Created indexes for optimized querying
- Added comprehensive form validation

## [1.0.0] - 2026-04-16

### Added
- Complete school laboratory attendance system
- Two entry points: admin login and parent access
- Comprehensive database schema with 18 tables
- Responsive UI with sidebar navigation
- Parent dashboard with student information
- Academic and service modules
- Security measures (prepared statements, input validation)
- API endpoints for all major functions
- Documentation (README, CHANGELOG, LICENSE)