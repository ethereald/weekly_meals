
# Weekly Meals Planner

A modern meal planning web app built with Next.js, TypeScript, and Tailwind CSS. Plan, track, and visualize meals for yourself or your family with personalized calendar views, dish tracking, and user management.

---

## Features & Implementation

### 1. Dishes Page
- Displays a list of unique dishes for the logged-in user.
- Shows a counter for how many times each dish has been cooked.
- Allows editing dish names (updates all instances for the user).

### 2. Daily View
- Shows meals for a selected day.
- Add new meals with a dropdown to select from previously saved dishes.
- Navigation to other views (Dishes, Weekly, Monthly).

### 3. Weekly View
- Displays a grid of meals for the selected week.
- Week start day is personalized per user (set in Account page).
- Add meals for any day with dish dropdown.
- Color-coded user display names.

### 4. Monthly View
- Calendar grid of meals for the selected month.
- Week start day is personalized per user.
- Click any week to jump to weekly view.
- Tooltips show full dish name and user display name.

### 5. Account Page
- Update display name, user color, password, and start day of week.
- Changes persist to backend and localStorage.
- Personalized calendar logic across all views.

### 6. Admin Panel (for admin users)
- Manage users and meals (add/remove/edit).
- Accessible only to users with admin role.

---

## Technologies Used
- **Next.js** (App Router, API routes)
- **React** (Hooks, functional components)
- **TypeScript** (type safety)
- **Tailwind CSS** (modern UI styling)
- **Node.js** (API backend)
- **JSON file storage** (`users.json`, `meals.json`)
- **pnpm** (package manager)

---

## Initial Setup

1. **Install dependencies**
	```powershell
	pnpm install
	```

2. **Start the development server**
	```powershell
	pnpm dev
	```
	App runs at `http://localhost:3000`

3. **Login**
	- Default admin user: `admin` / `admin`
	- Add users via admin panel or manually in `users.json`

---

## Deployment Instructions

### Data Source Switching: D1 SQL (Cloudflare) vs JSON (Local)

By default, the app uses local JSON files (`meals.json`, `users.json`) for development and testing.

For Cloudflare production, you can enable D1 SQL support:
1. **Set the environment variable**
	- `USE_D1=1`
2. **Bind your Cloudflare D1 database as `DB`**
	- In your `wrangler.toml` (Cloudflare config), add:
	  ```toml
	  [[d1_databases]]
	  binding = "DB"
	  database_name = "your-database-name"
	  database_id = "your-database-id"
	  ```
	- This makes the D1 database available as `globalThis.env.DB` in your Worker.
3. **Deploy your Worker**
	- The app will automatically use D1 SQL for meal data when `USE_D1=1` is set.

No changes needed for local development; it will continue using JSON files.

#### Example: Enable D1 SQL for Cloudflare
```sh
export USE_D1=1
# Wrangler will bind D1 as DB per wrangler.toml
```

#### Example: Local Development (default)
```sh
# No USE_D1 variable needed
pnpm dev
```

---

1. **Build for production**
	```powershell
	pnpm build
	```

2. **Start production server**
	```powershell
	pnpm start
	```

3. **Environment**
	- Node.js 18+
	- Windows, Mac, or Linux

---

## File Structure Overview

- `src/app/meals/page.tsx` — Dishes page
- `src/app/meals/daily/page.tsx` — Daily view
- `src/app/meals/weekly/page.tsx` — Weekly view
- `src/app/meals/monthly/page.tsx` — Monthly view
- `src/app/account/page.tsx` — Account management
- `src/app/admin/page.tsx` — Admin panel
- `src/app/api/*` — API routes
- `src/lib/users.json` — User data
- `src/lib/meals.json` — Meal data

---

## Customization & Extensibility
- Add new features by editing React pages in `src/app/meals/`.
- Backend logic in `src/app/api/` and `src/lib/`.
- UI styling via Tailwind CSS classes.

---

## License
MIT

---

## Author
Kelvin Lai & Family
