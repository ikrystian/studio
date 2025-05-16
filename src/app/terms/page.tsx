
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Terms and Conditions | LeniwaKluska',
  description: 'Read the terms and conditions for LeniwaKluska.',
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-3xl space-y-6 rounded-lg bg-card p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-foreground">Terms and Conditions</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
          <p className="text-muted-foreground">
            Welcome to LeniwaKluska! These terms and conditions outline the rules and regulations for the use of
            LeniwaKluska's Website, located at [Your Website URL].
          </p>
          <p className="text-muted-foreground">
            By accessing this website we assume you accept these terms and conditions. Do not continue to use LeniwaKluska
            if you do not agree to take all of the terms and conditions stated on this page.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">2. Intellectual Property Rights</h2>
          <p className="text-muted-foreground">
            Other than the content you own, under these Terms, LeniwaKluska and/or its licensors own all the
            intellectual property rights and materials contained in this Website. You are granted limited license
            only for purposes of viewing the material contained on this Website.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">3. Restrictions</h2>
          <p className="text-muted-foreground">You are specifically restricted from all of the following:</p>
          <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
            <li>Publishing any Website material in any other media;</li>
            <li>Selling, sublicensing and/or otherwise commercializing any Website material;</li>
            <li>Publicly performing and/or showing any Website material;</li>
            <li>Using this Website in any way that is or may be damaging to this Website;</li>
            <li>Using this Website in any way that impacts user access to this Website;</li>
            <li>
              Using this Website contrary to applicable laws and regulations, or in any way may cause harm to the
              Website, or to any person or business entity;
            </li>
            <li>
              Engaging in any data mining, data harvesting, data extracting or any other similar activity in relation
              to this Website;
            </li>
            <li>Using this Website to engage in any advertising or marketing.</li>
          </ul>
        </section>
        
        <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">4. Your Content</h2>
            <p className="text-muted-foreground">
            In these Website Standard Terms and Conditions, “Your Content” shall mean any audio, video text, images
            or other material you choose to display on this Website. By displaying Your Content, you grant LeniwaKluska
            a non-exclusive, worldwide irrevocable, sub licensable license to use, reproduce, adapt, publish,
            translate and distribute it in any and all media.
            </p>
            <p className="text-muted-foreground">
            Your Content must be your own and must not be invading any third-party’s rights. LeniwaKluska reserves
            the right to remove any of Your Content from this Website at any time without notice.
            </p>
        </section>

        <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">5. No warranties</h2>
            <p className="text-muted-foreground">
            This Website is provided “as is,” with all faults, and LeniwaKluska express no representations or
            warranties, of any kind related to this Website or the materials contained on this Website. Also,
            nothing contained on this Website shall be interpreted as advising you.
            </p>
        </section>

        {/* Add more sections as needed: Limitation of liability, Indemnification, Severability, Variation of Terms, Assignment, Entire Agreement, Governing Law & Jurisdiction */}

        <div className="pt-6 text-center">
          <Button asChild>
            <Link href="/register">Back to Registration</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
