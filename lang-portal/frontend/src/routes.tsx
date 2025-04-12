import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout'
import Dashboard from './pages/Dashboard'
import StudyActivities from './pages/StudyActivities'
import StudyActivityShow from './pages/StudyActivityShow'
import StudyActivityLaunch from './pages/StudyActivityLaunch'
import Words from './pages/Words'
import WordShow from './pages/WordShow'
import Groups from './pages/Groups'
import GroupShow from './pages/GroupShow'
import StudySessions from './pages/StudySessions'
import StudySessionShow from './pages/StudySessionShow'
import Settings from './pages/Settings'
import WordQuizActivity from './pages/WordQuizActivity'

export function AppRoutes() {
  return (
    <Layout>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Study Activities */}
        <Route path="/study_activities" element={<StudyActivities />} />
        <Route path="/study_activities/:id" element={<StudyActivityShow />} />
        <Route path="/study_activities/:id/launch" element={<StudyActivityLaunch />} />
        
        {/* Words */}
        <Route path="/words" element={<Words />} />
        <Route path="/words/:id" element={<WordShow />} />
        <Route path="/word_quiz" element={<WordQuizActivity />} />
        <Route path="/word_quiz/:groupId" element={<WordQuizActivity />} />
        
        {/* Groups */}
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:id" element={<GroupShow />} />
        
        {/* Study Sessions */}
        <Route path="/study_sessions" element={<StudySessions />} />
        <Route path="/study_sessions/:id" element={<StudySessionShow />} />
        
        {/* Settings */}
        <Route path="/settings" element={<Settings />} />

        {/* 404 catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
} 