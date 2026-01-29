import { AboutHero } from "@/components/about/AboutHero";
import { BoardOfDirectors } from "@/components/about/BoardOfDirectors";
import { MissionValues } from "@/components/about/MissionValues";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <AboutHero />
      <MissionValues />
      <BoardOfDirectors />
    </main>
  );
}
