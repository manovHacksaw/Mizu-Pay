"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const transactions = [
  {
    id: 1,
    amount: "$4,242.00",
    fee: "0.50",
    merchant: "52 - Zoyain Trading",
    customer: "janedon@gmail.com",
    provider: "Amex",
    date: "02/31/24, 11:58 AM",
    status: "Succeeded",
  },
  {
    id: 2,
    amount: "$106.00",
    fee: "0.50",
    merchant: "32 - Paul Trading",
    customer: "dolereu@gmail.com",
    provider: "HSBC",
    date: "02/31/24, 11:58 AM",
    status: "Pending",
  },
  {
    id: 3,
    amount: "$328.00",
    fee: "0.50",
    merchant: "32 - Paul Trading",
    customer: "tanya@gmail.com",
    provider: "Bank of America",
    date: "02/31/24, 11:58 AM",
    status: "Succeeded",
  },
  {
    id: 4,
    amount: "$871.32",
    fee: "0.50",
    merchant: "32 - Paul Trading",
    customer: "michael@example.com",
    provider: "Chiese",
    date: "02/31/24, 11:58 AM",
    status: "Succeeded",
  },
  {
    id: 5,
    amount: "$192.00",
    fee: "0.50",
    merchant: "32 - Paul Trading",
    customer: "curtis@example.com",
    provider: "Amex",
    date: "02/31/24, 11:58 AM",
    status: "Pending",
  },
  {
    id: 6,
    amount: "$268.00",
    fee: "0.50",
    merchant: "32 - Paul Trading",
    customer: "mila@example.com",
    provider: "HSBC",
    date: "02/31/24, 11:58 AM",
    status: "Pending",
  },
  {
    id: 7,
    amount: "$567.00",
    fee: "0.50",
    merchant: "32 - Paul Trading",
    customer: "felicia@example.com",
    provider: "Chiese",
    date: "02/31/24, 11:58 AM",
    status: "Pending",
  },
  {
    id: 8,
    amount: "$994.00",
    fee: "0.50",
    merchant: "32 - Paul Trading",
    customer: "rivera@example.com",
    provider: "Bank of America",
    date: "02/31/24, 11:58 AM",
    status: "Succeeded",
  },
  {
    id: 9,
    amount: "$113.19",
    fee: "0.50",
    merchant: "32 - Paul Trading",
    customer: "nathan@example.com",
    provider: "Citibank",
    date: "02/31/24, 11:58 AM",
    status: "Succeeded",
  },
  {
    id: 10,
    amount: "$186.13",
    fee: "0.50",
    merchant: "32 - Paul Trading",
    customer: "debra@example.com",
    provider: "Amex",
    date: "02/31/24, 11:58 AM",
    status: "Succeeded",
  },
]

const StatusBadge = ({ status }: { status: string }) => {
  const colors = {
    Succeeded: "bg-teal-100 text-teal-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Failed: "bg-red-100 text-red-700",
  }
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded ${colors[status as keyof typeof colors]}`}>{status}</span>
  )
}

const ProviderIcon = ({ provider }: { provider: string }) => {
  const colors: any = {
    Amex: { bg: "bg-blue-100", text: "text-blue-600", logo: "⬜" },
    HSBC: { bg: "bg-red-100", text: "text-red-600", logo: "🔴" },
    "Bank of America": { bg: "bg-purple-100", text: "text-purple-600", logo: "🔷" },
    Chiese: { bg: "bg-blue-100", text: "text-blue-600", logo: "⭕" },
    Citibank: { bg: "bg-green-100", text: "text-green-600", logo: "🏦" },
  }
  const color = colors[provider] || colors["Amex"]
  return (
    <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${color.bg} ${color.text}`}>
      {color.logo}
    </div>
  )
}

export default function TransactionOverview() {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground">Transaction Overview</h3>
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

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground">
                <Checkbox />
              </th>
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground">AMOUNT</th>
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground">TOTAL FEE</th>
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground">MERCHANT</th>
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground">CUSTOMER</th>
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground">PROVIDER</th>
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground">DATE</th>
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground">STATUS</th>
              <th className="text-left py-3 px-3 font-semibold text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-b border-border hover:bg-muted/50">
                <td className="py-3 px-3">
                  <Checkbox />
                </td>
                <td className="py-3 px-3 font-medium text-foreground">{tx.amount}</td>
                <td className="py-3 px-3 text-muted-foreground">₹ {tx.fee}</td>
                <td className="py-3 px-3 text-muted-foreground">{tx.merchant}</td>
                <td className="py-3 px-3 text-muted-foreground text-xs">{tx.customer}</td>
                <td className="py-3 px-3">
                  <ProviderIcon provider={tx.provider} />
                </td>
                <td className="py-3 px-3 text-muted-foreground text-xs">{tx.date}</td>
                <td className="py-3 px-3">
                  <StatusBadge status={tx.status} />
                </td>
                <td className="py-3 px-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Export</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
        <span className="text-sm text-muted-foreground">919 results</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </Card>
  )
}
