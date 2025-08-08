import { Users, MessageSquare, CreditCard, TrendingUp, Star, Target } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'

const SummaryStats = ({ stats }) => {
  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      description: "Unique users analyzed",
      color: "text-blue-600"
    },
    {
      title: "Total Interactions",
      value: stats.totalInteractions.toLocaleString(),
      icon: MessageSquare,
      description: "AI assistant conversations",
      color: "text-green-600"
    },
    {
      title: "Total Credits",
      value: stats.totalCredits.toLocaleString(),
      icon: CreditCard,
      description: "Credits consumed",
      color: "text-purple-600"
    },
    {
      title: "Avg Points/User",
      value: Math.round(stats.avgPointsPerUser),
      icon: TrendingUp,
      description: "Average gamification points",
      color: "text-orange-600"
    },
    {
      title: "High Performers",
      value: stats.highPerformers,
      icon: Star,
      description: "Users with 100+ points",
      color: "text-yellow-600"
    },
    {
      title: "Engagement Rate",
      value: `${Math.round((stats.highPerformers + stats.mediumPerformers) / stats.totalUsers * 100)}%`,
      icon: Target,
      description: "Active users (20+ points)",
      color: "text-indigo-600"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <IconComponent className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <p className="text-sm text-gray-500">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default SummaryStats

