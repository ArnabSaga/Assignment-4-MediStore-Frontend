"use client";

import { motion } from "framer-motion";
import { ShoppingBag, HelpCircle, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";

const highlights = [
  {
    icon: <ShoppingBag className="h-6 w-6" />,
    title: "Browse Shop",
    description: "Explore our collection of authentic healthcare products.",
    link: "/shop",
    label: "Go to Shop"
  },
  {
    icon: <HelpCircle className="h-6 w-6" />,
    title: "Help Center",
    description: "Find answers to common questions about orders and shipping.",
    link: "/faq",
    label: "Visit FAQ"
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Privacy Info",
    description: "Learn how we protect your clinical and personal data.",
    link: "/privacy",
    label: "Read Policy"
  }
];

export function ContactSupportHighlights() {
  return (
    <section className="py-16 bg-muted/30 border-y border-border/40">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {highlights.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link 
                href={item.link}
                className="group flex flex-col p-6 h-full rounded-2xl border border-border/40 bg-background/50 hover:bg-background hover:border-primary/30 transition-all duration-300 hover:shadow-lg"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed flex-grow">
                  {item.description}
                </p>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                  {item.label}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
