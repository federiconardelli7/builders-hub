"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Users,
  Mail,
  Calendar,
  MessageSquare,
  UserPlus,
  Mic,
  DollarSign,
  ExternalLink,
  Award,
  Globe,
  Building,
} from "lucide-react";
import Link from "next/link";
import { HeroBackground } from "@/components/landing/hero";
import UniversitySlideshow from "@/components/university/UniversitySlideshow";

interface ProgramCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  external?: boolean;
}

function ProgramCard({ title, description, icon, href, external = false }: ProgramCardProps) {
  const cardContent = (
    <div className="p-6 space-y-4 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow duration-200 h-full">
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
          {icon}
        </div>
        {external ? (
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:no-underline"
        >
          {cardContent}
        </a>
      );
    } else {
      return (
        <Link href={href} className="block hover:no-underline">
          {cardContent}
        </Link>
      );
    }
  }

  return cardContent;
}

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  external?: boolean;
}

function ActionCard({ title, description, icon, href, external = false }: ActionCardProps) {
  const cardContent = (
    <div className="p-6 space-y-4 bg-card border border-border rounded-lg hover:shadow-sm transition-shadow duration-200 h-full">
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
          {icon}
        </div>
        {external ? (
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );

  if (href) {
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="block hover:no-underline"
        >
          {cardContent}
        </a>
      );
    } else {
      return (
        <Link href={href} className="block hover:no-underline">
          {cardContent}
        </Link>
      );
    }
  }

  return cardContent;
}

export default function Page() {
  return (
    <>
      <HeroBackground />
      <main className="container relative max-w-[1100px] px-2 py-4 lg:py-16">
        {/* Hero Section */}
        <section className="text-center space-y-6 pt-12">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo-black.png"
              alt="Avalanche Logo"
              width={200}
              height={50}
              className="dark:hidden"
            />
            <Image
              src="/logo-white.png"
              alt="Avalanche Logo"
              width={200}
              height={50}
              className="hidden dark:block"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            University Program
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover opportunities for students and educators to explore blockchain technology, 
            access educational resources, and join our community of builders on Avalanche.
          </p>
        </section>

        {/* Photo Slideshow Section */}
        <section className="mt-16">
          <UniversitySlideshow className="mb-8" />
          <p className="text-center text-2xl md:text-3xl font-semibold">
            Learn, connect, build and innovate with Avalanche.
          </p>
        </section>



        {/* LEARN Section */}
        <section className="space-y-12 mt-24">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">LEARN</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Free learning programs to feed your curiosity and advance your career.
            </p>
          </div>
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
            <ProgramCard
              title="Avalanche Academy"
              description="Master blockchain development with hands-on courses designed specifically for the Avalanche ecosystem. From fundamentals to advanced L1 development, gain the skills to build the next generation of blockchain applications and get certified for free."
              icon={<BookOpen className="w-6 h-6 text-foreground" />}
              href="/academy"
            />
            <ProgramCard
              title="Codebase Entrepreneur Academy"
              description="Learn how to build, launch, and scale your blockchain startup with guidance from industry experts and get certified for free."
              icon={<GraduationCap className="w-6 h-6 text-foreground" />}
              href="/codebase-entrepreneur-academy"
            />
            <ProgramCard
              title="Faculty Development Program"
              description="Apply now for our next development training for faculty, learn how to integrate blockchain in your curriculum and connect with fellow educators."
              icon={<Users className="w-6 h-6 text-foreground" />}
              href="https://4h8ew.share.hsforms.com/22moDWT9uT1mWJcIrdTPnZA"
              external
            />
          </div>
        </section>

        {/* CONNECT Section */}
        <section className="space-y-12 mt-24">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">CONNECT</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Students and educators — step into blockchain and join the Avalanche builder community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Stay in the loop */}
            <ActionCard
              title="Stay in the Loop with the Newsletter"
              description="Subscribe to our newsletter and be the first to know about upcoming university events, internship opportunities, and more."
              icon={<Mail className="w-6 h-6 text-foreground" />}
              href="https://4h8ew.share.hsforms.com/10iRrhSW3Q9Od8rcOda5O2A4h8ew"
              external
            />

            {/* Attend events */}
            <ActionCard
              title="Attend Avalanche Events"
              description="Check out our Team1 and Avalanche global events and attend an event near you."
              icon={<Calendar className="w-6 h-6 text-foreground" />}
              href="/events"
            />

            {/* Join communities */}
            <ActionCard
              title="Join Our Communities"
              description="Dedicated chats for university students, educators, and entrepreneurs. Find study groups, get support for your projects, and network with like-minded builders."
              icon={<MessageSquare className="w-6 h-6 text-foreground" />}
              href="http://t.me/avalancheacademy"
              external
            />
          </div>
        </section>

        {/* Student Club Launchpad Section */}
        <section className="space-y-12 mt-24">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">STUDENT CLUB LAUNCHPAD</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Want more Avalanche on your campus? Get access to resources for your club, from guest speakers to teaching materials and funding for your event.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <ActionCard
              title="Submit a request"
              description="Get access to resources for your university or club, from guest speakers to teaching materials and funding for your event."
              icon={<UserPlus className="w-6 h-6 text-foreground" />}
              href="/student-launchpad"
            />
            <ActionCard
              title="Complete your student profile"
              description="Let us know who you are and what you're interested in."
              icon={<Mic className="w-6 h-6 text-foreground" />}
              href="/students"
              external
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="mt-24">
          <div className="px-6 py-16 text-center space-y-6 rounded-lg border border-border bg-card">
            <h2 className="text-2xl md:text-3xl font-bold">
              Ready to Start Your Blockchain Journey?
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Join thousands of students and educators already building the future of blockchain 
              technology with Avalanche. Start learning today and become part of our global community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/academy">
                <Button className="rounded-lg px-6 py-3">
                  Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/events">
                <Button variant="outline" className="rounded-lg px-6 py-3">
                  Find Events
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
