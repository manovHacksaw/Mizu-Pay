"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const providers = [
  { name: "AMEX", percentage: 100, bar: 100 },
  { name: "HSBC", percentage: 59.37, bar: 85 },
  { name: "Bank of America", percentage: 68.75, bar: 78 },
  { name: "Citibank", percentage: 62.51, bar: 70 },
]

export default function ProviderBreakdown() {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground">Provider Breakdown</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <span className="text-sm text-muted-foreground">Last 30 days</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Last 7 days</DropdownMenuItem>
            <DropdownMenuItem>Last 30 days</DropdownMenuItem>
            <DropdownMenuItem>Last 90 days</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-4">
        {providers.map((provider, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                {idx + 1}. {provider.name}
              </span>
              <span className="text-sm font-semibold text-foreground">{provider.percentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-teal-500 h-2 rounded-full transition-all" style={{ width: `${provider.bar}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">All Provider breakdown</p>
            <p className="text-lg font-bold text-foreground">15.62%</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
