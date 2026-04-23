import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { initialSeed } from '../data/seed'

const STORAGE_KEY = 'nomad_portal_state_v1'
const AppContext = createContext(null)

const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialSeed
    const parsed = JSON.parse(raw)
    return { ...initialSeed, ...parsed }
  } catch {
    return initialSeed
  }
}

export function AppProvider({ children }) {
  const [state, setState] = useState(loadState)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const setSelectedClientId = useCallback((id) => {
    setState((s) => ({ ...s, selectedClientId: id }))
  }, [])

  const showToast = useCallback((message, variant = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, variant }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 3500)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  // ---------- Action Plans CRUD ----------
  const addActionPlan = useCallback((plan) => {
    setState((s) => ({
      ...s,
      actionPlans: [
        { id: 'plan-' + Date.now(), createdAt: new Date().toISOString(), progress: 0, ...plan },
        ...s.actionPlans,
      ],
    }))
    showToast('Plano de ação criado com sucesso')
  }, [showToast])

  const updateActionPlan = useCallback((id, patch) => {
    setState((s) => ({
      ...s,
      actionPlans: s.actionPlans.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }))
    showToast('Plano de ação atualizado')
  }, [showToast])

  const deleteActionPlan = useCallback((id) => {
    setState((s) => ({ ...s, actionPlans: s.actionPlans.filter((p) => p.id !== id) }))
    showToast('Plano de ação removido', 'info')
  }, [showToast])

  // ---------- Meetings CRUD ----------
  const addMeeting = useCallback((meeting) => {
    setState((s) => ({
      ...s,
      meetings: [{ id: 'meet-' + Date.now(), ...meeting }, ...s.meetings],
    }))
    showToast('Reunião registrada')
  }, [showToast])

  const requestMeeting = useCallback((req) => {
    setState((s) => ({
      ...s,
      announcements: [
        {
          id: 'ann-' + Date.now(),
          date: new Date().toISOString(),
          title: 'Solicitação de reunião enviada',
          message: `Cliente solicitou: ${req.subject}. Data sugerida: ${req.date}.`,
          priority: 'media',
        },
        ...s.announcements,
      ],
    }))
    showToast('Solicitação de reunião enviada para a NOMAD')
  }, [showToast])

  // ---------- Documents CRUD ----------
  const addDocument = useCallback((doc) => {
    setState((s) => ({
      ...s,
      documents: [
        { id: 'doc-' + Date.now(), uploadedAt: new Date().toISOString(), ...doc },
        ...s.documents,
      ],
    }))
    showToast('Documento adicionado à biblioteca')
  }, [showToast])

  const deleteDocument = useCallback((id) => {
    setState((s) => ({ ...s, documents: s.documents.filter((d) => d.id !== id) }))
    showToast('Documento removido', 'info')
  }, [showToast])

  // ---------- Calendar Posts ----------
  const updatePost = useCallback((id, patch, historyEntry) => {
    setState((s) => ({
      ...s,
      calendarPosts: s.calendarPosts.map((p) =>
        p.id === id
          ? {
              ...p,
              ...patch,
              history: historyEntry ? [...p.history, historyEntry] : p.history,
            }
          : p
      ),
    }))
  }, [])

  const approvePost = useCallback((id) => {
    updatePost(
      id,
      { status: 'aprovado' },
      {
        type: 'aprovado',
        author: 'Cliente',
        message: 'Post aprovado pelo cliente.',
        date: new Date().toISOString(),
      }
    )
    showToast('Post aprovado!')
  }, [updatePost, showToast])

  const rejectPost = useCallback((id, feedback) => {
    updatePost(
      id,
      { status: 'reprovado', clientFeedback: feedback },
      {
        type: 'reprovado',
        author: 'Cliente',
        message: feedback,
        date: new Date().toISOString(),
      }
    )
    showToast('Post reprovado — agência foi notificada', 'warning')
  }, [updatePost, showToast])

  const requestAdjustment = useCallback((id, feedback) => {
    updatePost(
      id,
      { clientFeedback: feedback },
      {
        type: 'ajuste',
        author: 'Cliente',
        message: 'Pedido de ajuste: ' + feedback,
        date: new Date().toISOString(),
      }
    )
    showToast('Pedido de ajuste enviado', 'info')
  }, [updatePost, showToast])

  const approveAllPending = useCallback(() => {
    setState((s) => ({
      ...s,
      calendarPosts: s.calendarPosts.map((p) =>
        p.id.startsWith('post-') && p.status === 'aguardando'
          ? {
              ...p,
              status: 'aprovado',
              history: [
                ...p.history,
                {
                  type: 'aprovado',
                  author: 'Cliente',
                  message: 'Aprovado em lote.',
                  date: new Date().toISOString(),
                },
              ],
            }
          : p
      ),
    }))
    showToast('Todos os posts pendentes foram aprovados')
  }, [showToast])

  const resetData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setState(initialSeed)
    showToast('Dados restaurados ao padrão', 'info')
  }, [showToast])

  const selectedClient = useMemo(
    () => state.clients.find((c) => c.id === state.selectedClientId) || state.clients[0],
    [state.clients, state.selectedClientId]
  )

  const value = {
    ...state,
    selectedClient,
    setSelectedClientId,
    toasts,
    showToast,
    dismissToast,
    addActionPlan,
    updateActionPlan,
    deleteActionPlan,
    addMeeting,
    requestMeeting,
    addDocument,
    deleteDocument,
    updatePost,
    approvePost,
    rejectPost,
    requestAdjustment,
    approveAllPending,
    resetData,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
