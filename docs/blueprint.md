# **App Name**: SampattiPro

## Core Features:

- Asset Inventory Engine: Full lifecycle management for assets including Buildings, Building Lands, vehicles, Electronics machinery, and IT equipment using the provided database schema.
- Intelligent Depreciation Calculator: Automated depreciation calculation logic implementing the 5%, 10%, 15%, and 33.33% rates, with special logic for assets owned less than 6 months and assets with a remaining value of 1. Logic includes handling Written Down Value (WDV) for historical assets stored in current book value for buildings, furniture, dead stock, and vehicles.
- Multi-Branch Transfer System: Official transfer workflows for shifting assets between locations like Khodad, Manjarwadi, Sultanpur, and Ghodegaon, tracking remaining book value accurately.
- Warranty & Vendor Monitoring: Systematic tracking of vendor details and warranty expiry dates with automated status updates for active or expired coverage.
- AI Audit & Discrepancy Analyst: A tool powered by generative AI that uses reasoning to analyze audit logs and repair history, flagging unusual asset wear or mismatch patterns across branches.
- Repair & Warehouse Ledger: Dedicated module for tracking maintenance status, service costs, and assets currently placed in storage or out of service.
- Dynamic QR Management: Generating and scanning unique QR codes to quickly view asset conditions, serial numbers, and department assignments in the field.

## Style Guidelines:

- Primary Color: Trust-inspiring Midnight Navy (#2A3E8C), reflecting stability and professional asset management.
- Background Color: Soft Steel Grey (#F5F6F8), chosen to maintain a clean, organized dashboard aesthetic.
- Accent Color: Vibrant Cerulean (#3B82F6), used for active states and critical calls to action, providing strong analogous contrast.
- Headlines: 'Space Grotesk' for a precise, tech-forward, and administrative feel.
- Body Text: 'Inter' for maximum readability in data-heavy asset tables and financial reports.
- Code Font: 'Source Code Pro' for displaying audit trail logs and system-generated serial sequences.
- Dashboard-centric design with a collapsible sidebar for easy navigation between branches and categories.
- Fluid micro-interactions and transitions when assets are moved from 'Active' to 'In Warehouse' or 'Under Repair'.