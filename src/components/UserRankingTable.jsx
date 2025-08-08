import { Trophy, Medal, Award, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'

const UserRankingTable = ({ rankingData }) => {
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <User className="h-5 w-5 text-gray-400" />
    }
  }

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case 2:
        return "bg-gray-100 text-gray-800 border-gray-300"
      case 3:
        return "bg-amber-100 text-amber-800 border-amber-300"
      default:
        return "bg-blue-100 text-blue-800 border-blue-300"
    }
  }

  const getPerformanceTier = (points) => {
    if (points >= 200) return { label: "Power User", color: "bg-purple-100 text-purple-800" }
    if (points >= 100) return { label: "High Performer", color: "bg-green-100 text-green-800" }
    if (points >= 50) return { label: "Regular User", color: "bg-blue-100 text-blue-800" }
    return { label: "Light User", color: "bg-gray-100 text-gray-800" }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          User Rankings
        </CardTitle>
        <CardDescription>
          Complete ranking based on gamification rubrics and engagement metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>User</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead className="text-right">Interactions</TableHead>
                <TableHead className="text-right">Follow-ups</TableHead>
                <TableHead className="text-right">Courses</TableHead>
                <TableHead className="text-right">Credits</TableHead>
                <TableHead className="text-right">Success Rate</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Achievements</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankingData.map((user) => {
                const tier = getPerformanceTier(user.totalPoints)
                return (
                  <TableRow key={user.email} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRankIcon(user.rank)}
                        <Badge className={getRankBadgeColor(user.rank)}>
                          #{user.rank}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-bold text-lg text-blue-600">
                        {user.totalPoints}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">{user.totalInteractions}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium text-green-600">{user.followUps}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">{user.uniqueCourses}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">{user.totalCredits}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium text-green-600">
                        {user.successRate.toFixed(1)}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={tier.color}>
                        {tier.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.achievements.length > 0 ? (
                          user.achievements.map((achievement, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {achievement}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">None</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        
        {rankingData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No user data found in the uploaded file.
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default UserRankingTable

