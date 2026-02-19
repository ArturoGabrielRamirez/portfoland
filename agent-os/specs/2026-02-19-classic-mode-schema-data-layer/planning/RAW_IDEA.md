# Phase 2A: Schema & Data Layer for Classic Mode MVP

## Raw Description

Define and implement the database models (Service, Testimonial) and PortfolioSettings schema needed to support Classic Mode portfolios. This is the data foundation for the entire Phase 2 Classic Mode MVP — all other Phase 2 specs (2B template, 2C dashboard, 2D onboarding) depend on these models being in place.

### Key Concepts

#### Service Model
- title: string
- description: string
- price: decimal
- duration: string
- order: integer

#### Testimonial Model
- client name: string
- content: string
- rating: number
- photo: optional image reference

#### PortfolioSettings in User Model
- visible sections: array of section identifiers
- layouts: layout configuration options
- custom colors: color palette settings

#### Additional Requirements
- Migration script for existing users
- Ensure data relationships are properly defined
- Support for both Tech Mode and Classic Mode configurations
