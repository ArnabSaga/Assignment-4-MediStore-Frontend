import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const featured = {
  badge: "CEO & Founder",
  name: "Achyuta Arnab Dey",
  title: "Founder, MediStore",
  description:
    "MediStore is built with a single mission: make trusted OTC medicines accessible, safe, and convenient for everyone.",
  image: "/images/team/arnab.jpg",
  highlights: [
    "Built MediStore with a trust-first healthcare mindset",
    "Designed secure, scalable commerce architecture",
    "Focused on verified listings and customer safety",
  ],
};

export function AboutHero() {
  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold md:text-4xl">Meet Our Team</h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            We’re building MediStore with a strong focus on safety, trust, and
            seamless medicine shopping.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Image */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="relative h-86 md:h-105">
                <Image
                  src={featured.image}
                  alt={featured.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute left-4 top-4">
                  <Badge className="bg-background/70 backdrop-blur">
                    {featured.badge}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
              </div>
            </CardContent>
          </Card>

          {/* Content */}
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-semibold md:text-3xl">
              {featured.name}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {featured.title}
            </p>

            <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
              {featured.description}
            </p>

            <ul className="mt-6 space-y-3">
              {featured.highlights.map((h) => (
                <li key={h} className="flex gap-3">
                  <CheckCircle2 className="mt-1 h-4 w-4" />
                  <span className="text-sm text-muted-foreground">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
