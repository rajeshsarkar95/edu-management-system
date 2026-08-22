'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  ClipboardList, Bell, MessageSquare,
  FileText, CreditCard, Calendar, LibraryBig,
  Bus, Trophy, Settings, LogOut, ChevronDown,
  TrendingUp, BarChart3, Sparkles, Globe,
  UserCog,Wallet,MessageCircle
} from 'lucide-react'

const WHATSAPP_NUMBER = '94579 36663'
const WHATSAPP_MESSAGE = 'Hello, I have a query regarding EduManage.'

type NavItem = {
  href: string
  icon: any
  label: string
  badge?: string
  newBadge?: boolean
  premium?: boolean
  iconBg?: string
  children?: { href: string; label: string;premium?:boolean}[]
}

const NAV: { label: string; items: NavItem[] }[] = [
  { label:'MAIN',items:[
    { href:'/dashboard',icon:LayoutDashboard,label:'Dashboard',iconBg:'#8b6d4f'},
    { href:'/reports',icon:BarChart3,label:'Reports Hub',newBadge:true,iconBg:'#3b82f6'},
  ]},
  { label: 'PEOPLE', items:[
    { href: '/students',icon: Users,label:'Students', badge: '248', iconBg: '#2563eb'},
    { href: '/teachers',icon: GraduationCap, label: 'Teachers', iconBg: '#2563eb'},
    {
      href: '/students-admissions', icon: GraduationCap, label: 'Students & Admissions', iconBg: '#0ea5e9',
      children: [
        { href: '/students/', label: 'All Students' },
        { href: '/students/admissions', label: 'Admissions' },
      ]
    },
    {
      href: '/hr-staff', icon: UserCog, label: 'HR & Staff', iconBg: '#a855f7',
      children: [
        { href: '/teachers/', label:'Teachers'},
        { href: '/staff', label:'Non-Teaching Staff'},
      ]
    },
  ]},
  { label: 'ACADEMICS', items: [
    {
      href: '/academics-timetable', icon: BookOpen, label: 'Academics & Timetable', iconBg: '#7c3aed',
      children: [
        { href: '/classes', label: 'Classes & Subjects' },
        { href: '/timetable', label: 'Timetable' },
      ]
    },
    {
      href: '/exams', icon: Trophy, label: 'Exams & Results', iconBg: '#0891b2',
      children: [
        { href: '/exams/', label: 'Exams' },
        { href: '/exams/schedule', label: 'Exam Schedule' },
        { href: '/exams/results',  label: 'Results' },
        { href: '/exams/analytics', label: 'Result Analytics', premium: true },
      ]
    },
  ]},
  { label: 'OPERATIONS', items: [
    { href: '/attendance', icon: ClipboardList, label: 'Attendance', iconBg: '#059669' },
    {
      href: '/fees', icon: CreditCard, label: 'Fee Management', iconBg: '#16a34a',
      children: [
        { href: '/fees/', label: 'Fees' },
        { href: '/fees/structure', label: 'Fee Structure' },
        { href: '/fees/collect', label: 'Collect Fee' },
        { href: '/fees/advance', label: 'Advance Fee' },
        { href: '/fees/dues', label: 'Due & Defaulters' },
        { href: '/fees/reports', label: 'Fee Reports', premium: true },
      ]
    },
    {
      href: '/accounting-finance', icon: Wallet, label: 'Accounting & Finance', iconBg: '#0f766e',
      children: [
        { href: '/fees/reports', label: 'Fee Reports' },
        { href: '/expenses', label: 'Expenses'},
      ]
    },
    {
      href: '/school-operations', icon: Bus, label: 'School Operations', iconBg: '#9a3412',
      children: [
        { href: '/library', label: 'Library' },
        { href: '/transport', label: 'Transport' },
      ]
    },
  ]},
  { label: 'COMMUNICATION', items: [
    { href: '/notices', icon: Bell, label: 'Notices', badge: '4', iconBg: '#db2777' },
    {
      href: '/whatsapp-hub', icon: MessageSquare, label: 'WhatsApp Hub', iconBg: '#0d9488',
      children: [
        { href: '/sms', label: 'SMS System' },
        { href: '/whatsapp', label: 'WhatsApp Templates' },
      ]
    },
  ]},
  {label: 'ADMISSIONS', items: [
    {
      href: '/school-front-office', icon: Globe, label: 'School Front Office', iconBg: '#c026d3',
      children: [
        { href: '/enquiries', label: 'Enquiries' },
        { href: '/visitors', label: 'Visitors' },
      ]
    },
  ]},
  {label:'IDCARD',items:[
    {
      href:'/id-cards',icon:LibraryBig,label:'ID Card Generator',iconBg:'#f97316',
      children:[
        {href:'/idcard/generate',label:'Generate ID Card'},
        {href:'/idcard/templates',label:'ID Card Templates'},
      ]   
    },
  ]},
  { label: 'INSIGHTS', items: [
    { href: '/analytics', icon: BarChart3,   label: 'Advanced Analytics', premium: true, iconBg: '#4f46e5' },
    { href: '/reports-custom', icon: TrendingUp, label: 'Custom Reports', premium: true, iconBg: '#4f46e5' },
  ]},
  { label: 'PROMOTIONS', items: [
    { href: '/studentprom', icon: Users, label: 'Student Promotions', iconBg: '#2563eb' },
    { href: '/teacharprom', icon: Users, label: 'Teacher Promotions', iconBg: '#2563eb' },
  ]},
  { label: 'CERTIFICATES', items: [
    { href: '/certificateform', icon: FileText, label: 'Certificates', iconBg: '#b45309' },
  ]},
  { label: 'SYSTEM', items: [
    { href: '/settings', icon: Settings, label: 'System & Settings', iconBg: '#475569' },
  ]},
  {label:'EVENT',items:[
    {href:'/event',icon:Settings,label:'Events',iconBg:'475569'},
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
function NewBadge(){
  return <span className="nav-new-badge">NEW</span>
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
    <aside className="sidebar-v2">
      <div className="sidebar-v2-logo">
        <div className="logo-icon">🏫</div>
        <div className="logo-text">
          <h2>AR Public school</h2>
          <span>Public school</span>
        </div>
      </div>

      <nav className="sidebar-v2-nav">
        {NAV.map(section => (
          <div key={section.label}>
            <div className="nav-v2-section-label">{section.label}</div>
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
                  <div key={item.href} className="nav-v2-group">
                    <button
                      type="button"
                      onClick={() => toggleSection(item.href)}
                      className={`nav-v2-link nav-v2-link-btn${active ? ' active' : ''}`}
                      aria-expanded={isOpen}
                    >
                      <span className="nav-v2-icon-badge" style={{ background: item.iconBg ?? '#475569' }}>
                        <Icon size={16} />
                      </span>
                      <span className="nav-v2-label-text">{item.label}</span>
                      {item.newBadge && <NewBadge />}
                      {item.premium && <PremiumBadge />}
                      {item.badge && <span className="nav-v2-count-badge">{item.badge}</span>}
                      <ChevronDown
                        className="nav-v2-chevron"
                        size={15}
                        style={{
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.18s ease',
                          marginLeft: 'auto'
                        }}
                      />
                    </button>
                    <div
                      className="nav-v2-submenu"
                      style={{
                        maxHeight: isOpen ? item.children!.length * 38 + 8 : 0,
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
                            className={`nav-v2-sublink${childIsActive ? ' active' : ''}`}
                          >
                            <span className="nav-v2-subdot" />
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
                  className={`nav-v2-link${active ? ' active' : ''}`}
                >
                  <span className="nav-v2-icon-badge" style={{ background: item.iconBg ?? '#475569' }}>
                    <Icon size={16} />
                  </span>
                  <span className="nav-v2-label-text">{item.label}</span>
                  {item.newBadge && <NewBadge />}
                  {item.premium && <PremiumBadge />}
                  {item.badge && <span className="nav-v2-count-badge">{item.badge}</span>}
                </Link>
              )
            })}
          </div>
        ))}
        <div style={{ height: 16 }} />
        <Link href="/login" className="nav-v2-link" style={{ color: '#f87171' }}>
          <span className="nav-v2-icon-badge" style={{ background: '#7f1d1d' }}>
            <LogOut size={16} />
          </span>
          <span className="nav-v2-label-text">Logout</span>
        </Link>
      </nav>

      <div className="sidebar-v2-footer">
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-btn"
        >
          <MessageCircle size={16} />
          Chat on WhatsApp
        </a>
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