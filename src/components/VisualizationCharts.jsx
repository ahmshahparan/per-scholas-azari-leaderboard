import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { BarChart3, PieChart as PieChartIcon, Scatter3D } from 'lucide-react'

const VisualizationCharts = ({ rankingData, summaryStats }) => {
  // Prepare data for top 10 users chart
  const top10Data = rankingData.slice(0, 10).map(user => ({
    name: user.name.split(' ')[0], // First name only for better display
    points: user.totalPoints,
    interactions: user.totalInteractions,
    followUps: user.followUps
  }))

  // Prepare data for performance tier distribution
  const tierData = [
    { name: 'Power Users (200+)', value: rankingData.filter(u => u.totalPoints >= 200).length, color: '#8B5CF6' },
    { name: 'High Performers (100-199)', value: rankingData.filter(u => u.totalPoints >= 100 && u.totalPoints < 200).length, color: '#10B981' },
    { name: 'Regular Users (50-99)', value: rankingData.filter(u => u.totalPoints >= 50 && u.totalPoints < 100).length, color: '#3B82F6' },
    { name: 'Light Users (<50)', value: rankingData.filter(u => u.totalPoints < 50).length, color: '#6B7280' }
  ]

  // Prepare data for points vs interactions scatter plot
  const scatterData = rankingData.map(user => ({
    interactions: user.totalInteractions,
    points: user.totalPoints,
    name: user.name.split(' ')[0],
    followUps: user.followUps
  }))

  // Achievement distribution data
  const achievementCounts = {
    'Deep Diver': 0,
    'Study Strategist': 0,
    'Pathway Pro': 0,
    'Bug Hunter': 0
  }

  rankingData.forEach(user => {
    user.achievements.forEach(achievement => {
      const cleanAchievement = achievement.replace(/🧠|📚|🎓|🔍/g, '').trim()
      if (achievementCounts.hasOwnProperty(cleanAchievement)) {
        achievementCounts[cleanAchievement]++
      }
    })
  })

  const achievementData = Object.entries(achievementCounts).map(([name, value]) => ({
    name,
    value,
    percentage: Math.round((value / rankingData.length) * 100)
  }))

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const ScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p>Points: {data.points}</p>
          <p>Interactions: {data.interactions}</p>
          <p>Follow-ups: {data.followUps}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Top 10 Users Bar Chart */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Top 10 Users Performance
          </CardTitle>
          <CardDescription>
            Gamification points and engagement metrics for top performers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={top10Data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="points" fill="#3B82F6" name="Points" />
              <Bar dataKey="followUps" fill="#10B981" name="Follow-ups" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Tier Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-purple-600" />
            Performance Tiers
          </CardTitle>
          <CardDescription>
            Distribution of users across performance levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tierData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percentage }) => `${name}: ${value} (${Math.round(percentage)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {tierData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Points vs Interactions Scatter Plot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scatter3D className="h-5 w-5 text-green-600" />
            Engagement Efficiency
          </CardTitle>
          <CardDescription>
            Points earned vs total interactions (bubble size = follow-ups)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={scatterData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey="interactions" name="Interactions" />
              <YAxis type="number" dataKey="points" name="Points" />
              <Tooltip content={<ScatterTooltip />} />
              <Scatter 
                dataKey="points" 
                fill="#8884d8"
                r={(entry) => Math.max(4, Math.min(20, entry.followUps))}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Achievement Distribution */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-yellow-600" />
            Achievement Distribution
          </CardTitle>
          <CardDescription>
            Number of users who earned each achievement badge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={achievementData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, 'Users']}
                labelFormatter={(label) => `Achievement: ${label}`}
              />
              <Bar dataKey="value" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default VisualizationCharts

