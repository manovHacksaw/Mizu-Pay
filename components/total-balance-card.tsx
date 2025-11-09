import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Send, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function TotalBalanceCard() {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
          <h2 className="text-3xl font-bold text-foreground">
            $ 320,845.20
            <span className="text-lg text-green-500 ml-2">↑ 15.8%</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button className="gap-2 bg-primary hover:bg-primary/90">
            <span>+ Add Payment</span>
          </Button>
          <Button variant="outline" size="icon" className="gap-2 bg-transparent">
            <Send className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Option 1</DropdownMenuItem>
              <DropdownMenuItem>Option 2</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  )
}
