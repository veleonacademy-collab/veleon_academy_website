Skills Students Will Master
By the end of the bootcamp, students should be able to:
Write clean SQL queries confidently
Solve common SQL interview problems
Join multiple tables correctly
Build KPIs and business metrics
Analyze revenue, churn, retention, and growth
Use window functions for advanced analysis
Debug broken queries
Translate business questions into SQL logic
Build portfolio-ready SQL projects

Recommended Database
Use:
PostgreSQL (preferred)
Optional:
MySQL
SQLite

WEEK 1 — SQL Foundations + Real Analyst Workflows

Day 1 — SQL Fundamentals & Analyst Thinking
Topics
Understanding Relational Databases
Tables
Rows
Columns
Data types
Primary Keys vs Foreign Keys
How tables connect
Understanding Dataset Granularity
“What does one row represent?”
Basic Querying
SELECT
DISTINCT
LIMIT
Filtering Data
WHERE
AND
OR
IN
BETWEEN
LIKE
Sorting
ORDER BY
Calculated Columns
Arithmetic operations
Creating metrics

Business Questions
Which products generated the most revenue?
Which customers made purchases this month?
Which transactions exceeded $500?
Which cities generated the most orders?

Class Exercises
Retail Dataset
Tables:
orders
Tasks:
Find top-selling products
Identify highest-value transactions
Find customers from specific locations

Assignment
Business Scenario
You are a junior analyst at an e-commerce company.
Questions
What are the top 10 products by revenue?
Which states generated over $20,000 in sales?
Which customers placed more than 5 orders?
Find all orders containing “Premium” products.

Day 2 — Aggregations, GROUP BY & KPI Thinking
Topics
Aggregate Functions
COUNT
SUM
AVG
MIN
MAX
Grouping Data
GROUP BY
Filtering Aggregated Results
HAVING
Business Metrics
Revenue
Order volume
Average order value
Customer count
SQL Execution Order
FROM
WHERE
GROUP BY
HAVING
SELECT
ORDER BY

Business Questions
Which category generates the highest revenue?
What is average order value by region?
Which month had the highest sales?
Which stores underperform?

Class Exercises
Sales Performance Analysis
Tasks:
Revenue by category
Monthly sales trends
Top-performing locations

Assignment
Business Scenario
A retail manager wants a sales performance report.
Questions
Which categories generated the highest revenue?
Which cities averaged the highest order value?
Which stores made more than $50,000?
Which products sold more than 100 units?

Day 3 — Joins (Most Important Analyst Skill)
Topics
Understanding Relationships
One-to-many relationships
Joins
INNER JOIN
LEFT JOIN
Aliasing
AS
Multi-table joins
Join Mistakes
Duplicate rows
Missing join conditions
NULL Introduction

Business Questions
Which customers never placed orders?
Which orders were refunded?
Which products are most returned?
Which users signed up but never became active?

Class Exercises
Tables
customers
orders
payments
Tasks:
Identify inactive customers
Analyze refunded orders
Match payments to transactions

Assignment
Business Scenario
A subscription company wants to analyze customer behavior.
Questions
Which users canceled subscriptions?
Which customers never made a payment?
Which users signed up but became inactive?
Which payment methods generate the most revenue?

Day 4 — CASE WHEN, NULL Handling & Data Cleaning
Topics
Conditional Logic
CASE WHEN
Bucketing
Customer tiers
Revenue groups
Handling NULLs
IS NULL
IS NOT NULL
COALESCE
Data Cleaning
TRIM
UPPER
LOWER
REPLACE
Data Type Conversion
CAST

Business Questions
Which customers are VIPs?
Which orders are delayed?
Which records contain missing data?
Which customers belong to high-value segments?

Class Exercises
Customer Segmentation
Tasks:
Create loyalty tiers
Flag delayed deliveries
Standardize inconsistent categories

Assignment
Business Scenario
The operations team needs customer segmentation.
Questions
Segment customers into Bronze, Silver, Gold tiers.
Flag orders delivered late.
Replace missing cancellation dates.
Standardize inconsistent city names.

Day 5 — Date Functions + Interview SQL Practice
Topics
Date Functions
DATE_TRUNC
EXTRACT
YEAR
MONTH
Date Arithmetic
DATEDIFF
AGE
Time-Based Analysis
Daily trends
Monthly growth
Retention periods
Interview SQL Patterns
Top-N analysis
Consecutive calculations
Filtering grouped data

Business Questions
Which month generated the most revenue?
What is average delivery time?
Which users churned within 30 days?
Which weeks had the highest traffic?

Class Exercises
Delivery & Retention Analysis
Tasks:
Monthly revenue trends
Delivery duration analysis
Customer retention calculations

Assignment
Business Scenario
An operations manager wants shipping insights.
Questions
Which shipping providers are fastest?
What is average delivery duration?
Which month had the highest sales?
Which users churned within 60 days?

WEEK 2 — Advanced SQL + Interview-Level Analytics

Day 6 — Subqueries & CTEs
Topics
Subqueries
In WHERE
In FROM
Correlated Subqueries
CTEs
WITH
Sequential CTEs
Readability & Debugging

Business Questions
Which customers spend above average?
Which products outperform category averages?
Which users belong to top revenue groups?

Class Exercises
Revenue Intelligence Analysis
Tasks:
Above-average spenders
Category benchmarking
Sequential CTE reporting

Assignment
Business Scenario
Management wants high-value customer analysis.
Questions
Find customers spending above average.
Identify top-performing product categories.
Build a reusable CTE revenue pipeline.
Find stores outperforming regional averages.

Day 7 — Window Functions (Critical for Interviews)
Topics
Window Function Basics
OVER
PARTITION BY
ORDER BY
Ranking
ROW_NUMBER
RANK
DENSE_RANK
Row Comparison
LAG
LEAD
Running Totals
Moving Averages

Business Questions
Who are the top customers per region?
How did revenue change month-over-month?
Which products are trending upward?
Which employees rank highest in sales?

Class Exercises
Advanced Revenue Analytics
Tasks:
Customer ranking
Running revenue totals
Revenue growth analysis

Assignment
Business Scenario
Executives want trend analysis.
Questions
Rank customers by spending within each region.
Calculate Month-over-Month growth.
Find each product’s previous month sales.
Build cumulative revenue reports.

Day 8 — Real Business Analytics SQL
Topics
Cohort Analysis
Funnel Analysis
Churn Analysis
Retention Analysis
RFM Fundamentals
Recency
Frequency
Monetary

Business Questions
Why are users churning?
Which cohorts retain best?
Where do users drop off?
Who are high-value repeat customers?

Class Exercises
SaaS/Product Analytics
Tables:
users
events
subscriptions
Tasks:
Retention analysis
Funnel drop-off analysis
Churn identification

Assignment
Business Scenario
A SaaS company has slowing growth.
Questions
Which user cohorts retain best?
Where do users drop off in onboarding?
Which users are likely VIP customers?
Which month had the highest churn?

Day 9 — SQL Interview Masterclass + Optimization
Topics
Most Common SQL Interview Questions
Debugging Broken Queries
Join Trap Questions
Window Function Challenges
Optimization Basics
Avoiding SELECT *
Filtering before joins
Reducing duplicate calculations
SQL Style Guide
Formatting
Naming conventions
Readability

Mock Interview Questions
Find the second highest salary.
Find duplicate records.
Find customers with no orders.
Calculate rolling averages.
Rank employees by department.
Find highest-grossing product each month.

Assignment
Timed SQL assessment:
15 interview-style SQL problems

Day 10 — Final Capstone Project

Capstone Scenario — E-Commerce Business Analysis
Datasets
customers
orders
order_items
products
payments
shipments

Business Requirements
Revenue Analysis
Calculate monthly revenue growth
Customer Segmentation
Identify VIP customers
Shipping Analysis
Find delayed shipment providers
Product Analysis
Rank top products by category
Retention Analysis
Identify repeat customers
Executive Dashboard Dataset
Produce clean export-ready analytical tables

Final Deliverables
Students must submit:
1. SQL Script File
Contains:
clean formatted queries
comments
modular CTE structure
2. KPI Summary Report
Metrics:
Revenue
Growth
Retention
Churn
Top products
3. Excel Export
Business-ready analytical output
4. Stakeholder Insights Document
Short business recommendations:
operational issues
customer trends
revenue opportunities

Most Important SQL Topics Covered
This curriculum intentionally prioritizes the SQL concepts most commonly used in:
Data Analyst Interviews
GROUP BY
HAVING
JOINS
CTEs
Window functions
CASE WHEN
Date functions
Ranking
NULL handling
Real Analyst Jobs
KPI building
Retention analysis
Revenue analysis
Customer segmentation
Funnel analysis
Trend analysis

Expected Outcome
By the end of this intensive bootcamp, students should be able to:
Pass junior/intermediate SQL interviews
Solve real business SQL problems
Build analytical datasets
Write production-style SQL
Create portfolio-quality SQL projects
Work confidently with relational business data

