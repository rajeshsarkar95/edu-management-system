'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  ClipboardList, Bell, MessageSquare, LogIn,
  FileText, CreditCard, Calendar, LibraryBig,
  Bus, Trophy, Settings, LogOut, ChevronDown,
  Wallet, Receipt, TrendingUp, BarChart3,
  Sparkles
} from 'lucide-react'

type NavItem = {
  href: string
  icon: any
  label: string
  badge?: string
  premium?: boolean
  children?: { href: string; label: string; premium?: boolean }[]
}

const NAV: { label: string; items: NavItem[] }[] = [
  {label:'MAIN', items:[
    { href:'/dashboard',icon:LayoutDashboard,label:'Dashboard'},
  ]},
  { label: 'PEOPLE', items: [
    { href: '/students',   icon: Users,           label: 'Students',      badge: '248' },
    { href: '/teachers',   icon: GraduationCap,   label: 'Teachers' },
  ]},
  { label: 'ACADEMICS', items: [
    { href: '/classes',    icon: BookOpen,         label: 'Classes & Subjects' },
    { href: '/timetable',  icon: Calendar,         label: 'Timetable' },
    {
      href: '/exams', icon: Trophy, label: 'Exams & Results',
      children: [
        {href: '/exams/',label: 'Exams'},
        { href: '/exams/schedule', label: 'Exam Schedule' },
        { href: '/exams/results',  label: 'Results' },
        { href: '/exams/analytics', label: 'Result Analytics', premium: true },
      ]
    },
  ]},
  { label: 'OPERATIONS', items: [
    { href: '/attendance', icon: ClipboardList,    label: 'Attendance' },
    {
      href: '/fees', icon: CreditCard, label: 'Fee Management',
      children: [
        {href: '/fees/',label:'Fees'},
        { href: '/fees/structure',label:'Fee Structure' },
        { href: '/fees/collect',label:'Collect Fee' },
        { href: '/fees/advance',label:'Advance Fee' },
        { href: '/fees/dues',label:'Due & Defaulters' },
        { href: '/fees/reports',label:'Fee Reports', premium: true },
      ]
    },
    { href: '/library',    icon: LibraryBig,       label: 'Library' },
    { href: '/transport',  icon: Bus,              label: 'Transport' },
  ]},
  { label: 'COMMUNICATION', items: [
    { href: '/notices',    icon: Bell,             label: 'Notices',       badge: '4' },
    { href: '/sms',        icon: MessageSquare,    label: 'SMS System' },
  ]},
  { label: 'INSIGHTS', items: [
    { href: '/analytics',  icon: BarChart3,        label: 'Advanced Analytics', premium: true },
    { href: '/reports',    icon: TrendingUp,       label: 'Custom Reports',     premium: true },
  ]},
  { label: 'PROMOTIONS', items:[
    { href: '/studentprom',icon:Users,label:'Student Promotions'},
    { href: '/teacharprom',icon:Users,label:'Teacher Promotions'}, 
  ]},
  {label:'CERTIFICATES', items:[
    {href: '/certificateform', icon: FileText, label:'Certificates' },
  ]}
]
function PremiumBadge() {
  return (
    <span className="nav-pro-badge">
      <Sparkles size={10} />
      PRO
    </span>
  )
}
export default function Sidebar(){
  const path = usePathname()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  useEffect(() => {
    const toOpen: Record<string, boolean> = {}
    NAV.forEach(section => {
      section.items.forEach(item => {
        if (item.children?.some(c => path === c.href || path.startsWith(c.href + '/'))) {
          toOpen[item.href] = true
        }
      })
    })
    if (Object.keys(toOpen).length) {
      setOpenSections(prev => ({ ...prev, ...toOpen }))
    }
  }, [path])
  const toggleSection = (href: string) => {
    setOpenSections(prev => ({ ...prev, [href]: !prev[href] }))
  }
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🏫</div>
        <div className="logo-text">
          <h2>EduManage</h2>
          <span>School Management</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV.map(section => (
          <div key={section.label}>
            <div className="nav-section-label">{section.label}</div>
            {section.items.map(item => {
              const Icon = item.icon
              const hasChildren = !!item.children?.length
              const childActive = item.children?.some(
                c => path === c.href || path.startsWith(c.href + '/')
              )
              const active = path === item.href || childActive
              const isOpen = !!openSections[item.href]

              if (hasChildren) {
                return (
                  <div key={item.href} className="nav-group">
                    <button
                      type="button"
                      onClick={() => toggleSection(item.href)}
                      className={`nav-link nav-link-btn${active ? ' active' : ''}`}
                      aria-expanded={isOpen}
                    >
                      <Icon className="nav-icon" />
                      <span className="nav-label-text">{item.label}</span>
                      {item.premium && <PremiumBadge />}
                      {item.badge && <span className="nav-badge">{item.badge}</span>}
                      <ChevronDown
                        className="nav-chevron"
                        size={16}
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.18s ease',
                          marginLeft: 'auto'
                        }}
                      />
                    </button>

                    <div
                      className="nav-submenu"
                      style={{
                        maxHeight: isOpen ? item.children!.length * 40 + 8 : 0,
                        overflow: 'hidden',
                        transition: 'max-height 0.2s ease'
                      }}
                    >
                      {item.children!.map(child => {
                        const childIsActive = path === child.href
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`nav-sublink${childIsActive ? ' active' : ''}`}
                          >
                            <span className="nav-subdot" />
                            {child.label}
                            {child.premium && <PremiumBadge />}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link${active ? ' active' : ''}`}
                >
                  <Icon className="nav-icon" />
                  <span className="nav-label-text">{item.label}</span>
                  {item.premium && <PremiumBadge />}
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </Link>
              )
            })}
          </div>
        ))}
        <div style={{ height: 16 }} />
        <Link href="/settings" className="nav-link">
          <Settings className="nav-icon" /> Settings
        </Link>
        <Link href="/login" className="nav-link" style={{ color: '#f87171' }}>
          <LogOut className="nav-icon" /> Logout
        </Link>
      </nav>
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">A</div>
          <div className="user-info">
            <h4>Admin User</h4>
            <p>Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  )
}