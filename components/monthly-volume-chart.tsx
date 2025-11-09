"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function MonthlyVolumeChart() {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground">Monthly Volume</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <span className="text-sm text-muted-foreground">Last 7 days</span>
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
        {/* Y-axis labels */}
        <div className="flex items-end gap-2 h-64">
          <div className="flex flex-col justify-between h-full text-xs text-muted-foreground font-medium">
            <span>$ 80K</span>
            <span>$ 60K</span>
            <span>$ 40K</span>
            <span>$ 20K</span>
            <span>$ 0K</span>
          </div>

          {/* Chart */}
          <div className="flex-1 flex items-end gap-3 justify-around pb-0 h-full relative">
            <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
              {/* Grid lines */}
              <line
                x1="0"
                y1="0%"
                x2="100%"
                y2="0%"
                stroke="#e5e7eb"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="0"
                y1="25%"
                x2="100%"
                y2="25%"
                stroke="#e5e7eb"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="0"
                y1="50%"
                x2="100%"
                y2="50%"
                stroke="#e5e7eb"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1="0"
                y1="75%"
                x2="100%"
                y2="75%"
                stroke="#e5e7eb"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* Data line */}
            <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
              <polyline
                points="5%,40% 15%,35% 25%,38% 35%,32% 45%,28% 55%,25% 65%,30% 75%,35% 85%,38% 95%,45%"
                fill="none"
                stroke="#4F46E5"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
              <polyline
                points="5%,50% 15%,48% 25%,52% 35%,45% 45%,42% 55%,40% 65%,48% 75%,55% 85%,58% 95%,62%"
                fill="none"
                stroke="#14B8A6"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* Bars for spacing */}
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex-1 h-0"></div>
            ))}
          </div>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-around text-xs text-muted-foreground font-medium pl-10">
          <span>19 Oct</span>
          <span>25 Oct</span>
          <span>2 Nov</span>
          <span>9 Nov</span>
          <span>9 Nov</span>
          <span>9 Nov</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-8 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-primary rounded-full"></div>
          <span className="text-sm text-muted-foreground">Credit Debit Card: $12,378.20</span>
          <span className="text-sm text-green-500 font-semibold">↑ 46.0%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-teal-500 rounded-full"></div>
          <span className="text-sm text-muted-foreground">Bank Amount: $5,788.21</span>
          <span className="text-sm text-red-500 font-semibold">↓ 12.5%</span>
        </div>
      </div>
    </Card>
  )
}
