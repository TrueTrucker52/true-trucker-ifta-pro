import { motion } from "framer-motion";
import { AnimatedCounter } from "./AnimatedCounter";
import { TrendingUp, Clock, DollarSign, Users } from "lucide-react";

const statistics = [
  {
    icon: TrendingUp,
    value: 87,
    suffix: "%",
    label: "Accuracy Increase",
    color: "text-green-500"
  },
  {
    icon: Clock,
    value: 15,
    suffix: " hrs",
    label: "Time Saved Weekly",
    color: "text-blue-500"
  },
  {
    icon: DollarSign,
    value: 2500,
    prefix: "$",
    label: "Average Annual Savings",
    color: "text-yellow-500"
  },
  {
    icon: Users,
    value: 10000,
    suffix: "+",
    label: "Satisfied Truckers",
    color: "text-purple-500"
  }
];

export const AnimatedStatistics = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
      {statistics.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.2 }}
          className="text-center"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="mx-auto mb-3 p-3 bg-card rounded-full w-fit"
          >
            <stat.icon className={`h-8 w-8 ${stat.color}`} />
          </motion.div>
          
          <div className="text-3xl font-bold text-foreground mb-1">
            {stat.prefix && <span>{stat.prefix}</span>}
            <AnimatedCounter 
              value={stat.value} 
              duration={2 + index * 0.5}
            />
            {stat.suffix && <span>{stat.suffix}</span>}
          </div>
          
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
};