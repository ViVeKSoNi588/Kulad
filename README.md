# KulhadWala - Premium Terracotta & Clay Products

Welcome to **KulhadWala**, a premium, hand-crafted organic clay catalog cataloging over 50 individual terracotta items directly sourced from Pune's premium kiln-fired clay.

This repository features:
- **Client App**: A modern, highly responsive React + Vite application.
- **Server**: An Express backend with secure admin authentication, dynamic session handling, database connectivity (PostgreSQL/Supabase support), and bulk image upload management.

## Getting Started

1. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in your Supabase PostgreSQL URL and desired Admin Password:
   ```bash
   cp .env.example .env
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Application**:
   Starts both the Vite dev server and Express backend concurrently:
   ```bash
   npm run dev
   ```

4. **Build for Production**:
   ```bash
   npm run build
   ```
