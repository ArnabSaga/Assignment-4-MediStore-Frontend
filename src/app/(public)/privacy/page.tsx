"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Bell,
  ChevronRight,
  Clock,
  Database,
  Eye,
  FileText,
  Globe,
  Info,
  Lock,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const sections = [
  {
    id: "introduction",
    title: "Introduction",
    icon: <FileText className="w-4 h-4" />,
    content: `Your privacy is foundational to the trust you place in MediStore. This Privacy Policy describes how we collect, use, and handle your personal information when you use our medical marketplace, website, and services. By using MediStore, you consent to the practices described in this policy. We are committed to protecting your sensitive medical and personal data with the highest industry standards.`,
  },
  {
    id: "data-collection",
    title: "Data We Collect",
    icon: <Database className="w-4 h-4" />,
    content: `We collect information necessary to provide you with a safe and efficient pharmacy experience.
    \n• Personal Identification: Name, email address, phone number, and shipping address.
    \n• Health Information: Valid prescriptions, medical history (where provided for pharmacist review), and allergy information.
    \n• Transaction Data: Details about the medicines and products you purchase, but never your full credit card details (which are handled by PCI-compliant processors).
    \n• Technical Data: IP addresses, browser types, and device identifiers collected through cookies and similar technologies.`,
  },
  {
    id: "data-usage",
    title: "How We Use Data",
    icon: <Eye className="w-4 h-4" />,
    content: `MediStore uses your data primarily to fulfill your medical needs:
    \n• Order Fulfillment: Processing and delivering your medicines as required by your prescriptions.
    \n• Pharmacist Verification: Allowing our licensed pharmacists to verify the safety and accuracy of your orders.
    \n• Security & Fraud Prevention: Monitoring transactions to prevent unauthorized access and pharmaceutical fraud.
    \n• Service Improvement: Analyzing anonymized data to improve our marketplace layout and inventory.`,
  },
  {
    id: "third-party-sharing",
    title: "Information Sharing",
    icon: <Users className="w-4 h-4" />,
    content: `We do not sell your personal or health data. We only share information with third parties when essential for service delivery:
    \n• Logistics Partners: Reliable couriers who deliver your orders.
    \n• Payment Processors: Secure platforms that handle your financial transactions.
    \n• Regulatory Authorities: Only when required by law to comply with pharmaceutical or medical regulations.`,
  },
  {
    id: "security",
    title: "Security & Standards",
    icon: <Lock className="w-4 h-4" />,
    content: `We implement multi-layered security protocols to safeguard your information:
    \n• End-to-End Encryption: All data transmitted to our servers is encrypted using industry-standard SSL/TLS technology.
    \n• Isolation of Health Data: Patient information and prescriptions are stored in isolated, encrypted databases with restricted access.
    \n• Compliance: We adhere to strict data protection standards relevant to medical e-commerce.`,
  },
  {
    id: "user-rights",
    title: "Your Rights",
    icon: <Shield className="w-4 h-4" />,
    content: `You have full control over your privacy at MediStore:
    \n• Access & Correction: You can view and update your personal profile at any time.
    \n• Data Portability: You may request a copy of your personal data in a readable format.
    \n• Right to Deletion: You can request the deletion of your account (subject to regulatory pharmaceutical record-keeping requirements).`,
  },
  {
    id: "cookies",
    title: "Cookies & Tracking",
    icon: <Globe className="w-4 h-4" />,
    content: `MediStore uses essential cookies to manage your shopping cart and authenticated sessions. We also use analytics cookies (which can be opted out of) to understand how users interact with our platform. You can manage your cookie preferences through your browser settings.`,
  },
  {
    id: "retention",
    title: "Data Retention",
    icon: <Clock className="w-4 h-4" />,
    content: `We retain your personal information only for as long as necessary to provide our services and comply with legal obligations. Pharmaceutical transaction records are maintained for durations mandated by national health regulators.`,
  },
  {
    id: "policy-updates",
    title: "Policy Updates",
    icon: <Bell className="w-4 h-4" />,
    content: `We may periodically update this policy to reflect changes in our practices or regulatory requirements. We will notify you of any significant changes via email or a prominent notice on our website.`,
  },
];

export default function PrivacyPage() {
  const [activeSection, setActiveSection] = useState(sections[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5, rootMargin: "-100px 0px -50% 0px" }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 overflow-x-hidden">
      {/* 1. Privacy Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden border-b border-border/40 md:pb-16 lg:pt-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_0%,rgba(var(--primary-rgb),0.05)_0%,transparent_100%)]" />
        <div className="container px-4 mx-auto max-w-7xl lg:px-8">
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-3 py-1 mb-6 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full bg-primary/10 text-primary border border-primary/20"
            >
              Legal & Privacy
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-black tracking-tight md:text-5xl lg:text-7xl text-foreground"
            >
              Privacy <span className="text-primary">Policy</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-2xl mt-6 text-base leading-relaxed text-muted-foreground md:text-lg lg:text-xl"
            >
              Your trust is our most valuable asset. We are committed to transparency in how we
              handle your personal and medical data.
            </motion.p>

            <div className="flex items-center gap-4 mt-10 md:gap-8">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Effective Date
                </span>
                <span className="text-sm font-bold">April 10, 2024</span>
              </div>
              <div className="w-px h-8 bg-border/60" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Last Updated
                </span>
                <span className="text-sm font-bold">Today</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Privacy Navigation & Content Container */}
      <div className="container px-4 py-8 mx-auto max-w-7xl md:py-20 lg:px-8">
        <div className="relative flex flex-col gap-8 lg:flex-row lg:gap-16">
          {/* 3. Privacy Navigation (Sidebar / Top Block) */}
          <aside className="w-full lg:w-[280px] lg:shrink-0">
            {/* Mobile "On this page" block (Visible < LG) */}
            <div className="block p-5 mb-8 lg:hidden rounded-2xl bg-card/10 dark:bg-zinc-950/20 backdrop-blur-sm border border-border/40 shadow-sm">
              <h3 className="flex items-center gap-2 mb-4 text-[10px] font-bold tracking-[0.2em] uppercase opacity-70">
                <Info className="w-4 h-4 text-primary" />
                On this page
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-3 px-3 py-2 text-xs transition-all border rounded-lg border-transparent hover:bg-primary/5 hover:text-primary group hover:border-primary/10"
                  >
                    <span className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                      {section.icon}
                    </span>
                    <span className="truncate">{section.title}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Desktop Sticky Sidebar (Visible >= LG) */}
            <div className="hidden lg:block sticky top-32 space-y-8">
              <div className="space-y-4">
                <h3 className="px-4 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase opacity-50">
                  Contents
                </h3>
                <nav className="flex flex-col gap-1">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 text-sm font-medium transition-all rounded-xl border border-transparent",
                        activeSection === section.id
                          ? "bg-primary/10 text-primary border-primary/20 translate-x-1"
                          : "text-muted-foreground hover:bg-card/20 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "transition-colors",
                            activeSection === section.id ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          {section.icon}
                        </span>
                        {section.title}
                      </div>
                      {activeSection === section.id && (
                        <ChevronRight className="w-4 h-4 animate-in fade-in slide-in-from-left-2 duration-300" />
                      )}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                <h4 className="flex items-center gap-2 mb-3 text-sm font-bold">
                  <Shield className="w-4 h-4 text-primary" />
                  GDPR Ready
                </h4>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Our service is designed with the highest privacy-by-design standards in mind.
                </p>
              </div>
            </div>
          </aside>

          {/* 4. Privacy Content */}
          <main className="flex-1 min-w-0 space-y-12">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-32">
                <div className="p-6 transition-all rounded-2xl bg-card/10 dark:bg-zinc-950/20 backdrop-blur-md border border-border/40 shadow-premium hover:border-primary/20 group overflow-hidden sm:p-8 md:p-12 md:rounded-[2.5rem]">
                  <div className="flex items-start justify-between mb-6 md:mb-10">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 transition-transform group-hover:scale-110 md:w-14 md:h-14 md:rounded-2xl">
                        {section.icon}
                      </div>
                      <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl md:text-3xl lg:text-4xl">
                        {section.title}
                      </h2>
                    </div>
                  </div>

                  <div className="max-w-4xl text-[15px] leading-[1.8] text-muted-foreground whitespace-pre-wrap selection:bg-primary/20 wrap-break-word md:text-lg">
                    {section.content}
                  </div>

                  {section.id === "security" && (
                    <div className="mt-8 p-5 rounded-xl border border-primary/10 bg-primary/5 transition-colors group-hover:bg-primary/10 sm:p-6 md:mt-12 md:rounded-3xl">
                      <div className="flex gap-4">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Lock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground mb-1 text-sm md:text-base">
                            Muted Security Callout
                          </h4>
                          <p className="text-[13px] leading-relaxed md:text-sm">
                            For security reasons, we do not store full credit card numbers on our
                            servers. All transactions are routed through industry-certified payment
                            gateways.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            ))}

            {/* Final Contact Callout */}
            <section className="pt-8">
              <div className="p-8 rounded-2xl bg-primary text-primary-foreground shadow-2xl overflow-hidden relative group md:p-12 md:rounded-[3rem]">
                <div className="absolute top-0 right-0 -m-10 w-64 h-64 bg-white/10 rounded-full blur-3xl transition-transform group-hover:scale-125 duration-700" />
                <div className="relative z-10 text-center sm:text-left">
                  <h2 className="text-2xl font-extrabold mb-4 md:text-4xl">
                    Questions about your privacy?
                  </h2>
                  <p className="text-primary-foreground/80 text-base mb-10 max-w-2xl leading-relaxed md:text-xl md:mb-12">
                    If you have any questions regarding this policy or our data practices, please
                    reach out to our dedicated privacy office.
                  </p>
                  <Link
                    href="mailto:privacy@medistore.com"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-black rounded-xl shadow-xl hover:bg-zinc-100 transition-all hover:scale-105 md:rounded-2xl"
                  >
                    Contact Privacy Office
                  </Link>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="container px-4 py-8 mx-auto text-center border-t border-border/40">
        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/40">
          © {new Date().getFullYear()} MediStore Inc. Legal Division. All rights reserved.
        </p>
      </div>
    </div>
  );
}
