import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Transfer from './pages/Transfer'
import Withdraw from './pages/Withdraw'
import Deposit from './pages/Deposit'
import Settings from './pages/Settings'
import LoginActivity from './pages/LoginActivity'
import Goals from './pages/Goals'
import BillPay from './pages/BillPay'
import Cards from './pages/Cards'
import Statements from './pages/Statements'
import CheckDeposit from './pages/CheckDeposit'
import Loans from './pages/Loans'
import WireTransfer from './pages/WireTransfer'
import Zelle from './pages/Zelle'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import NotFound from './pages/NotFound'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'

// Marketing / public pages
import BankHub from './pages/bank/BankHub'
import BorrowHub from './pages/borrow/BorrowHub'
import GrowHub from './pages/grow/GrowHub'
import PlanHub from './pages/plan/PlanHub'
import ProtectHub from './pages/protect/ProtectHub'
import LearnHub from './pages/learn/LearnHub'
import ArticleDetail from './pages/learn/ArticleDetail'
import BusinessHub from './pages/business/BusinessHub'
import Support from './pages/support/Support'
import Contact from './pages/support/Contact'
import Locations from './pages/Locations'
import About from './pages/About'
import OpenAccount from './pages/OpenAccount'
import ApplyOnline from './pages/ApplyOnline'
import Careers from './pages/Careers'
import Newsroom from './pages/Newsroom'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ErrorBoundary from './components/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
    <Routes>
      {/* Core */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Personal banking hubs */}
      <Route path="/bank" element={<BankHub />} />
      <Route path="/bank/*" element={<BankHub />} />
      <Route path="/borrow" element={<BorrowHub />} />
      <Route path="/borrow/*" element={<BorrowHub />} />
      <Route path="/grow" element={<GrowHub />} />
      <Route path="/grow/*" element={<GrowHub />} />
      <Route path="/plan" element={<PlanHub />} />
      <Route path="/plan/*" element={<PlanHub />} />
      <Route path="/protect" element={<ProtectHub />} />
      <Route path="/protect/*" element={<ProtectHub />} />

      {/* Learn hub & articles */}
      <Route path="/learn" element={<LearnHub />} />
      <Route path="/learn/:slug" element={<ArticleDetail />} />

      {/* Business */}
      <Route path="/business" element={<BusinessHub />} />
      <Route path="/business/*" element={<BusinessHub />} />

      {/* Support & Company */}
      <Route path="/support" element={<Support />} />
      <Route path="/support/*" element={<Support />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/locations" element={<Locations />} />
      <Route path="/about" element={<About />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/newsroom" element={<Newsroom />} />
      <Route path="/open-account" element={<OpenAccount />} />
      <Route path="/apply" element={<ApplyOnline />} />

      {/* App (authenticated) */}
      <Route
        path="/dashboard"
        element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
      />
      <Route
        path="/transactions"
        element={<ProtectedRoute><Transactions /></ProtectedRoute>}
      />
      <Route
        path="/transactions/:accountId"
        element={<ProtectedRoute><Transactions /></ProtectedRoute>}
      />
      <Route
        path="/transfer"
        element={<ProtectedRoute><Transfer /></ProtectedRoute>}
      />
      <Route
        path="/withdraw"
        element={<ProtectedRoute><Withdraw /></ProtectedRoute>}
      />
      <Route
        path="/deposit"
        element={<ProtectedRoute><Deposit /></ProtectedRoute>}
      />
      <Route
        path="/settings"
        element={<ProtectedRoute><Settings /></ProtectedRoute>}
      />
      <Route
        path="/login-activity"
        element={<ProtectedRoute><LoginActivity /></ProtectedRoute>}
      />
      <Route
        path="/goals"
        element={<ProtectedRoute><Goals /></ProtectedRoute>}
      />
      <Route
        path="/bill-pay"
        element={<ProtectedRoute><BillPay /></ProtectedRoute>}
      />
      <Route
        path="/cards"
        element={<ProtectedRoute><Cards /></ProtectedRoute>}
      />
      <Route
        path="/statements"
        element={<ProtectedRoute><Statements /></ProtectedRoute>}
      />
      <Route
        path="/check-deposit"
        element={<ProtectedRoute><CheckDeposit /></ProtectedRoute>}
      />
      <Route
        path="/loans"
        element={<ProtectedRoute><Loans /></ProtectedRoute>}
      />
      <Route
        path="/wire-transfer"
        element={<ProtectedRoute><WireTransfer /></ProtectedRoute>}
      />
      <Route
        path="/zelle"
        element={<ProtectedRoute><Zelle /></ProtectedRoute>}
      />
      <Route
        path="/admin"
        element={<AdminRoute><AdminDashboard /></AdminRoute>}
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
    </ErrorBoundary>
  )
}
