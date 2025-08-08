// Gamification Analysis Logic
// Based on the established rubrics for AI Assistant engagement

export function analyzeQuestionQuality(inputText, outputText) {
  if (!inputText || !outputText) {
    return { points: 0, criteria: [] };
  }
  
  let points = 1; // Base point for asking a question
  const criteria = [];
  
  // Check for goal-aligned questions (exam prep, class topics)
  const goalKeywords = ['exam', 'test', 'certification', 'comptia', 'class', 'course', 'assignment', 'homework', 'study', 'cert prep', 'calendar', 'upcoming'];
  if (goalKeywords.some(keyword => inputText.toLowerCase().includes(keyword))) {
    points += 2;
    criteria.push("Goal-aligned question (+2 pts)");
  }
  
  // Check for specific topics/keywords
  const topicKeywords = ['subnetting', 'networking', 'security', 'hardware', 'troubleshooting', 'attendance', 'health check', 'assistant', 'coach', 'tutor'];
  if (topicKeywords.some(keyword => inputText.toLowerCase().includes(keyword))) {
    points += 1;
    criteria.push("Specific topic/keyword (+1 pt)");
  }
  
  // Check for structured/long response (>50 words)
  if (outputText.split(' ').length > 50) {
    points += 1;
    criteria.push("Detailed response received (+1 pt)");
  }
  
  return { points, criteria };
}

export function detectFollowUpQuestions(interactions, userEmail) {
  const userInteractions = interactions
    .filter(interaction => interaction.email === userEmail)
    .sort((a, b) => new Date(a.created) - new Date(b.created));
  
  let followUps = 0;
  
  // Group by course/conversation and look for sequential interactions
  const courseGroups = {};
  userInteractions.forEach(interaction => {
    const courseId = interaction.course_id;
    if (!courseGroups[courseId]) {
      courseGroups[courseId] = [];
    }
    courseGroups[courseId].push(interaction);
  });
  
  Object.values(courseGroups).forEach(courseInteractions => {
    if (courseInteractions.length > 1) {
      followUps += courseInteractions.length - 1;
    }
  });
  
  return followUps;
}

export function calculateUserScores(interactions) {
  const userScores = {};
  
  // Get unique users and filter out perscholas.org domain emails
  const uniqueUsers = [...new Set(interactions.map(i => i.email).filter(Boolean))]
    .filter(email => !email.toLowerCase().includes('perscholas.org'));
  
  uniqueUsers.forEach(email => {
    const userData = interactions.filter(i => i.email === email);
    
    // Basic metrics
    const totalInteractions = userData.length;
    const totalCredits = userData.reduce((sum, i) => sum + (parseInt(i.credits) || 0), 0);
    
    // Calculate points based on question quality
    let totalPoints = 0;
    const allCriteria = [];
    
    userData.forEach(row => {
      const { points, criteria } = analyzeQuestionQuality(row.input, row.outputs);
      totalPoints += points;
      allCriteria.push(...criteria);
    });
    
    // Follow-up questions bonus
    const followUps = detectFollowUpQuestions(interactions, email);
    const followUpPoints = followUps * 2;
    totalPoints += followUpPoints;
    if (followUps > 0) {
      allCriteria.push(`Follow-up questions: ${followUps} (+${followUpPoints} pts)`);
    }
    
    // Check for different assistants/modules used
    const uniqueAssistants = new Set(userData.map(i => i.instance_ainame).filter(Boolean)).size;
    const uniqueCourses = new Set(userData.map(i => i.course_name).filter(Boolean)).size;
    
    // Pathway Pro achievement (3+ different modules)
    const pathwayPro = uniqueCourses >= 3;
    if (pathwayPro) {
      totalPoints += 5;
      allCriteria.push("Pathway Pro achievement (+5 pts)");
    }
    
    // Calculate average response time and quality metrics
    const avgDuration = userData.reduce((sum, i) => sum + (parseInt(i.query_duration_ms) || 0), 0) / userData.length;
    const avgTtft = userData.reduce((sum, i) => sum + (parseInt(i.ttft) || 0), 0) / userData.length;
    
    // Success rate
    const successRate = (userData.filter(i => i.success === 'TRUE' || i.success === true).length / userData.length) * 100;
    
    userScores[email] = {
      name: `${userData[0]?.first || ''} ${userData[0]?.last || ''}`.trim() || 'Unknown User',
      totalPoints,
      totalInteractions,
      totalCredits,
      followUps,
      uniqueCourses,
      uniqueAssistants,
      avgDurationMs: avgDuration,
      avgTtftMs: avgTtft,
      successRate,
      pathwayPro,
      criteriaMet: allCriteria
    };
  });
  
  return userScores;
}

export function identifyAchievements(userScores) {
  const achievements = {};
  
  Object.entries(userScores).forEach(([email, scores]) => {
    const userAchievements = [];
    
    // Deep Diver: 5+ follow-up questions
    if (scores.followUps >= 5) {
      userAchievements.push("🧠 Deep Diver");
    }
    
    // Study Strategist: Used assistant for exam prep 3+ times
    const examPrepCount = scores.criteriaMet.filter(criteria => 
      criteria.includes('Goal-aligned')).length;
    if (examPrepCount >= 3) {
      userAchievements.push("📚 Study Strategist");
    }
    
    // Bug Hunter: 3+ troubleshooting questions
    const troubleshootingCount = scores.criteriaMet.filter(criteria => 
      criteria.toLowerCase().includes('troubleshooting')).length;
    if (troubleshootingCount >= 3) {
      userAchievements.push("🔍 Bug Hunter");
    }
    
    // Pathway Pro: Used across 3+ different modules
    if (scores.pathwayPro) {
      userAchievements.push("🎓 Pathway Pro");
    }
    
    achievements[email] = userAchievements;
  });
  
  return achievements;
}

export function generateRankingData(userScores, achievements) {
  // Sort users by total points
  const sortedUsers = Object.entries(userScores)
    .sort(([,a], [,b]) => b.totalPoints - a.totalPoints)
    .map(([email, scores], index) => ({
      rank: index + 1,
      email,
      ...scores,
      achievements: achievements[email] || []
    }));
  
  return sortedUsers;
}

export function calculateSummaryStats(userScores) {
  const scores = Object.values(userScores);
  
  return {
    totalUsers: scores.length,
    totalInteractions: scores.reduce((sum, s) => sum + s.totalInteractions, 0),
    totalCredits: scores.reduce((sum, s) => sum + s.totalCredits, 0),
    avgPointsPerUser: scores.reduce((sum, s) => sum + s.totalPoints, 0) / scores.length,
    highPerformers: scores.filter(s => s.totalPoints > 100).length,
    mediumPerformers: scores.filter(s => s.totalPoints >= 20 && s.totalPoints <= 100).length,
    lightUsers: scores.filter(s => s.totalPoints < 20).length
  };
}

