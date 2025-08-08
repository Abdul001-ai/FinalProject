import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type StatCardProps = {
  title: string
  value: string
  change: string
  changeType: 'increase' | 'decrease'
  description: string
  trend: string
}

const StatCard = ({ title, value, change, changeType, description, trend }: StatCardProps) => (
  <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-gray-900">
    <div className="flex items-start justify-between">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
      <span className="rounded-full border px-2.5 py-1 text-xs font-medium text-foreground/80 bg-muted/40">
        {change}
      </span>
    </div>
    <h3 className="mt-2 text-3xl font-bold tracking-tight">{value}</h3>
    <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{trend}</p>
    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
  </div>
)

const RecentSales = () => (
  <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-gray-900">
    <div className="mb-6 flex items-center justify-between">
      <h3 className="text-lg font-semibold">Recent Sales</h3>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View All</DropdownMenuItem>
          <DropdownMenuItem>Export</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div className="space-y-6">
      {[
        { name: 'Olivia Martin', email: 'olivia.martin@email.com', amount: '$1,999.00' },
        { name: 'Jackson Lee', email: 'jackson.lee@email.com', amount: '$1,499.00' },
        { name: 'Isabella Nguyen', email: 'isabella.nguyen@email.com', amount: '$1,199.00' },
        { name: 'William Kim', email: 'will@email.com', amount: '$999.00' },
        { name: 'Sofia Davis', email: 'sofia.davis@email.com', amount: '$599.00' },
      ].map((sale, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {sale.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{sale.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{sale.email}</p>
            </div>
          </div>
          <div className="font-medium text-gray-900 dark:text-gray-100">{sale.amount}</div>
        </div>
      ))}
    </div>
  </div>
)

const ChartPlaceholder = () => (
  <div className="relative h-[300px] w-full">
    <div className="relative z-10 flex h-full flex-col justify-between p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Total for the last 3 months</h3>
          <p className="text-lg font-semibold">Bar Chart - Interactive</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Desktop</div>
            <div className="text-xl font-semibold">24,828</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Mobile</div>
            <div className="text-xl font-semibold">25,010</div>
          </div>
        </div>
      </div>
      <div className="flex h-48 items-end gap-1 rounded-xl border bg-gradient-to-b from-primary/10 to-transparent p-3">
        {[40, 90, 70, 110, 80, 140, 100, 160, 120, 180, 130, 200].map((h, i) => (
          <div key={i} className="relative flex-1">
            <div className="w-full rounded-md bg-primary/80" style={{ height: `${h}px` }} />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">
              {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

const AreaChartPlaceholder = () => (
  <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-gray-900">
    <h3 className="text-sm font-medium text-muted-foreground">Area Chart - Stacked</h3>
    <p className="text-lg font-semibold">Showing total visitors for the last 6 months</p>
    <div className="mt-6 h-[220px] rounded-xl bg-gradient-to-b from-primary/15 to-transparent" />
    <p className="mt-4 text-sm text-muted-foreground">Trending up by 5.2% this month</p>
  </div>
)

const DonutChartPlaceholder = () => (
  <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-gray-900">
    <h3 className="text-sm font-medium text-muted-foreground">Pie Chart - Donut with Text</h3>
    <p className="text-lg font-semibold">Browser distribution</p>
    <div className="mt-6 grid place-items-center">
      <div className="relative h-48 w-48 rounded-full bg-[conic-gradient(var(--tw-gradient-from)_0_40%,#e5e7eb_40_100%)] from-primary/80">
        <div className="absolute inset-4 rounded-full bg-white dark:bg-gray-900 grid place-items-center">
          <div className="text-center">
            <div className="text-2xl font-bold">1,125</div>
            <div className="text-xs text-muted-foreground">Total Visitors</div>
          </div>
        </div>
      </div>
    </div>
    <p className="mt-4 text-sm text-muted-foreground">Chrome leads with 24.4%</p>
    <p className="text-xs text-muted-foreground">Based on data from January – June 2024</p>
  </div>
)

export default function Page() {
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Hi, Welcome back 👋</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <span>Last 30 days</span>
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </Button>
          <Button>Download</Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="$1,250.00"
          change="+12.5%"
          changeType="increase"
          description="Visitors for the last 6 months"
          trend="Trending up this month"
        />
        <StatCard
          title="New Customers"
          value="1,234"
          change="-20%"
          changeType="decrease"
          description="Down 20% this period"
          trend="Acquisition needs attention"
        />
        <StatCard
          title="Active Accounts"
          value="45,678"
          change="+12.5%"
          changeType="increase"
          description="Strong user retention"
          trend="Engagement exceed targets"
        />
        <StatCard
          title="Growth Rate"
          value="4.5%"
          change="+4.5%"
          changeType="increase"
          description="Steady performance increase"
          trend="Meets growth projections"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="rounded-2xl border bg-white p-6 shadow-sm md:col-span-4 dark:bg-gray-900">
          <ChartPlaceholder />
          <div className="mt-6 flex items-center justify-between text-sm">
            <div className="flex items-center">
              <div className="mr-2 h-3 w-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-500 dark:text-gray-400">Desktop 24,828</span>
            </div>
            <div className="flex items-center">
              <div className="mr-2 h-3 w-3 rounded-full bg-blue-300"></div>
              <span className="text-gray-500 dark:text-gray-400">Mobile 25,010</span>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3">
          <RecentSales />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="md:col-span-4">
          <AreaChartPlaceholder />
        </div>
        <div className="md:col-span-3">
          <DonutChartPlaceholder />
        </div>
      </div>
    </div>
  )
}
