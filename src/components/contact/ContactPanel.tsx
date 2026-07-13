"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Mail, Phone, Send, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ContactPanel() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    // Simulate API Call
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitStatus("success");
      toast.success("Message sent successfully!");
      formRef.current?.reset();
      
      // Scroll to success message on mobile
      if (window.innerWidth < 768) {
        successRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch {
      setSubmitStatus("error");
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-reset success state after 5 seconds
  useEffect(() => {
    if (submitStatus === "success") {
      const timer = setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  return (
    <section className="pb-20">
      <div className="container-custom">
        <div className="glass-surface rounded-3xl overflow-hidden border border-border/40 shadow-premium">
          <div className="grid lg:grid-cols-[1fr,1.4fr]">
            
            {/* Left Panel: Info & Trust */}
            <div className="relative min-h-[400px] lg:min-h-full overflow-hidden flex flex-col justify-end p-8 md:p-12">
              <Image
                src="/images/DealBanner.jpg"
                alt="Support"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
              />
              {/* Theme-aware Readability Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-background via-background/85 to-transparent dark:from-background dark:via-background/75 dark:to-transparent" />
              
              <div className="relative z-10 space-y-8">
                <div className="space-y-3">
                  <Badge className="bg-primary text-primary-foreground border-none px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-md">
                    Connect With Us
                  </Badge>
                  <h2 className="text-3xl font-bold tracking-tight">Support within your reach</h2>
                  <p className="text-muted-foreground max-w-sm">
                    Our dedicated clinical and technical teams are ready to assist you around the clock.
                  </p>
                </div>

                <div className="space-y-6">
                  <ContactItem 
                    icon={<MapPin className="h-5 w-5" />} 
                    title="Visit Us" 
                    content="123 Pharma Plaza, Dhaka, Bangladesh" 
                  />
                  <ContactItem 
                    icon={<Mail className="h-5 w-5" />} 
                    title="Email Us" 
                    content="support@medistore.com" 
                    link="mailto:support@medistore.com"
                  />
                  <ContactItem 
                    icon={<Phone className="h-5 w-5" />} 
                    title="Call Us" 
                    content="+880 17 0000 0000" 
                    link="tel:+8801700000000"
                    subtitle="Sun–Thu • 9AM – 6PM"
                  />
                </div>
              </div>
            </div>

            {/* Right Panel: Form */}
            <div className="p-8 md:p-12 lg:p-16 bg-card/10 dark:bg-zinc-950/20 backdrop-blur-md">
              <div ref={successRef}>
                <AnimatePresence mode="wait">
                  {submitStatus === "success" ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex flex-col items-center justify-center text-center py-12 space-y-4"
                    >
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                        <CheckCircle2 className="h-10 w-10" />
                      </div>
                      <h3 className="text-2xl font-bold">Message Received!</h3>
                      <p className="text-muted-foreground max-w-xs">
                        Thank you for reaching out. A specialist will get back to you within 24 hours.
                      </p>
                      <Button variant="outline" onClick={() => setSubmitStatus("idle")} className="mt-4">
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.form
                      ref={formRef}
                      onSubmit={handleSubmit}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid gap-6"
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input 
                            id="firstName" 
                            placeholder="e.g., Arnab" 
                            className="h-12 bg-background/40 dark:bg-black/40 border-border/40 focus-visible:ring-primary/20"
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input 
                            id="lastName" 
                            placeholder="e.g., Dey" 
                            className="h-12 bg-background/40 dark:bg-black/40 border-border/40 focus-visible:ring-primary/20"
                            required
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Work Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="arnab@example.com" 
                          className="h-12 bg-background/40 dark:bg-black/40 border-border/40 focus-visible:ring-primary/20"
                          required
                          disabled={isSubmitting}
                          aria-invalid={submitStatus === "error"}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">How can we help?</Label>
                        <Textarea 
                          id="message" 
                          placeholder="Describe your inquiry in detail..." 
                          className="min-h-[150px] bg-background/40 dark:bg-black/40 border-border/40 focus-visible:ring-primary/20 resize-none px-4 py-3"
                          required
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="pt-2">
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className={cn(
                            "w-full h-12 rounded-xl text-md font-bold transition-all duration-300",
                            "btn-primary"
                          )}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <Loader2 className="h-5 w-5 animate-spin" /> SENDING...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Send className="h-4 w-4" /> SEND INQUIRY
                            </span>
                          )}
                        </Button>
                        <p className="text-center mt-4 text-xs text-muted-foreground">
                          By clicking send, you agree to our{" "}
                          <a href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</a>
                        </p>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactItem({ icon, title, content, link, subtitle }: { 
  icon: React.ReactNode, 
  title: string, 
  content: string, 
  link?: string,
  subtitle?: string 
}) {
  return (
    <div className="flex items-start gap-4 group">
      <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">{title}</p>
        {link ? (
          <a href={link} className="text-lg font-bold text-foreground hover:text-primary transition-colors">
            {content}
          </a>
        ) : (
          <p className="text-lg font-bold text-foreground">{content}</p>
        )}
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
