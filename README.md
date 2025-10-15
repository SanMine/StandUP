# Stand Up

Career platform for students and employers. Find internships, connect with mentors, build your portfolio.

## Getting Started

You need Node.js v16+ and npm.

```bash
git clone https://github.com/SanMine/StandUP.git
cd StandUP/frontend
npm install
npm start
```

Open `http://localhost:3000`

## What's Inside

React 19, Tailwind CSS, ShadCN UI

- Job search and matching
- Application tracker
- Interview prep
- Mentor directory
- Learning resources
- Resume builder

## � Available Scripts

```bash
npm start       # Start development server
npm run build   # Create production build
```

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SanMine/StandUP)

Or manually:
1. Connect your GitHub repo to Vercel
2. Vercel will auto-detect settings from `vercel.json`
3. Click Deploy

## Troubleshooting

**Can't find package.json?**  
You need to be in the `frontend` folder.

**Port 3000 already in use?**
```bash
lsof -ti:3000 | xargs kill -9
```


