import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ContactSection = () => {
  const navigate = useNavigate();

  return (
    <section id="contact" className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-card-foreground mb-4">
              Ready to Start Your IFTA Journey?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of professional truckers managing IFTA compliance with confidence
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-4"
                onClick={() => navigate('/auth?mode=signup')}
              >
                Start Your Subscription
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-4"
                onClick={() => {
                  const pricingElement = document.getElementById('pricing');
                  if (pricingElement) {
                    pricingElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                View Pricing Plans
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold text-card-foreground mb-6">Get in Touch</h3>
              
              <div className="space-y-6">
                <div className="flex items-center">
                  <Mail className="h-6 w-6 text-primary mr-4 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-card-foreground">Email Support</p>
                    <p className="text-muted-foreground">support@truetruckerifta.com</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Phone className="h-6 w-6 text-primary mr-4 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-card-foreground">Phone Support</p>
                    <p className="text-muted-foreground">321-395-9957</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-primary mr-4 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-card-foreground">Support Hours</p>
                    <p className="text-muted-foreground">Mon-Fri: 9AM-5PM EST</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-6 w-6 text-primary mr-4 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-card-foreground">Headquarters</p>
                    <p className="text-muted-foreground">Apopka, FL</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-4 h-14"
                  onClick={() => window.open('mailto:support@truetruckerifta.com', '_blank')}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Contact Support
                </Button>
              </div>
            </motion.div>

            {/* About Us */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold text-card-foreground mb-6">Our Story</h3>
              
              <div className="space-y-4 text-muted-foreground">
                <p>
                  TrueTrucker IFTA Pro was founded by experienced truck drivers who understood 
                  the pain of IFTA compliance. After years of manual calculations and 
                  confusing paperwork, we decided to build the solution we wished existed.
                </p>
                
                <p>
                  Our team combines 50+ years of trucking experience with cutting-edge 
                  technology to deliver the most accurate and user-friendly IFTA management 
                  system available.
                </p>
                
                <p>
                  We're not just another software company - we're truckers serving truckers, 
                  and we understand the unique challenges you face on the road and in 
                  compliance management.
                </p>
              </div>

              <div className="mt-8 p-6 bg-primary/10 rounded-xl">
                <h4 className="font-bold text-card-foreground mb-2">Our Guarantee</h4>
                <p className="text-muted-foreground">
                  If our app doesn't save you at least 10 hours per quarter on IFTA 
                  compliance, we'll refund your subscription - no questions asked.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;