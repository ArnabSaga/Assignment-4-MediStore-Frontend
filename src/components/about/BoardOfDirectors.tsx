"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { User, Linkedin, Twitter, Mail } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const directors = [
  {
    badge: "Clinical Advisor",
    name: "Dr. Puspita Sarkar",
    title: "Medical Oversight",
    image: "/images/team/puspita.png",
    bio: "Specializing in pharmaceutical safety and clinical medicine oversight.",
  },
  {
    badge: "Operations",
    name: "Masudur Rahman",
    title: "Logistics & Fulfillment",
    image: "/images/team/masudur.jpg",
    bio: "Expert in supply chain management and pharmacy operation logistics.",
  },
  {
    badge: "Customer Care",
    name: "Sumyta Habib",
    title: "Customer Experience",
    image: "/images/team/sumyta.jpg",
    bio: "Passionately driving patient support and medical service satisfaction.",
  },
  {
    badge: "Technology",
    name: "Achyuta Arnab Dey",
    title: "Platform & Security",
    image: "/images/team/arnab.jpg",
    bio: "Architecting secure healthcare platforms and data privacy systems.",
  },
];

export function BoardOfDirectors() {
  return (
    <section className="py-20 bg-background/50 border-t border-border/40">
      <div className="container-custom">
        <div className="mb-12">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold md:text-4xl tracking-tight mb-4"
          >
            Board of Directors
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl"
          >
            Meet the leadership guiding MediStore&apos;s commitment to clinical quality, operational excellence, and secure technology.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {directors.map((d, index) => (
            <DirectorCard key={d.name} director={d} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function DirectorCard({ director, index }: { director: typeof directors[0], index: number }) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group"
    >
      <div className="relative glass-surface rounded-2xl overflow-hidden border border-border/40 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20">

        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {/* Skeleton Loader */}
          {isLoading && (
            <div className="absolute inset-0 animate-pulse bg-primary/5 flex items-center justify-center">
              <User className="h-12 w-12 text-primary/10" />
            </div>
          )}

          {imageError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-primary/5">
              <User className="h-16 w-16 text-primary/20" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2 font-medium">Avatar Fallback</span>
            </div>
          ) : (
            <Image
              src={director.image}
              alt={director.name}
              fill
              className={cn(
                "object-cover transition-all duration-700",
                "group-hover:scale-110 group-hover:rotate-1",
                isLoading ? "opacity-0" : "opacity-100"
              )}
              onLoadingComplete={() => setIsLoading(false)}
              onError={() => {
                setImageError(true);
                setIsLoading(false);
              }}
            />
          )}

          {/* Badge Overlay */}
          <div className="absolute top-4 left-4 z-20">
            <Badge className="bg-primary text-primary-foreground border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-md">
              {director.badge}
            </Badge>
          </div>

          {/* Social Links on Hover */}
          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
             <button className="h-9 w-9 rounded-full bg-background/90 flex items-center justify-center text-primary translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75 hover:bg-primary hover:text-white">
                    <Linkedin className="h-4 w-4" />
                 </button>
             <button className="h-9 w-9 rounded-full bg-background/90 flex items-center justify-center text-primary translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-100 hover:bg-primary hover:text-white">
                    <Twitter className="h-4 w-4" />
                 </button>
             <button className="h-9 w-9 rounded-full bg-background/90 flex items-center justify-center text-primary translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-150 hover:bg-primary hover:text-white">
                    <Mail className="h-4 w-4" />
                 </button>
               </div>
        </div>

        {/* Content Section */}
        <div className="p-6">
          <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">
            {director.name}
          </h3>
          <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">
            {director.title}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {director.bio}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
