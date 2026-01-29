import { ShieldCheck, Truck, HeartPulse, Stethoscope } from "lucide-react";

const values = [
  {
    icon: ShieldCheck,
    title: "Trust & Safety",
    desc: "Every product is reviewed and listed with verified medical references.",
  },
  {
    icon: HeartPulse,
    title: "Patient First",
    desc: "We design experiences that prioritize health, clarity, and care.",
  },
  {
    icon: Truck,
    title: "Fast & Reliable",
    desc: "Efficient delivery workflows ensure medicines reach you on time.",
  },
  {
    icon: Stethoscope,
    title: "Medical Integrity",
    desc: "OTC categories follow clinical guidelines and best practices.",
  },
];

export function MissionValues() {
  return (
    <section className="border-t border-border py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold md:text-3xl">
            Our Mission & Values
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
            We are committed to making medicine access safer, simpler, and more
            transparent.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div
              key={v.title}
              className="rounded-xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <v.icon className="h-6 w-6" />
              <h3 className="mt-4 font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
