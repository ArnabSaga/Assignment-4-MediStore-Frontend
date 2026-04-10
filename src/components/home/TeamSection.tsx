"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Linkedin, Twitter, Mail } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type TeamMember = {
  name: string;
  role: string;
  bio: string;
  image: string;
};

const team: TeamMember[] = [
  {
    name: "Dr. Puspita Sarkar",
    role: "Clinical Advisor",
    bio: "Guides our OTC safety standards and ensures product listings follow trusted medical references.",
    image: "/images/team/puspita.png",
  },
  {
    name: "Masudur Rahman",
    role: "Operations Lead",
    bio: "Manages order fulfillment workflows and ensures fast, reliable delivery across regions.",
    image: "/images/team/masudur.jpg",
  },
  {
    name: "Suymta Bentey Habib",
    role: "Customer Care",
    bio: "Helps customers choose the right OTC products and supports post-order assistance.",
    image: "/images/team/sumyta.jpg",
  },
  {
    name: "Achyuta Arnab Dey",
    role: "Tech & Security",
    bio: "Builds secure systems for authentication, payments readiness, and smooth shopping experiences.",
    image: "/images/team/arnab.jpg",
  },
];

export function TeamSection({
  className,
  heading = "Professional Leadership",
  subheading = "A dedicated team focused on safe healthcare access, operational excellence, and technical security.",
}: {
  className?: string;
  heading?: string;
  subheading?: string;
}) {
  return (
    <section className={cn("py-12 md:py-20 bg-zinc-50 dark:bg-zinc-950/20", className)} aria-labelledby="team">
      <div className="container-custom">
        <div className="mb-12 text-center">
          <motion.div
             initial={{ opacity: 0, y: 10 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.5 }}
          >
            <h2 id="team" className="text-3xl font-bold tracking-tight md:text-4xl text-pretty">
               {heading}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
               {subheading}
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m, index) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="group relative h-[400px] overflow-hidden border-border/40 bg-card rounded-m shadow-premium transition-all">
                <CardContent className="h-full p-0">
                  {/* Image Layer */}
                  <div className="relative h-full w-full">
                    <Image
                      src={m.image}
                      alt={m.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Default Overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-40" />

                    {/* Bottom Info Bar (Visible by default) */}
                    <div className="absolute inset-x-0 bottom-0 p-6 text-white transition-all duration-300 group-hover:translate-y-4 group-hover:opacity-0">
                      <p className="text-lg font-bold tracking-tight">{m.name}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-primary/90">
                        {m.role}
                      </p>
                    </div>

                    {/* Hover Content Layer */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:backdrop-blur-sm bg-black/60 translate-y-8 group-hover:translate-y-0">
                      <p className="text-xl font-bold text-white mb-2">{m.name}</p>
                      <p className="text-xs font-bold text-primary uppercase tracking-widest mb-4">{m.role}</p>

                      <p className="text-sm font-medium text-white/80 leading-relaxed mb-6">
                        {m.bio}
                      </p>

                      <div className="flex gap-3">
                         <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-white/10 text-white hover:bg-primary transition-colors">
                            <Linkedin className="h-4 w-4" />
                         </Button>
                         <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-white/10 text-white hover:bg-primary transition-colors">
                            <Twitter className="h-4 w-4" />
                         </Button>
                         <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full bg-white/10 text-white hover:bg-primary transition-colors">
                            <Mail className="h-4 w-4" />
                         </Button>
                      </div>
                    </div>

                    {/* Bottom Accent Line */}
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-primary scale-x-0 transition-transform duration-500 group-hover:scale-x-100 origin-left" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
