import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="py-10 md:py-14">
        <div className="mx-auto max-w-6xl px-4">
          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Contact Us
            </h1>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              Need help with an order, seller onboarding, or a partnership? Send
              us a message and we&apos;ll reply soon.
            </p>
          </div>

          {/* Layout */}
          <Card className="overflow-hidden border-border bg-card text-card-foreground">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                <div className="relative">
                  <div className="relative min-h-90 md:min-h-130">
                    <Image
                      src="/images/DealBanner.jpg"
                      alt="Contact"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority={false}
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-background/95 via-background/75 to-background/30 dark:from-background/90 dark:via-background/75 dark:to-background/35" />
                  </div>

                  <div className="absolute inset-0 p-6 md:p-10">
                    <div className="max-w-sm">
                      <p className="text-xs font-medium text-muted-foreground">
                        MediStore Support
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                        Let’s talk
                      </h2>

                      <div className="mt-6 space-y-4 text-sm">
                        <div className="flex items-start gap-3">
                          <MapPin className="mt-0.5 h-4 w-4 text-foreground" />
                          <div>
                            <p className="font-medium text-foreground">
                              Address
                            </p>
                            <p className="text-muted-foreground">
                              Dhaka, Bangladesh
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Mail className="mt-0.5 h-4 w-4 text-foreground" />
                          <div>
                            <p className="font-medium text-foreground">Email</p>
                            <a
                              className="link-hover text-muted-foreground"
                              href="mailto:support@medistore.com"
                            >
                              support@medistore.com
                            </a>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Phone className="mt-0.5 h-4 w-4 text-foreground" />
                          <div>
                            <p className="font-medium text-foreground">Phone</p>
                            <a
                              className="link-hover text-muted-foreground"
                              href="tel:+8801700000000"
                            >
                              +880 17 0000 0000
                            </a>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Sun–Thu • 9:00 AM – 6:30 PM
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 rounded-xl border border-border bg-background/70 p-4 backdrop-blur">
                        <p className="text-xs text-muted-foreground">
                          We usually reply within{" "}
                          <span className="font-medium text-foreground">
                            24 hours
                          </span>
                          .
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          For urgent order issues, include your order ID.
                        </p>
                      </div>

                      <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <Link href="/shop" className="link-hover">
                          Browse Shop
                        </Link>
                        <span>•</span>
                        <Link href="/about" className="link-hover">
                          About
                        </Link>
                        <span>•</span>
                        <Link href="/privacy" className="link-hover">
                          Privacy
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE (Form) */}
                <div className="p-6 md:p-10">
                  <form className="grid gap-5">
                    <div className="grid gap-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="First Name"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Last Name"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        required
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Write your message..."
                        className="min-h-35"
                        required
                      />
                    </div>

                    <div className="pt-2">
                      <Button
                        type="submit"
                        className="btn-primary w-full rounded-md sm:w-auto"
                      >
                        SUBMIT
                      </Button>
                      <p className="mt-3 text-xs text-muted-foreground">
                        By submitting, you agree to our{" "}
                        <Link href="/privacy" className="link-hover">
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Small footer note */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            OTC medicines only • No prescription uploads required
          </p>
        </div>
      </section>
    </main>
  );
}
