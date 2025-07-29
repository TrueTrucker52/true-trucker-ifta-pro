import { Star, Shield, Users, Award } from "lucide-react";
import { motion } from "framer-motion";

const TrustBuilders = () => {
  const testimonials = [
    {
      name: "Mike Johnson",
      company: "Johnson Transport LLC",
      text: "This app saved me 15+ hours per quarter. IFTA filing used to be a nightmare, now it's automatic.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face&auto=format"
    },
    {
      name: "Sarah Rodriguez",
      company: "Rodriguez Logistics",
      text: "Incredibly accurate calculations. The receipt scanner is a game-changer for my fleet.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b332c1ae?w=60&h=60&fit=crop&crop=face&auto=format"
    },
    {
      name: "Tom Wilson",
      company: "Independent Owner-Operator",
      text: "Best $25/month I spend. Pays for itself in time saved and audit protection.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face&auto=format"
    }
  ];

  const certifications = [
    { icon: Shield, text: "IRS Compliant" },
    { icon: Award, text: "DOT Approved" },
    { icon: Users, text: "10K+ Users" }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Trust Stats */}
        <div className="text-center mb-12">
          <motion.div 
            className="flex flex-wrap justify-center items-center gap-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-2">
                <cert.icon className="h-6 w-6 text-primary" />
                <span className="font-semibold text-foreground">{cert.text}</span>
              </div>
            ))}
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Trusted by Professional Truckers Nationwide
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands who've simplified their IFTA compliance
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-card p-6 rounded-xl shadow-lg border"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              {/* Stars */}
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              {/* Quote */}
              <p className="text-card-foreground mb-6 italic">
                "{testimonial.text}"
              </p>
              
              {/* Author */}
              <div className="flex items-center">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full mr-4"
                  loading="lazy"
                />
                <div>
                  <p className="font-semibold text-card-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Company Logos */}
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-muted-foreground mb-8">As featured in:</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="bg-muted px-6 py-3 rounded text-sm font-semibold">Fleet Owner Magazine</div>
            <div className="bg-muted px-6 py-3 rounded text-sm font-semibold">Trucking News</div>
            <div className="bg-muted px-6 py-3 rounded text-sm font-semibold">Owner-Operator Today</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustBuilders;