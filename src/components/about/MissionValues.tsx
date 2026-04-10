"use client";

import { ShieldCheck, Truck, HeartPulse, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const values = [
  {
    icon: ShieldCheck,
    title: "Trust & Safety",
    desc: "Every product is reviewed and listed with verified medical references and clinical guidelines.",
  },
  {
    icon: HeartPulse,
    title: "Patient First",
    desc: "We design experiences that prioritize health, clarity, and compassionate care for every user.",
  },
  {
    icon: Truck,
    title: "Fast & Reliable",
    desc: "Efficient delivery workflows ensure medicines reach you safely and on time, every time.",
  },
  {
    icon: Stethoscope,
    title: "Medical Integrity",
    desc: "OTC categories strictly follow professional medical rules and healthcare best practices.",
  },
];

export function MissionValues() {
  return (
    <section className="relative py-20 bg-background overflow-hidden">
      {/* Subtle Background pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
      />

      <div className="container-custom relative z-10">
        <div className="mb-12 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold md:text-4xl lg:text-5xl mb-4"
          >
            Our Mission & Values
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-2xl text-lg text-muted-foreground"
          >
            We are committed to making medicine access safer, simpler, and more transparent through innovation and integrity.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, index) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className={cn(
                "group relative p-8 rounded-2xl border border-border/40 bg-card/40 transition-all duration-300",
                "hover:bg-card hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2",
                "glass-surface"
              )}
            >
              <div className="mb-6 inline-flex p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                <v.icon className="h-8 w-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold mb-3 tracking-tight">{v.title}</h3>
              <p className="text-muted-foreground leading-relaxed line-clamp-3">
                {v.desc}
              </p>

              {/* Decorative Corner Glow */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
