import { ContactHero } from "@/components/contact/ContactHero";
import { ContactPanel } from "@/components/contact/ContactPanel";
import { ContactSupportHighlights } from "@/components/contact/ContactSupportHighlights";
import { TrustSection } from "@/components/home/TrustSection";

export const metadata = {
  title: "Contact Us | MediStore",
  description: "Get in touch with the MediStore team for pharmaceutical support, seller onboarding, or partnership inquiries.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Container System & Section Hierarchy */}
      
      {/* 1. Hero Section */}
      <ContactHero />

      {/* 2. Main Action Section (Form & Info) */}
      <ContactPanel />

      {/* 3. Secondary Navigation & Quick Links */}
      <ContactSupportHighlights />

      {/* 4. Global Brand Trust Row */}
      <div className="py-20">
        <div className="container-custom">
           <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight mb-2">The MediStore Promise</h2>
            <p className="text-muted-foreground text-sm">Your safety and medicine authenticity are our highest priorities.</p>
          </div>
          <TrustSection />
        </div>
      </div>

      {/* Final Regulatory Note */}
      <div className="border-t border-border/40 py-8 bg-muted/20">
        <p className="text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-medium">
          Licensed Pharmaceutical Marketplace • OTC Medicines Only • Secure Encrypted Data
        </p>
      </div>
    </main>
  );
}
