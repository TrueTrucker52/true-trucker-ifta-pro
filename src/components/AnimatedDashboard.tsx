import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Truck, Receipt, DollarSign, MapPin, Fuel, Clock } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";

export const AnimatedDashboard = () => {
  const dashboardData = {
    totalMiles: 15420,
    fuelPurchases: 24,
    taxesOwed: 1847.32,
    quarterProgress: 67,
    recentTrips: [
      { from: "Denver, CO", to: "Kansas City, MO", miles: 387, date: "Today" },
      { from: "Kansas City, MO", to: "Chicago, IL", miles: 426, date: "Yesterday" },
      { from: "Chicago, IL", to: "Detroit, MI", miles: 284, date: "2 days ago" }
    ]
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Q4 2024 IFTA Summary</p>
        </div>
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        >
          <Truck className="h-8 w-8 text-primary" />
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            title: "Total Miles", 
            value: dashboardData.totalMiles, 
            icon: MapPin, 
            color: "text-blue-500",
            delay: 0
          },
          { 
            title: "Fuel Purchases", 
            value: dashboardData.fuelPurchases, 
            icon: Fuel, 
            color: "text-green-500",
            delay: 0.1
          },
          { 
            title: "Taxes Owed", 
            value: dashboardData.taxesOwed, 
            prefix: "$",
            icon: DollarSign, 
            color: "text-yellow-500",
            delay: 0.2
          },
          { 
            title: "Quarter Progress", 
            value: dashboardData.quarterProgress, 
            suffix: "%",
            icon: TrendingUp, 
            color: "text-purple-500",
            delay: 0.3
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: stat.delay }}
            whileHover={{ scale: 1.05 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: stat.delay }}
                >
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </motion.div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.prefix}
                  <AnimatedCounter value={stat.value} duration={1.5} />
                  {stat.suffix}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quarter Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Quarter Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Days completed</span>
                <span>{dashboardData.quarterProgress}%</span>
              </div>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, delay: 0.6 }}
                style={{ transformOrigin: "left" }}
              >
                <Progress value={dashboardData.quarterProgress} className="h-2" />
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Trips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="h-5 w-5 mr-2" />
              Recent Trips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentTrips.map((trip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{trip.from}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium">{trip.to}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{trip.date}</div>
                  </div>
                  <Badge variant="secondary">
                    {trip.miles} miles
                  </Badge>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { icon: MapPin, label: "Log Trip", color: "bg-blue-500" },
          { icon: Receipt, label: "Scan Receipt", color: "bg-green-500" },
          { icon: TrendingUp, label: "View Reports", color: "bg-purple-500" },
          { icon: DollarSign, label: "Calculate Tax", color: "bg-yellow-500" }
        ].map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-all"
          >
            <motion.div
              whileHover={{ rotate: 5 }}
              className={`${action.color} p-3 rounded-lg mx-auto mb-2 w-fit`}
            >
              <action.icon className="h-6 w-6 text-white" />
            </motion.div>
            <div className="text-sm font-medium">{action.label}</div>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};