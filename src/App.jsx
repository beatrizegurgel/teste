import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './store/AppContext'
import { Layout } from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import MarketingPlan from './pages/MarketingPlan'
import ActionPlans from './pages/ActionPlans'
import MonthlyResults from './pages/MonthlyResults'
import Campaigns from './pages/Campaigns'
import Meetings from './pages/Meetings'
import Documents from './pages/Documents'
import ContentCalendar from './pages/ContentCalendar'

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/plano" element={<MarketingPlan />} />
          <Route path="/planos-acao" element={<ActionPlans />} />
          <Route path="/resultados" element={<MonthlyResults />} />
          <Route path="/campanhas" element={<Campaigns />} />
          <Route path="/reunioes" element={<Meetings />} />
          <Route path="/documentos" element={<Documents />} />
          <Route path="/calendario" element={<ContentCalendar />} />
        </Route>
      </Routes>
    </AppProvider>
  )
}
