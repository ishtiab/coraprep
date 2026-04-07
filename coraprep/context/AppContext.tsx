"use client"
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { unit1 as defaultUnit1 } from '../data/unit1'
import { vocab as defaultVocab } from '../data/vocab'
import { exams as defaultExams } from '../data/exams'

type User = { id?: string, name: string, email?: string, provider?: string, authToken?: string }
type Settings = { dailyGoal: number, spacedRepetition: boolean, darkMode: boolean, accentColor: string, reminderTime: string }

type Stats = {
  flashcardsReviewed: number
  flashcardsMastered: number
  flashcardsAttempted: number
  streak: number
  accuracy: number
  avgTime: number
  mastery: number
  xp: number
  consistency: number[] // 7-day minutes
  lastPractice: string | null
  lastLogin: string | null
  totalTimeSpent: number
}

export type AppNotification = {
  id: string
  type: 'streak' | 'system'
  title: string
  message: string
  createdAt: string
  read: boolean
}

type StreakToastState =
  | { open: false }
  | { open: true; streak: number; title: string; message: string }

type FlashcardItem = { id: string, question?: string, answer?: string, title?: string, children?: FlashcardItem[] }
type VocabStatus = 'unmarked' | 'review' | 'mastered'
type VocabProgress = Record<string, VocabStatus>
type VocabItem = { id: string, term: string, pronunciation?: string, short?: string, definition?: string, context?: string, category?: string, mastery?: number, level?: string, isAnatomy?: boolean, imagePath?: string }
type ExamItem = { id: string, question: string, choices: string[], answer: string, topic?: string }
type SavedMap = Record<string, true>

export type AppContent = {
  units: { [unitKey: string]: FlashcardItem[] }
  vocab: VocabItem[]
  exams: ExamItem[]
}

const defaultStats: Stats = {
  flashcardsReviewed: 0,
  flashcardsMastered: 0,
  flashcardsAttempted: 0,
  streak: 0,
  accuracy: 0,
  avgTime: 0,
  mastery: 0,
  xp: 0,
  consistency: [0,0,0,0,0,0,0],
  lastPractice: null,
  lastLogin: null,
  totalTimeSpent: 0,
}

const defaultSettings: Settings = { dailyGoal: 30, spacedRepetition: true, darkMode: false, accentColor: '#1E63B5', reminderTime: '18:00' }

const defaultContent: AppContent = {
  units: { unit1: defaultUnit1 },
  vocab: defaultVocab,
  exams: defaultExams,
}

function keyForUser(user: User | null, baseKey: string){
  if(user?.email && user.name !== 'Learner'){
    const safe = user.email.replace(/[^a-zA-Z0-9_@.-]/g,'_')
    return `${baseKey}_${safe}`
  }
  return baseKey
}

function startOfDayMs(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

function dayDiff(a: Date, b: Date) {
  return Math.round((startOfDayMs(b) - startOfDayMs(a)) / (24 * 60 * 60 * 1000))
}

function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function convertUnits(data: any): { [unitKey: string]: any[] } {
  if (!data || typeof data !== 'object') return {};

  const result: { [unitKey: string]: any[] } = {};

  for (const unitKey in data) {
    if (!data.hasOwnProperty(unitKey)) continue;

    const unitData = data[unitKey];
    let idCounter = 0;

    function buildItems(obj: any): any[] {
      const items: any[] = [];

      for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;

        const value = obj[key];

        if (value === null || value === undefined) continue;

        // If it's a primitive (string, number, boolean, array), create a question
        if (typeof value !== 'object' || Array.isArray(value)) {
          items.push({
            id: `q${idCounter++}`,
            question: key,
            answer: Array.isArray(value) ? value.join(', ') : String(value)
          });
          continue;
        }

        // Check if object has Question and Answer properties (new format)
        const hasQuestion = 'Question' in value || 'question' in value;
        const hasAnswer = 'Answer' in value || 'answer' in value;

        if (hasQuestion && hasAnswer) {
          // Direct question/answer pair
          const q = value['Question'] || value['question'];
          const a = value['Answer'] || value['answer'];
          items.push({
            id: `q${idCounter++}`,
            question: q,
            answer: a
          });

          // Process other properties as sub-items
          const subItems: any[] = [];
          for (const subKey in value) {
            if (!value.hasOwnProperty(subKey) || subKey.toLowerCase() === 'question' || subKey.toLowerCase() === 'answer') continue;
            const subValue = value[subKey];
            if (typeof subValue === 'object' && subValue !== null && !Array.isArray(subValue)) {
              const nestedItems = buildItems({ [subKey]: subValue });
              subItems.push(...nestedItems);
            }
          }

          if (subItems.length > 0) {
            items[items.length - 1].children = subItems;
          }
        } else {
          // It's a category object without explicit Question/Answer
          const subItems = buildItems(value);
          const categoryItem: any = {
            id: `cat${idCounter++}`,
            title: key,
            children: subItems.length > 0 ? subItems : [{
              id: `q${idCounter++}`,
              question: 'No details',
              answer: 'This section is empty'
            }]
          };
          items.push(categoryItem);
        }
      }

      return items;
    }

    const root = {
      id: `unit${idCounter++}`,
      title: unitKey,
      children: buildItems(unitData)
    };

    result[unitKey] = [root];
  }

  return result;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function convertVocabularyJson(data: any): VocabItem[] {
  const list = Array.isArray(data) ? data : Array.isArray(data?.vocabulary) ? data.vocabulary : []
  return list
    .filter((v: any) => v && typeof v.term === 'string')
    .map((v: any) => {
      const term = String(v.term).trim()
      const id = `voc_${slugify(term) || makeId()}`

      const definition =
        typeof v.definition === 'string'
          ? v.definition
          : [v.structure ? `Structure: ${v.structure}` : '', v.function ? `Function: ${v.function}` : '']
              .filter(Boolean)
              .join('\n')

      const contextParts: string[] = []
      if (typeof v.extra === 'string') contextParts.push(v.extra)
      if (v.effects && typeof v.effects === 'object') {
        const effectLines = Object.entries(v.effects)
          .map(([k, val]) => `${k}: ${String(val)}`)
          .slice(0, 8)
        if (effectLines.length) contextParts.push(`Effects:\n${effectLines.join('\n')}`)
      }
      if (typeof v.topic === 'string') contextParts.push(`Topic: ${String(v.topic).replace(/_/g, ' ')}`)
      if (typeof v.type === 'string') contextParts.push(`Type: ${v.type}`)

      const categoryRaw = typeof v.topic === 'string' ? v.topic : 'General'
      const category = String(categoryRaw).replace(/_/g, ' ')
      const short = typeof v.type === 'string' ? v.type : category

      // User progress is tracked separately (per account). Defaults to unmarked.
      const mastery = typeof v.mastery === 'number' ? v.mastery : 0
      const level: VocabStatus = 'unmarked'

      const isAnatomy = Boolean(
        (typeof v.topic === 'string' && v.topic.toLowerCase().includes('anatom')) ||
          v.structure ||
          v.function
      )

      return {
        id,
        term,
        pronunciation: typeof v.pronunciation === 'string' ? v.pronunciation : '',
        short,
        definition: definition || '',
        context: contextParts.join('\n\n'),
        category,
        mastery,
        level,
        isAnatomy,
      } satisfies VocabItem
    })
}

function normalizeVocabStatus(input: any): VocabStatus {
  return input === 'mastered' || input === 'review' || input === 'unmarked' ? input : 'unmarked'
}

function applyVocabProgress(items: VocabItem[], progress: VocabProgress): VocabItem[] {
  return items.map((item) => {
    const status = normalizeVocabStatus(progress[item.id])
    return { ...item, level: status }
  })
}

const AppContext = createContext<any>(null)

export function AppProvider({ children }: { children: React.ReactNode }){
  const [user,setUser] = useState<User | null>(null)
  const [stats,setStats] = useState<Stats>(defaultStats)
  const [settings,setSettings] = useState<Settings>(defaultSettings)
  const [content,setContent] = useState<AppContent>(defaultContent)

  const [vocabProgress, setVocabProgress] = useState<VocabProgress>({})

  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [streakToast, setStreakToast] = useState<StreakToastState>({ open: false })

  const [vocabSaved, setVocabSaved] = useState<SavedMap>({})
  const [flashcardSaved, setFlashcardSaved] = useState<SavedMap>({})

  const notificationsKey = useMemo(() => keyForUser(user, 'cora_notifications'), [user])
  const vocabProgressKey = useMemo(() => keyForUser(user, 'cora_vocab_progress'), [user])
  const vocabSavedKey = useMemo(() => keyForUser(user, 'cora_vocab_saved'), [user])
  const flashcardSavedKey = useMemo(() => keyForUser(user, 'cora_flashcard_saved'), [user])
  const didBumpLoginStreakRef = useRef<string>('')

  async function loadVocabForProgress(progress: VocabProgress) {
    try {
      const res = await fetch('/api/vocab')
      if (!res.ok) return
      const data = await res.json()
      const converted = convertVocabularyJson(data)
      if (converted.length > 0) {
        setContent((prev) => ({ ...prev, vocab: applyVocabProgress(converted, progress) }))
      }
    } catch {
      // Keep default or saved
    }
  }

  function hydrateForUser(nextUser: User | null) {
    const statsKey = keyForUser(nextUser, 'cora_stats')
    const settingsKey = keyForUser(nextUser, 'cora_settings')
    const contentKey = keyForUser(nextUser, 'cora_content')
    const notificationsKey = keyForUser(nextUser, 'cora_notifications')
    const vocabProgressKey = keyForUser(nextUser, 'cora_vocab_progress')
    const vocabSavedKey = keyForUser(nextUser, 'cora_vocab_saved')
    const flashcardSavedKey = keyForUser(nextUser, 'cora_flashcard_saved')

    const rawStats = localStorage.getItem(statsKey) || localStorage.getItem('cora_stats')
    const rawSettings = localStorage.getItem(settingsKey) || localStorage.getItem('cora_settings')
    const rawContent = localStorage.getItem(contentKey) || localStorage.getItem('cora_content')
    const rawNotifications = localStorage.getItem(notificationsKey) || localStorage.getItem('cora_notifications')
    const rawVocabProgress = localStorage.getItem(vocabProgressKey) || localStorage.getItem('cora_vocab_progress')
    const rawVocabSaved = localStorage.getItem(vocabSavedKey) || localStorage.getItem('cora_vocab_saved')
    const rawFlashcardSaved = localStorage.getItem(flashcardSavedKey) || localStorage.getItem('cora_flashcard_saved')

    if (rawStats) {
      try { setStats(JSON.parse(rawStats)) } catch {}
    } else {
      setStats(defaultStats)
    }

    if (rawSettings) {
      try { setSettings(JSON.parse(rawSettings)) } catch {}
    } else {
      setSettings(defaultSettings)
    }

    if (rawNotifications) {
      try { setNotifications(JSON.parse(rawNotifications)) } catch { setNotifications([]) }
    } else {
      setNotifications([])
    }

    if (rawContent) {
      try {
        const parsed = JSON.parse(rawContent)
        setContent(parsed)
      } catch {
        setContent(defaultContent)
      }
    } else {
      setContent(defaultContent)
    }

    if (rawVocabSaved) {
      try {
        const parsed = JSON.parse(rawVocabSaved)
        if (Array.isArray(parsed)) {
          const next: SavedMap = {}
          for (const id of parsed) next[String(id)] = true
          setVocabSaved(next)
        } else if (parsed && typeof parsed === 'object') {
          const next: SavedMap = {}
          for (const [id, enabled] of Object.entries(parsed)) {
            if (enabled) next[String(id)] = true
          }
          setVocabSaved(next)
        } else {
          setVocabSaved({})
        }
      } catch {
        setVocabSaved({})
      }
    } else {
      setVocabSaved({})
    }

    if (rawFlashcardSaved) {
      try {
        const parsed = JSON.parse(rawFlashcardSaved)
        if (Array.isArray(parsed)) {
          const next: SavedMap = {}
          for (const id of parsed) next[String(id)] = true
          setFlashcardSaved(next)
        } else if (parsed && typeof parsed === 'object') {
          const next: SavedMap = {}
          for (const [id, enabled] of Object.entries(parsed)) {
            if (enabled) next[String(id)] = true
          }
          setFlashcardSaved(next)
        } else {
          setFlashcardSaved({})
        }
      } catch {
        setFlashcardSaved({})
      }
    } else {
      setFlashcardSaved({})
    }

    let parsedProgress: VocabProgress = {}
    if (rawVocabProgress) {
      try {
        const parsed = JSON.parse(rawVocabProgress)
        if (parsed && typeof parsed === 'object') {
          for (const [id, status] of Object.entries(parsed)) {
            parsedProgress[id] = normalizeVocabStatus(status)
          }
        }
      } catch {}
    }
    setVocabProgress(parsedProgress)
    loadVocabForProgress(parsedProgress)
  }

  useEffect(()=>{
    // Try to restore user from auth token first
    const token = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('user') || localStorage.getItem('cora_user')
    let currentUser: User | null = null

    if (token && savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        parsed.authToken = token
        currentUser = parsed
        setUser(parsed)
      } catch (e) {
        console.warn('Failed to restore user from localStorage', e)
        setUser({ name: 'Learner' })
      }
    } else if (savedUser) {
      try {
        currentUser = JSON.parse(savedUser)
        setUser(currentUser)
      } catch (e) {
        setUser({ name: 'Learner' })
      }
    } else {
      setUser({ name: 'Learner' })
    }

    hydrateForUser(currentUser)

    // Always load units if available
    fetch('/api/unit1')
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        const converted = convertUnits(data);
        setContent(prev => ({ ...prev, units: converted }));
      })
      .catch(() => {
        // Keep default or saved
      });

    // Vocabulary is loaded inside hydrateForUser() so it can apply per-user progress.
  },[])

  useEffect(() => {
    try {
      localStorage.setItem(notificationsKey, JSON.stringify(notifications))
    } catch {}
  }, [notificationsKey, notifications])

  useEffect(() => {
    try {
      localStorage.setItem(vocabProgressKey, JSON.stringify(vocabProgress))
    } catch {}
  }, [vocabProgressKey, vocabProgress])

  useEffect(() => {
    try {
      localStorage.setItem(vocabSavedKey, JSON.stringify(vocabSaved))
    } catch {}
  }, [vocabSavedKey, vocabSaved])

  useEffect(() => {
    try {
      localStorage.setItem(flashcardSavedKey, JSON.stringify(flashcardSaved))
    } catch {}
  }, [flashcardSavedKey, flashcardSaved])

  useEffect(()=>{
    if (user?.name === 'Learner' && !user.email) {
      localStorage.setItem('cora_user', JSON.stringify(user))
    } else if (user) {
      const { authToken, ...userWithoutToken } = user
      localStorage.setItem('user', JSON.stringify(userWithoutToken))
      localStorage.setItem('cora_user', JSON.stringify(userWithoutToken))
    }
  },[user])

  useEffect(()=>{
    const key = keyForUser(user, 'cora_stats')
    localStorage.setItem(key, JSON.stringify(stats))
  },[stats, user])

  useEffect(()=>{
    const key = keyForUser(user, 'cora_settings')
    localStorage.setItem(key, JSON.stringify(settings))
  },[settings, user])

  useEffect(()=>{
    const key = keyForUser(user, 'cora_content')
    localStorage.setItem(key, JSON.stringify(content))
  },[content, user])

  function addNotification(input: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) {
    const notif: AppNotification = {
      id: makeId(),
      createdAt: new Date().toISOString(),
      read: false,
      ...input,
    }
    setNotifications((prev) => [notif, ...prev].slice(0, 100))
  }

  function markNotificationRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  function markAllNotificationsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function dismissStreakToast() {
    setStreakToast({ open: false })
  }

  useEffect(()=>{
    if (!user || user.name === 'Learner') return
    const interval = setInterval(() => {
      addPractice(10)
    }, 10 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user])

  function login(u: User){
    setUser(u)
    hydrateForUser(u)
  }
  function loginWithEmail(u: User){ 
    const next = { ...u, authToken: localStorage.getItem('auth_token') || undefined }
    setUser(next)
    hydrateForUser(next)
  }
  function signup(u: User){
    setUser(u)
    hydrateForUser(u)
  }
  function logout(){ 
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    setUser({ name: 'Learner' })
    setStats(defaultStats)
    setVocabProgress({})
    setVocabSaved({})
    setFlashcardSaved({})
  }
  function resetProgress(){ setStats(defaultStats) }

  // Login-based streak bump: runs once per user-per-day when a real user is present.
  useEffect(() => {
    if (!user?.email || user.name === 'Learner') return

    const todayKey = `${user.email}::${new Date().toDateString()}`
    if (didBumpLoginStreakRef.current === todayKey) return
    didBumpLoginStreakRef.current = todayKey

    setStats((prev) => {
      const now = new Date()
      const lastLogin = prev.lastLogin ? new Date(prev.lastLogin) : null

      if (!lastLogin || isNaN(lastLogin.getTime())) {
        const nextStreak = Math.max(1, prev.streak || 0)
        addNotification({
          type: 'streak',
          title: 'Streak started',
          message: `Good job — you started a ${nextStreak}-day streak.`,
        })
        setStreakToast({ open: true, streak: nextStreak, title: 'Streak started', message: 'Good job! Your streak started.' })
        return { ...prev, streak: nextStreak, lastLogin: now.toISOString() }
      }

      const diff = dayDiff(lastLogin, now)
      if (diff === 0) {
        return prev
      }

      if (diff === 1) {
        const nextStreak = (prev.streak || 0) + 1
        addNotification({
          type: 'streak',
          title: 'Streak increased',
          message: `Good job — your streak is now ${nextStreak} days!`,
        })
        setStreakToast({ open: true, streak: nextStreak, title: 'Streak increased', message: 'Good job! Your streak increased.' })
        return { ...prev, streak: nextStreak, lastLogin: now.toISOString() }
      }

      // Missed one or more days: restart at 1
      addNotification({
        type: 'streak',
        title: 'Streak restarted',
        message: 'Welcome back — your streak restarted at 1 day.',
      })
      setStreakToast({ open: true, streak: 1, title: 'Welcome back', message: 'Welcome back! Your streak restarted.' })
      return { ...prev, streak: 1, lastLogin: now.toISOString() }
    })
  }, [user?.email, user?.name])

  function setImportedContent(newContent: AppContent){
    setContent(newContent)
  }

  function setVocabStatus(vocabId: string, status: VocabStatus) {
    const nextStatus = normalizeVocabStatus(status)

    setVocabProgress((prev) => {
      const next = { ...prev }
      if (nextStatus === 'unmarked') {
        delete next[vocabId]
      } else {
        next[vocabId] = nextStatus
      }
      return next
    })

    setContent((prev) => ({
      ...prev,
      vocab: (prev.vocab || []).map((v) => (v.id === vocabId ? { ...v, level: nextStatus } : v)),
    }))
  }

  function isVocabSaved(id: string) {
    return !!vocabSaved[String(id)]
  }

  function toggleVocabSaved(id: string) {
    const key = String(id)
    setVocabSaved((prev) => {
      const next = { ...prev }
      if (next[key]) delete next[key]
      else next[key] = true
      return next
    })
  }

  function isFlashcardSaved(id: string) {
    return !!flashcardSaved[String(id)]
  }

  function toggleFlashcardSaved(id: string) {
    const key = String(id)
    setFlashcardSaved((prev) => {
      const next = { ...prev }
      if (next[key]) delete next[key]
      else next[key] = true
      return next
    })
  }

  function calcEffectiveStreak(){
    if(!stats.lastPractice) return 1
    const prev = new Date(stats.lastPractice)
    const today = new Date()
    const dayDiff = Math.floor((today.getTime() - prev.getTime()) / (1000*60*60*24))
    return dayDiff === 1 ? stats.streak + 1 : (dayDiff === 0 ? stats.streak : 1)
  }

  function addPractice(minutes:number){
    const today = new Date()
    const dayOfWeek = today.getDay() // 0-6 Sun-Sat
    const cons = [...stats.consistency]
    const idx = (dayOfWeek + 6) % 7 // shift to Mon=0
    cons[idx] = Math.min(180, cons[idx] + minutes)

    setStats((prev) => ({
      ...prev,
      // For logged-in users, streak is based on login. For guests, keep the old practice-based streak.
      streak: user?.email && user.name !== 'Learner' ? prev.streak : calcEffectiveStreak(),
      consistency: cons,
      lastPractice: today.toISOString(),
      xp: prev.xp + Math.floor(minutes / 2),
      totalTimeSpent: prev.totalTimeSpent + minutes,
    }))
  }

  function addFlashcardResult(rating: 'hard' | 'medium' | 'easy'){
    const xpGain = rating === 'easy' ? 20 : rating === 'medium' ? 10 : 2
    const additionalMastered = rating === 'easy' ? 1 : 0

    setStats((prev) => {
      const flashcardsAttempted = prev.flashcardsAttempted + 1
      const flashcardsMastered = prev.flashcardsMastered + additionalMastered
      const mastery = flashcardsAttempted === 0 ? 0 : Math.round((flashcardsMastered / flashcardsAttempted) * 100)

      return {
        ...prev,
        flashcardsReviewed: prev.flashcardsReviewed + 1,
        flashcardsAttempted,
        flashcardsMastered,
        mastery,
        xp: prev.xp + xpGain,
        // mimic simple accuracy
        accuracy: Math.round((flashcardsMastered / flashcardsAttempted) * 100),
      }
    })
  }

  function updateSettings(partial: Partial<Settings>){ setSettings({...settings, ...partial}) }

  // Get all question IDs from a unit
  function getAllQuestionIds(unitKey: string): string[] {
    const unit = content.units[unitKey];
    if (!unit) return [];

    const ids: string[] = [];

    function collectIds(items: any[]) {
      for (const item of items) {
        if (item.question) {
          ids.push(item.id);
        }
        if (item.children) {
          collectIds(item.children);
        }
      }
    }

    collectIds(unit);
    return ids;
  }

  // Calculate completion percentage for a unit based on ratings
  function getUnitCompletion(unitKey: string): number {
    const questionIds = getAllQuestionIds(unitKey);
    if (questionIds.length === 0) return 0;

    const ratingsKey = keyForUser(user, `cora_ratings_${unitKey}`);
    const fallbackKey = `cora_ratings_${unitKey}`;
    const ratings = JSON.parse(localStorage.getItem(ratingsKey) || localStorage.getItem(fallbackKey) || '{}');
    let completedCount = 0;

    for (const id of questionIds) {
      if (ratings[id] === 'easy') {
        completedCount += 1; // Full credit for easy
      } else if (ratings[id] === 'medium') {
        completedCount += 0.65; // 65% credit for medium
      } else if (ratings[id] === 'hard') {
        completedCount += 0.25; // 25% credit for hard
      }
    }

    return Math.round((completedCount / questionIds.length) * 100);
  }

  return (
    <AppContext.Provider value={{
      user,
      stats,
      settings,
      content,
      notifications,
      streakToast,
      vocabProgress,
      vocabSaved,
      flashcardSaved,
      login,
      loginWithEmail,
      signup,
      logout,
      resetProgress,
      updateSettings,
      addPractice,
      addFlashcardResult,
      setImportedContent,
      getUnitCompletion,
      getAllQuestionIds,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      dismissStreakToast,
      setVocabStatus,
      isVocabSaved,
      toggleVocabSaved,
      isFlashcardSaved,
      toggleFlashcardSaved,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp(){ return useContext(AppContext) }
