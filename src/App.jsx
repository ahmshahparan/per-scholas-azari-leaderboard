import React, { useState, useEffect } from 'react';
import { Trophy, Users, BarChart3, FileText, Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Alert, AlertDescription } from '@/components/ui/alert.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip.jsx';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginModal from './components/LoginModal';
import AdminPanel from './components/AdminPanel';
import apiService from './services/api';
import './App.css';

// Summary Stats Component
const SummaryStats = ({ stats }) => {
  const statCards = [
    {
      title: "Total Students",
      value: stats.totalUsers,
      icon: Users,
      description: "Per Scholas students analyzed",
      color: "text-blue-600"
    },
    {
      title: "Total Interactions", 
      value: stats.totalInteractions.toLocaleString(),
      icon: FileText,
      description: "Azari AI assistant conversations",
      color: "text-green-600"
    },
    {
      title: "Avg Points/Student",
      value: Math.round(stats.averagePoints || 0),
      icon: Trophy,
      description: "Average engagement points",
      color: "text-orange-600"
    },
    {
      title: "Top Performer",
      value: stats.topPerformer?.totalPoints || 0,
      icon: BarChart3,
      description: stats.topPerformer?.name || "No data",
      color: "text-yellow-600"
    }
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          Leaderboard Summary
        </CardTitle>
        <CardDescription>
          Key metrics from Per Scholas student engagement with Azari AI assistant
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className={`h-5 w-5 ${stat.color}`} />
                  <span className={`text-2xl font-bold ${stat.color}`}>
                    {stat.value}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{stat.title}</p>
                  <p className="text-sm text-gray-500">{stat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// User Ranking Table Component
const UserRankingTable = ({ rankingData }) => {
  // Achievement definitions with tooltips
  const achievementDefinitions = {
    '🧠 Deep Diver': {
      title: 'Deep Diver',
      description: 'Asked 5 or more follow-up questions, showing deep engagement and curiosity in learning topics.',
      criteria: 'Requirement: 5+ follow-up questions'
    },
    '📚 Study Strategist': {
      title: 'Study Strategist', 
      description: 'Used the AI assistant strategically for exam preparation, certification study, or course-related questions.',
      criteria: 'Requirement: 3+ goal-aligned questions (exam, certification, course topics)'
    },
    '🎓 Pathway Pro': {
      title: 'Pathway Pro',
      description: 'Explored diverse learning paths by engaging with 3 or more different courses or modules.',
      criteria: 'Requirement: 3+ unique courses/modules'
    },
    '🔍 Bug Hunter': {
      title: 'Bug Hunter',
      description: 'Actively sought help with troubleshooting and problem-solving technical issues.',
      criteria: 'Requirement: 3+ troubleshooting questions'
    }
  };

  const AchievementBadge = ({ achievement }) => {
    const definition = achievementDefinitions[achievement];
    
    if (!definition) {
      return (
        <Badge variant="outline" className="text-xs">
          {achievement}
        </Badge>
      );
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className="text-xs cursor-help hover:bg-gray-100 transition-colors">
              {achievement}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              <div className="font-semibold text-sm">{definition.title}</div>
              <div className="text-sm">{definition.description}</div>
              <div className="text-xs text-gray-500 border-t pt-1">{definition.criteria}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `#${rank}`;
    }
  };

  const getPerformanceTier = (points) => {
    if (points >= 200) return { label: "Power User", color: "bg-purple-100 text-purple-800" };
    if (points >= 100) return { label: "High Performer", color: "bg-green-100 text-green-800" };
    if (points >= 50) return { label: "Regular User", color: "bg-blue-100 text-blue-800" };
    return { label: "Light User", color: "bg-gray-100 text-gray-800" };
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Student Rankings
        </CardTitle>
        <CardDescription>
          Per Scholas student leaderboard based on Azari AI assistant engagement and learning metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Rank</th>
                <th className="text-left p-2">Student</th>
                <th className="text-right p-2">Points</th>
                <th className="text-right p-2">Interactions</th>
                <th className="text-right p-2">Follow-ups</th>
                <th className="text-right p-2">Success Rate</th>
                <th className="text-left p-2">Tier</th>
                <th className="text-left p-2">Achievements</th>
              </tr>
            </thead>
            <tbody>
              {rankingData.slice(0, 15).map((user) => {
                const tier = getPerformanceTier(user.totalPoints);
                return (
                  <tr key={user.email} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <span className="text-lg">{getRankIcon(user.rank)}</span>
                    </td>
                    <td className="p-2">
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="text-right p-2">
                      <div className="font-bold text-lg text-blue-600">
                        {user.totalPoints}
                      </div>
                    </td>
                    <td className="text-right p-2">
                      <div className="font-medium">{user.totalInteractions}</div>
                    </td>
                    <td className="text-right p-2">
                      <div className="font-medium text-green-600">{user.followUps}</div>
                    </td>
                    <td className="text-right p-2">
                      <div className="font-medium text-green-600">
                        {user.successRate.toFixed(1)}%
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge className={tier.color}>
                        {tier.label}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="flex flex-wrap gap-1">
                        {user.achievements.length > 0 ? (
                          user.achievements.map((achievement, index) => (
                            <AchievementBadge key={index} achievement={achievement} />
                          ))
                        ) : (
                          <span className="text-sm text-gray-400">None</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

// Main App Component
const AppContent = () => {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const { isAuthenticated } = useAuth();

  // Load data from API
  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await apiService.getResults();
      
      if (data) {
        setAnalysisResults(data);
        setLastUpdated(new Date(data.createdAt));
      } else {
        setAnalysisResults(null);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Handle data upload from admin panel
  const handleDataUploaded = () => {
    loadData(); // Refresh data after upload
  };

  // Download results as CSV
  const downloadResults = () => {
    if (!analysisResults) return;

    const csvContent = [
      ['Rank', 'Name', 'Email', 'Total Points', 'Interactions', 'Credits', 'Follow-ups', 'Success Rate', 'Achievements'],
      ...analysisResults.rankingData.map(user => [
        user.rank,
        user.name,
        user.email,
        user.totalPoints,
        user.totalInteractions,
        user.totalCredits,
        user.followUps,
        `${user.successRate.toFixed(1)}%`,
        user.achievements.join(', ')
      ])
    ].map(row => row.join(',')).join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `per-scholas-azari-leaderboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl font-bold text-gray-900">
              Per Scholas Azari Leaderboard
              {isAuthenticated && <span className="text-blue-600 ml-2">[ADMIN]</span>}
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isAuthenticated 
              ? "Admin dashboard for managing Per Scholas student rankings and Azari AI assistant engagement data"
              : "View Per Scholas student rankings and engagement metrics with Azari AI assistant"
            }
          </p>
        </div>

        {/* Admin Panel (only visible when authenticated) */}
        {isAuthenticated && (
          <AdminPanel onDataUploaded={handleDataUploaded} />
        )}

        {/* Admin Login Button (only visible when not authenticated) */}
        {!isAuthenticated && (
          <div className="flex justify-center mb-8">
            <Button
              onClick={() => setShowLoginModal(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Admin Login
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className="mb-8">
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                <span className="text-gray-600">Loading analysis data...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* No Data State */}
        {!isLoading && !error && !analysisResults && (
          <Card className="mb-8">
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Leaderboard Data Available</h3>
              <p className="text-gray-600 mb-4">
                {isAuthenticated 
                  ? "Upload a CSV file to generate Per Scholas student rankings and engagement metrics."
                  : "No student engagement data has been uploaded yet. Please check back later."
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {!isLoading && analysisResults && (
          <div className="space-y-8">
            {/* Last Updated Info */}
            {lastUpdated && (
              <div className="text-center text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleString()}
              </div>
            )}

            {/* Summary Stats */}
            <SummaryStats stats={analysisResults.summaryStats} />

            {/* Achievement Guide */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-blue-500" />
                  Achievement Guide
                </CardTitle>
                <CardDescription>
                  Hover over any achievement badge in the rankings to see detailed criteria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">🧠 Deep Diver</Badge>
                      <span className="text-sm text-gray-600">5+ follow-up questions</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">📚 Study Strategist</Badge>
                      <span className="text-sm text-gray-600">3+ goal-aligned questions</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">🎓 Pathway Pro</Badge>
                      <span className="text-sm text-gray-600">3+ unique courses</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">🔍 Bug Hunter</Badge>
                      <span className="text-sm text-gray-600">3+ troubleshooting questions</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center mb-8">
              <Button 
                onClick={downloadResults}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Download Results
              </Button>
              <Button 
                variant="outline"
                onClick={loadData}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Data
              </Button>
            </div>

            {/* User Rankings */}
            <UserRankingTable rankingData={analysisResults.rankingData} />
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-gray-500">
          <p>Per Scholas Azari Leaderboard - Built with React and powered by established engagement rubrics for AI assistant interaction analysis.</p>
        </div>

        {/* Login Modal */}
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
      </div>
    </div>
  );
};

// Main App with Auth Provider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

