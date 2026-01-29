import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const directors = [
  {
    badge: "Clinical Advisor",
    name: "Dr. Puspita Sarkar",
    title: "Medical Oversight",
    image: "/images/team/puspita.png",
  },
  {
    badge: "Operations",
    name: "Masudur Rahman",
    title: "Logistics & Fulfillment",
    image: "/images/team/masudur.jpg",
  },
  {
    badge: "Customer Care",
    name: "Suymta Bentey Habib",
    title: "Customer Experience",
    image: "/images/team/sumyta.jpg",
  },
  {
    badge: "Technology",
    name: "Achyuta Arnab Dey",
    title: "Platform & Security",
    image: "/images/team/arnab.jpg",
  },
];

export function BoardOfDirectors() {
  return (
    <section className="border-t border-border py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold md:text-3xl">
            Board of Directors
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            Leadership guiding MediStore&apos;s product quality, operations, and
            technology.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {directors.map((d) => (
            <Card key={d.name} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-55">
                  <Image
                    src={d.image}
                    alt={d.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute left-4 top-4">
                    <Badge className="bg-background/70 backdrop-blur">
                      {d.badge}
                    </Badge>
                  </div>
                </div>

                <div className="p-4">
                  <p className="font-semibold">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
