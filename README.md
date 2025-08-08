# 🏆 Gamification Analyzer

A Vercel-deployable web application that analyzes AI assistant interaction CSV files and generates user rankings based on established gamification rubrics.

## ✨ Features

- **CSV File Upload**: Drag & drop or click to upload CSV files
- **Automatic Analysis**: Applies gamification rubrics to calculate user scores
- **User Rankings**: Complete ranking table with performance tiers
- **Achievement System**: Badges for Deep Diver, Study Strategist, Pathway Pro
- **Summary Statistics**: Key metrics and engagement insights
- **Export Results**: Download analysis results as CSV
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Local Development

1. **Clone and install dependencies:**
```bash
git clone <your-repo>
cd gamification-analyzer
pnpm install
```

2. **Start development server:**
```bash
pnpm run dev
```

3. **Open in browser:**
```
http://localhost:5173
```

### Vercel Deployment

1. **Connect to Vercel:**
   - Push your code to GitHub
   - Connect your GitHub repo to Vercel
   - Vercel will automatically detect the Vite framework

2. **Deploy:**
   - Vercel will automatically build and deploy
   - Uses the `vercel.json` configuration for optimal settings

## 📊 Gamification Rubrics

The application uses established rubrics to calculate user engagement scores:

### Point System
- **Base Interaction**: +1 point per question
- **Goal-Aligned Questions**: +2 points (exam prep, certification, course topics)
- **Topic-Specific Questions**: +1 point (technical topics, troubleshooting)
- **Follow-up Questions**: +2 points each
- **Detailed Responses**: +1 point (responses >50 words)

### Achievements
- **🧠 Deep Diver**: 5+ follow-up questions
- **📚 Study Strategist**: 3+ goal-aligned questions
- **🎓 Pathway Pro**: Used 3+ different courses/modules
- **🔍 Bug Hunter**: 3+ troubleshooting questions

### Performance Tiers
- **Power User**: 200+ points
- **High Performer**: 100-199 points
- **Regular User**: 50-99 points
- **Light User**: <50 points

## 📁 CSV File Format

The application expects CSV files with the following columns:

| Column | Description |
|--------|-------------|
| `email` | User email address |
| `first` | User first name |
| `last` | User last name |
| `input` | User question/input |
| `outputs` | AI assistant response |
| `credits` | Credits consumed |
| `course_name` | Course/module name |
| `course_id` | Course identifier |
| `instance_ainame` | AI assistant name |
| `success` | Success status (TRUE/FALSE) |
| `query_duration_ms` | Response time in milliseconds |
| `ttft` | Time to first token |
| `created` | Timestamp |

## 🛠️ Technical Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Icons**: Lucide React
- **CSV Parsing**: PapaParse
- **Charts**: Recharts (ready for integration)
- **Deployment**: Vercel

## 📈 Usage

1. **Upload CSV File**: Click or drag & drop your CSV file
2. **Automatic Analysis**: The app processes the data using gamification rubrics
3. **View Results**: See user rankings, statistics, and achievements
4. **Export Data**: Download the analysis results as CSV

## 🔧 Development

### Project Structure
```
src/
├── components/          # React components
├── lib/                # Analysis logic and utilities
├── App.jsx             # Main application component
├── App.css             # Styles
└── main.jsx            # Entry point
```

### Key Files
- `src/lib/gamificationAnalysis.js` - Core analysis logic
- `src/App.jsx` - Main application with upload and results
- `vercel.json` - Vercel deployment configuration

### Build Commands
```bash
pnpm run dev      # Development server
pnpm run build    # Production build
pnpm run preview  # Preview production build
```

## 📝 License

MIT License - feel free to use and modify for your needs.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions, please create an issue in the GitHub repository.

---

Built with ❤️ using React and powered by established gamification rubrics for AI assistant engagement analysis.

