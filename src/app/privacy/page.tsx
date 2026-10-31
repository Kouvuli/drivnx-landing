// CFX-WEB-landing AC-15
import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header } from "@/components/SiteChrome";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${site.name} handles the information you give us on this website.`,
};

export default function Privacy() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_li]:mt-2 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6">
        <h1 className="text-4xl font-semibold tracking-tight">Privacy policy</h1>
        <p className="text-muted">
          This policy covers this website. It is operated by {site.operator}. Contact:{" "}
          <a href={`mailto:${site.email}`} className="underline decoration-brand/60">
            {site.email}
          </a>
          .
        </p>

        <h2>What we collect</h2>
        <p>When you sign up for early access, we collect only what you type into the form:</p>
        <ul>
          <li>your email address;</li>
          <li>which description fits you (growing business, data team or analyst, consultant or partner);</li>
          <li>whether you&apos;d like a free Readiness Report.</li>
        </ul>
        <p>We use this only to contact you about early access and, if you asked, the Readiness Report. We don&apos;t sell it or use it for advertising.</p>

        <h2>Who processes it</h2>
        <p>
          Sign-ups are sent to Formspree, a form-processing service, which stores them and forwards them to us. If the form
          service isn&apos;t available, the form opens an email to us instead, and the details go through your own email provider.
        </p>

        <h2>Cookies and tracking</h2>
        <p>This website uses no analytics and no tracking cookies.</p>

        <h2>How long we keep it</h2>
        <p>We keep your sign-up until early access ends or until you ask us to delete it, whichever comes first.</p>

        <h2>Your choices</h2>
        <p>
          Email{" "}
          <a href={`mailto:${site.email}`} className="underline decoration-brand/60">
            {site.email}
          </a>{" "}
          to see, correct or delete what we hold about you. We&apos;ll confirm within 30 days.
        </p>

        <h2>Your business data</h2>
        <p>
          Don&apos;t upload or email business data through this website. If you asked for a Readiness Report, we&apos;ll agree a
          secure way to share files with you first, and explain what is processed where.
        </p>

        <p className="mt-12">
          <Link href="/" className="font-medium text-accent underline decoration-brand/60">
            Back to the home page
          </Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
