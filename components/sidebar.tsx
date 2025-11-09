"use client"

import { useState } from "react"
import { BarChart3, Users, CreditCard, Settings, HelpCircle, Lock, Zap, Wallet } from "lucide-react"
import Logo from "./logo"
import { cn } from "@/lib/utils"

const menuItems = [{ id: "dashboard", label: "Dashboard", icon: BarChart3 }]

const managementItems = [
  { id: "merchant", label: "Merchant", icon: CreditCard },
  { id: "users", label: "Users", icon: Users },
  { id: "settlements", label: "Settlements", icon: Wallet },
  { id: "payouts", label: "Payouts", icon: Zap },
]

const adminItems = [
  { id: "cache", label: "Cache", icon: Lock },
  { id: "staff", label: "Staff", icon: Users },
  { id: "roles", label: "Roles & Permissions", icon: Lock },
]

const settingsItems = [
  { id: "settings", label: "Settings", icon: Settings },
  { id: "support", label: "Help & Support", icon: HelpCircle },
]

export default function Sidebar() {
  const [active, setActive] = useState("dashboard")

  const MenuItem = ({ item, isActive }: any) => (
    <button
      onClick={() => setActive(item.id)}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors rounded-lg",
        isActive ? "bg-primary text-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent",
      )}
    >
      <item.icon className="w-5 h-5" />
      <span className="text-sm font-medium">{item.label}</span>
    </button>
  )

  return (
    <div className="w-56 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto space-y-6 p-4">
        {/* Main Menu */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <MenuItem key={item.id} item={item} isActive={active === item.id} />
          ))}
        </div>

        {/* Management */}
        <div>
          <p className="px-4 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wide">
            Management
          </p>
          <div className="space-y-2">
            {managementItems.map((item) => (
              <MenuItem key={item.id} item={item} isActive={active === item.id} />
            ))}
          </div>
        </div>

        {/* Admin */}
        <div>
          <p className="px-4 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wide">Admin</p>
          <div className="space-y-2">
            {adminItems.map((item) => (
              <MenuItem key={item.id} item={item} isActive={active === item.id} />
            ))}
          </div>
        </div>

        {/* Settings */}
        <div>
          <p className="px-4 py-2 text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wide">Settings</p>
          <div className="space-y-2">
            {settingsItems.map((item) => (
              <MenuItem key={item.id} item={item} isActive={active === item.id} />
            ))}
          </div>
        </div>
      </nav>

      {/* Premium Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="bg-sidebar-accent rounded-lg p-3 space-y-2 text-center">
          <div className="text-lg">✨</div>
          <h3 className="text-sm font-semibold text-sidebar-foreground">Premium +</h3>
          <p className="text-xs text-sidebar-foreground/70">Get started right now</p>
          <button className="w-full bg-primary text-primary-foreground rounded-lg py-2 text-xs font-semibold hover:opacity-90 transition">
            Upgrade Now →
          </button>
        </div>
      </div>
    </div>
  )
}
