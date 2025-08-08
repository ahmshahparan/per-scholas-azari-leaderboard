import pandas as pd
import json
from datetime import datetime
import io

def analyze_question_quality(input_text, output_text):
    """Analyze question quality based on established rubrics"""
    if not input_text or not output_text:
        return {"points": 0, "criteria": []}
    
    points = 1  # Base point for asking a question
    criteria = []
    
    # Check for goal-aligned questions (exam prep, class topics)
    goal_keywords = ['exam', 'test', 'certification', 'comptia', 'class', 'course', 
                     'assignment', 'homework', 'study', 'cert prep', 'calendar', 'upcoming']
    if any(keyword in input_text.lower() for keyword in goal_keywords):
        points += 2
        criteria.append("Goal-aligned question (+2 pts)")
    
    # Check for specific topics/keywords
    topic_keywords = ['subnetting', 'networking', 'security', 'hardware', 'troubleshooting', 
                      'attendance', 'health check', 'assistant', 'coach', 'tutor']
    if any(keyword in input_text.lower() for keyword in topic_keywords):
        points += 1
        criteria.append("Specific topic/keyword (+1 pt)")
    
    # Check for structured/long response (>50 words)
    if len(output_text.split()) > 50:
        points += 1
        criteria.append("Detailed response received (+1 pt)")
    
    return {"points": points, "criteria": criteria}

def detect_follow_up_questions(interactions, user_email):
    """Detect follow-up questions for a specific user"""
    user_interactions = [i for i in interactions if i.get('email') == user_email]
    user_interactions.sort(key=lambda x: x.get('created', ''))
    
    follow_ups = 0
    
    # Group by course/conversation and look for sequential interactions
    course_groups = {}
    for interaction in user_interactions:
        course_id = interaction.get('course_id', 'unknown')
        if course_id not in course_groups:
            course_groups[course_id] = []
        course_groups[course_id].append(interaction)
    
    # Count follow-ups within each course
    for course_interactions in course_groups.values():
        if len(course_interactions) > 1:
            # Consider interactions within 2 hours as potential follow-ups
            for i in range(1, len(course_interactions)):
                follow_ups += 1
    
    return follow_ups

def calculate_user_scores(interactions):
    """Calculate user scores based on gamification rubrics"""
    user_scores = {}
    
    # Get unique users and filter out perscholas.org domain emails
    unique_users = list(set([i.get('email') for i in interactions if i.get('email')]))
    unique_users = [email for email in unique_users if 'perscholas.org' not in email.lower()]
    
    for email in unique_users:
        user_data = [i for i in interactions if i.get('email') == email]
        
        # Basic metrics
        total_interactions = len(user_data)
        total_credits = sum([int(i.get('credits', 0)) for i in user_data])
        
        # Calculate points based on question quality
        total_points = 0
        all_criteria = []
        
        for row in user_data:
            result = analyze_question_quality(row.get('input', ''), row.get('outputs', ''))
            total_points += result['points']
            all_criteria.extend(result['criteria'])
        
        # Follow-up questions bonus
        follow_ups = detect_follow_up_questions(interactions, email)
        follow_up_points = follow_ups * 2
        total_points += follow_up_points
        if follow_ups > 0:
            all_criteria.append(f"Follow-up questions: {follow_ups} (+{follow_up_points} pts)")
        
        # Check for different assistants/modules used
        unique_assistants = len(set([i.get('instance_ainame') for i in user_data if i.get('instance_ainame')]))
        unique_courses = len(set([i.get('course_name') for i in user_data if i.get('course_name')]))
        
        # Pathway Pro achievement (3+ different modules)
        pathway_pro = unique_courses >= 3
        if pathway_pro:
            total_points += 5
            all_criteria.append("Pathway Pro achievement (+5 pts)")
        
        # Calculate average response time and quality metrics
        durations = [int(i.get('query_duration_ms', 0)) for i in user_data]
        ttfts = [int(i.get('ttft', 0)) for i in user_data]
        avg_duration = sum(durations) / len(durations) if durations else 0
        avg_ttft = sum(ttfts) / len(ttfts) if ttfts else 0
        
        # Success rate
        success_count = sum([1 for i in user_data if str(i.get('success', '')).upper() == 'TRUE'])
        success_rate = (success_count / total_interactions) * 100 if total_interactions > 0 else 0
        
        user_scores[email] = {
            "name": f"{user_data[0].get('first', '')} {user_data[0].get('last', '')}".strip() or 'Unknown User',
            "totalPoints": total_points,
            "totalInteractions": total_interactions,
            "totalCredits": total_credits,
            "followUps": follow_ups,
            "uniqueCourses": unique_courses,
            "uniqueAssistants": unique_assistants,
            "avgDurationMs": avg_duration,
            "avgTtftMs": avg_ttft,
            "successRate": success_rate,
            "pathwayPro": pathway_pro,
            "criteriaMet": all_criteria
        }
    
    return user_scores

def identify_achievements(user_scores):
    """Identify achievements for each user"""
    achievements = {}
    
    for email, scores in user_scores.items():
        user_achievements = []
        
        # Deep Diver: 5+ follow-up questions
        if scores['followUps'] >= 5:
            user_achievements.append("🧠 Deep Diver")
        
        # Study Strategist: 3+ goal-aligned questions (estimated from high points)
        if scores['totalPoints'] >= 15:  # Rough estimate for goal-aligned questions
            user_achievements.append("📚 Study Strategist")
        
        # Pathway Pro: 3+ unique courses
        if scores['uniqueCourses'] >= 3:
            user_achievements.append("🎓 Pathway Pro")
        
        # Bug Hunter: 3+ troubleshooting questions (estimated)
        # This would need more sophisticated analysis of question content
        
        achievements[email] = user_achievements
    
    return achievements

def process_csv_data(csv_content):
    """Process CSV data and return analysis results"""
    try:
        # Parse CSV content
        df = pd.read_csv(io.StringIO(csv_content))
        interactions = df.to_dict('records')
        
        # Calculate user scores
        user_scores = calculate_user_scores(interactions)
        
        # Identify achievements
        achievements = identify_achievements(user_scores)
        
        # Create ranking data
        ranking_data = []
        for email, scores in user_scores.items():
            ranking_data.append({
                "email": email,
                "name": scores["name"],
                "totalPoints": scores["totalPoints"],
                "totalInteractions": scores["totalInteractions"],
                "totalCredits": scores["totalCredits"],
                "followUps": scores["followUps"],
                "uniqueCourses": scores["uniqueCourses"],
                "successRate": scores["successRate"],
                "achievements": achievements.get(email, [])
            })
        
        # Sort by total points
        ranking_data.sort(key=lambda x: x["totalPoints"], reverse=True)
        
        # Add ranks
        for i, user in enumerate(ranking_data):
            user["rank"] = i + 1
        
        # Calculate summary stats
        total_users = len(ranking_data)
        total_interactions = sum([user["totalInteractions"] for user in ranking_data])
        avg_points = sum([user["totalPoints"] for user in ranking_data]) / total_users if total_users > 0 else 0
        
        # Count achievements
        achievement_counts = {}
        for user in ranking_data:
            for achievement in user["achievements"]:
                achievement_counts[achievement] = achievement_counts.get(achievement, 0) + 1
        
        summary_stats = {
            "totalUsers": total_users,
            "totalInteractions": total_interactions,
            "averagePoints": round(avg_points, 1),
            "achievementCounts": achievement_counts,
            "topPerformer": ranking_data[0] if ranking_data else None
        }
        
        return {
            "summaryStats": summary_stats,
            "rankingData": ranking_data,
            "rawData": interactions
        }
        
    except Exception as e:
        print(f"Error processing CSV data: {e}")
        raise

