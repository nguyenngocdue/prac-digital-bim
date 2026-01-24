"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, type FC } from "react";
import { Box, Building2, Eye, Workflow, Database, Map } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";

/**
 * Home page - Ascend Platform Landing Page
 */
const Home: FC = () => {
  const {  t } = useLanguage();
  const [gridOrigin, setGridOrigin] = useState("50% 50%");

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
      <section
        className="hero-shell group relative flex min-h-screen items-center justify-center overflow-hidden text-foreground"
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1);
          const y = Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1);
          setGridOrigin(`${(x * 100).toFixed(2)}% ${(y * 100).toFixed(2)}%`);
        }}
        onMouseLeave={() => setGridOrigin("50% 50%")}
      >
        <div
          className="theme-grid absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ transformOrigin: gridOrigin }}
        />
        <div className="hero-glow absolute inset-0" />
        <div className="hero-fade absolute inset-0" />

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="inline-flex items-center justify-center rounded-full border border-border/60 bg-background/70 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t("hero.subtitle")}
            </div>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              {t("hero.title")}
              <span className="mt-2 block text-primary">
                {t("hero.subtitle")}
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("hero.description")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
              <Link href="/project">
                <Button
                  size="lg"
                  className="h-12 px-7 text-sm"
                >
                  <Building2 className="mr-2 h-5 w-5" />
                  {t("hero.exploreProjects")}
                </Button>
              </Link>
              <Link href="/project/viewer">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-7 text-sm"
                >
                  <Eye className="mr-2 h-5 w-5" />
                  {t("hero.viewer")}
                </Button>
              </Link>
              <Link href="/workflow">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-7 text-sm"
                >
                  <Workflow className="mr-2 h-5 w-5" />
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
