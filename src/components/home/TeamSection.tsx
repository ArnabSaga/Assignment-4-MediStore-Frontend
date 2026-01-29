import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  heading = "Meet Our Team",
  subheading = "A small team with a big focus: safe OTC shopping, fast delivery, and trusted service.",
}: {
  className?: string;
  heading?: string;
  subheading?: string;
}) {
  return (
    <section
      className={cn("py-10 md:py-14 bg-zinc-100 dark:bg-zinc-900", className)}
      aria-labelledby="team"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 text-center">
          <h2
            id="team"
            className="text-2xl font-semibold tracking-tight md:text-4xl"
          >
            {heading}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            {subheading}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m) => (
            <Card
              key={m.name}
              className="
                group relative overflow-hidden border-border bg-card text-card-foreground
                rounded-(--radius)
                transition-all duration-300 hover:-translate-y-1 hover:shadow-md
              "
            >
              {/* IMPORTANT: no padding anywhere */}
              <CardContent className="p-0">
                {/* give the fill image a real height */}
                <div className="relative h-80 w-full overflow-hidden">
                  {/* IMAGE LAYER */}
                  <div className="absolute inset-0 transition-all duration-300 ease-out group-hover:opacity-0 group-hover:scale-[1.03]">
                    <Image
                      src={m.image}
                      alt={m.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                    {/* ✅ correct gradient class */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent" />
                  </div>

                  {/* CONTENT LAYER */}
                  <div
                    className="
                      absolute inset-0 flex flex-col justify-between
                      bg-background/95 p-5
                      opacity-0 translate-y-3
                      transition-all duration-300 ease-out
                      group-hover:opacity-100 group-hover:translate-y-0
                      dark:bg-background/90
                    "
                  >
                    <div>
                      <p className="text-base font-semibold">{m.name}</p>
                      <p className="mt-1 text-xs font-medium text-muted-foreground">
                        {m.role}
                      </p>

                      <p className="mt-4 text-sm leading-6 text-muted-foreground">
                        {m.bio}
                      </p>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      MediStore Team
                    </p>
                  </div>

                  {/* NAME BAR (visible before hover) */}
                  <div className="absolute inset-x-0 bottom-0 p-4 transition-opacity duration-200 group-hover:opacity-0">
                    <p className="text-base font-semibold text-white">
                      {m.name}
                    </p>
                    <p className="text-xs font-medium text-white/80">
                      {m.role}
                    </p>
                  </div>

                  {/* ✅ bottom accent bar */}
                  <div
                    className="
                      pointer-events-none absolute inset-x-0 bottom-0 h-0.75
                      origin-left scale-x-0
                      bg-(--button-accent)
                      transition-transform duration-300 ease-out
                      group-hover:scale-x-100
                    "
                  />

                  {/* subtle ring */}
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-border/40" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
