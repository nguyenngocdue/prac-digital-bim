"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { FC } from "react";
import { Box, Building2, Eye, Workflow, Database, Map } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

/**
 * Home page - Digital Twin BIM Landing Page
 */
const Home: FC = () => {
  const {  t } = useLanguage();

  const features = [
    {
      icon: Building2,
      title: t("features.bim.title"),
      description: t("features.bim.description"),
    },
    {
      icon: Box,
      title: t("features.3d.title"),
      description: t("features.3d.description"),
    },
    {
      icon: Database,
      title: t("features.data.title"),
      description: t("features.data.description"),
    },
    {
      icon: Workflow,
      title: t("features.workflow.title"),
      description: t("features.workflow.description"),
    },
    {
      icon: Eye,
      title: t("features.monitoring.title"),
      description: t("features.monitoring.description"),
    },
    {
      icon: Map,
      title: t("features.gis.title"),
      description: t("features.gis.description"),
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Hero Section */}
      <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
        
        {/* Decorative Elements */}
        <div className="absolute left-10 top-20 h-64 w-64 animate-pulse rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-80 w-80 animate-pulse rounded-full bg-secondary/5 blur-3xl" />
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {t("hero.subtitle")}
              </div>
              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                {t("hero.title")}
                <span className="block bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent animate-gradient">
                  {t("hero.subtitle")}
                </span>
              </h1>
            </div>
            
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
              {t("hero.description")}
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
              <Link href="/project">
                <Button size="lg" className="group h-12 px-8 text-base shadow-lg transition-all hover:scale-105 hover:shadow-xl">
                  <Building2 className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  {t("hero.exploreProjects")}
                </Button>
              </Link>
              
              <Link href="/project/viewer">
                <Button size="lg" variant="outline" className="group h-12 px-8 text-base shadow-md transition-all hover:scale-105 hover:shadow-lg">
                  <Eye className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  {t("hero.viewer")}
                </Button>
              </Link>

              <Link href="/workflow">
                <Button size="lg" variant="secondary" className="group h-12 px-8 text-base shadow-md transition-all hover:scale-105 hover:shadow-lg">
                  <Workflow className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  {t("hero.workflows")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 sm:py-28">
        <div className="mb-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl">
            {t("features.title")}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t("features.description")}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative rounded-xl border bg-card p-8 text-card-foreground shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative space-y-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-transform group-hover:scale-110 group-hover:bg-primary/20">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold leading-none tracking-tight">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative overflow-hidden border-t bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-20">
        <div className="absolute left-1/4 top-10 h-64 w-64 animate-pulse rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 h-64 w-64 animate-pulse rounded-full bg-secondary/10 blur-3xl" />
        
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              {t("cta.title")}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {t("cta.description")}
            </p>
            <Link href="/project">
              <Button size="lg" className="mt-4 h-12 px-8 text-base shadow-xl transition-all hover:scale-105 hover:shadow-2xl">
                {t("cta.button")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
