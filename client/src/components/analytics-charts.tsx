import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const engagementData = [
  { day: "Mon", replies: 12, likes: 8 },
  { day: "Tue", replies: 19, likes: 15 },
  { day: "Wed", replies: 13, likes: 10 },
  { day: "Thu", replies: 15, likes: 18 },
  { day: "Fri", replies: 22, likes: 20 },
  { day: "Sat", replies: 18, likes: 14 },
  { day: "Sun", replies: 25, likes: 22 }
];

const proxyData = [
  { name: "Active", value: 24, color: "hsl(142, 76%, 36%)" },
  { name: "Rotating", value: 4, color: "hsl(32, 98%, 50%)" },
  { name: "Failed", value: 2, color: "hsl(0, 84%, 60%)" }
];

export default function AnalyticsCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Engagement Metrics</h3>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="day" className="text-gray-600 dark:text-gray-400" />
              <YAxis className="text-gray-600 dark:text-gray-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px"
                }}
              />
              <Legend />
              <Bar dataKey="replies" fill="hsl(207, 90%, 54%)" name="Replies" />
              <Bar dataKey="likes" fill="hsl(142, 76%, 36%)" name="Likes Received" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Proxy Performance</h3>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={proxyData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {proxyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--background)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px"
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
