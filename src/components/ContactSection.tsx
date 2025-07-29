import { Mail, Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const ContactSection = () => {
  return (
    <section id="contact" className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-card-foreground mb-4">
              Need Help? We're Here for You
            </h2>
            <p className="text-xl text-muted-foreground">
              Professional support from truckers who understand your business
            </p>
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
                    <p className="text-muted-foreground">1-800-TRUCKER (878-2537)</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Clock className="h-6 w-6 text-primary mr-4 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-card-foreground">Support Hours</p>
                    <p className="text-muted-foreground">Mon-Fri: 6AM-8PM EST</p>
                    <p className="text-muted-foreground">Sat-Sun: 8AM-6PM EST</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="h-6 w-6 text-primary mr-4 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-card-foreground">Headquarters</p>
                    <p className="text-muted-foreground">Atlanta, GA</p>
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
                  Send Message
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