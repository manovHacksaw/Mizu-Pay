"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function PaymentTypesChart() {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground">Payment Types</h3>
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

      <div className="flex flex-col items-center justify-center gap-8">
        {/* Donut Chart */}
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
            {/* AMEX - Blue */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#4F46E5"
              strokeWidth="24"
              strokeDasharray="143 502"
              strokeLinecap="round"
            />
            {/* HSBC - Teal */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#14B8A6"
              strokeWidth="24"
              strokeDasharray="101 502"
              strokeDashoffset="-143"
              strokeLinecap="round"
            />
            {/* Others - Gray */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="24"
              strokeDasharray="258 502"
              strokeDashoffset="-244"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">2.87K</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-8 w-full">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-xs font-semibold text-muted-foreground">AMEX</span>
            </div>
            <div className="text-lg font-bold text-foreground">40%</div>
            <div className="text-xs text-muted-foreground">80K</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-teal-500"></div>
              <span className="text-xs font-semibold text-muted-foreground">HSBC</span>
            </div>
            <div className="text-lg font-bold text-foreground">32%</div>
            <div className="text-xs text-muted-foreground">62K</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="text-xs font-semibold text-muted-foreground">Others</span>
            </div>
            <div className="text-lg font-bold text-foreground">28%</div>
            <div className="text-xs text-muted-foreground">48K</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
