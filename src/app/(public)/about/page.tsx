import { AboutHero } from "@/components/about/AboutHero";
import { BoardOfDirectors } from "@/components/about/BoardOfDirectors";
import { MissionValues } from "@/components/about/MissionValues";
import { TrustSection } from "@/components/home/TrustSection";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Story & CEO Section */}
      <AboutHero />
      
      {/* Trust & Guarantees Section (Reused from Home for brand consistency) */}
      <div className="bg-muted/30">
        <TrustSection className="bg-transparent" />
      </div>

      {/* Core Values Section */}
      <MissionValues />
      
      {/* Leadership Section */}
      <BoardOfDirectors />

      {/* Narrative Closing / Call to Trust */}
      <section className="py-20 bg-background">
        <div className="container-custom text-center">
          <div className="max-w-3xl mx-auto p-12 rounded-[2.5rem] bg-primary/5 border border-primary/10 relative overflow-hidden group">
            {/* Background highlights */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
            
            <h2 className="text-3xl font-bold mb-6 tracking-tight">Your Health, Our Responsibility.</h2>
            <p className="text-lg text-muted-foreground mb-8 text-balance">
              At MediStore, we combine medical precision with digital ease. Join thousands of families who trust us for their daily healthcare needs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                24/7 Support Available
              </div>
              <div className="hidden sm:block text-muted-foreground">•</div>
              <div className="text-sm font-bold text-foreground">
                Verified Pharmacy Partner
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
