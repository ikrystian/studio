
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Privacy Policy | WorkoutWise',
  description: 'Read the privacy policy for WorkoutWise.',
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-3xl space-y-6 rounded-lg bg-card p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
          <p className="text-muted-foreground">
            We collect information you provide directly to us when you create an account, update your profile,
            use our services, or communicate with us. This may include:
          </p>
          <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
            <li>Personal identification information (Name, email address, date of birth, gender).</li>
            <li>Fitness and health-related information (Weight, height, fitness level, workout data).</li>
            <li>Account credentials (Username, password - which is hashed).</li>
            <li>Communication preferences.</li>
          </ul>
          <p className="text-muted-foreground">
            We may also collect information automatically when you use our services, such as IP address, device
            information, and usage data through cookies and similar technologies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
          <p className="text-muted-foreground">We use the information we collect to:</p>
          <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
            <li>Provide, maintain, and improve our services.</li>
            <li>Personalize your experience.</li>
            <li>Communicate with you, including responding to your inquiries and sending service-related updates.</li>
            <li>Process transactions and send you related information.</li>
            <li>Monitor and analyze trends, usage, and activities in connection with our services.</li>
            <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities and protect the rights and property of WorkoutWise and others.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">3. Sharing Your Information</h2>
          <p className="text-muted-foreground">
            We do not share your personal information with third parties except in the following circumstances or as
            otherwise described in this Privacy Policy:
          </p>
          <ul className="list-disc space-y-1 pl-6 text-muted-foreground">
            <li>With your consent.</li>
            <li>With vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.</li>
            <li>If we believe disclosure is necessary to comply with any applicable law, regulation, legal process, or governmental request.</li>
            <li>To enforce our agreements, policies, and terms of service.</li>
            <li>In connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business by another company.</li>
          </ul>
        </section>
        
        <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">4. Data Security</h2>
            <p className="text-muted-foreground">
            We take reasonable measures to help protect information about you from loss, theft, misuse, and
            unauthorized access, disclosure, alteration, and destruction.
            </p>
        </section>

        <section className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">5. Your Choices</h2>
            <p className="text-muted-foreground">
            You may update, correct, or delete information about you at any time by logging into your account. If
            you wish to delete your account, please contact us, but note that we may retain certain information
            as required by law or for legitimate business purposes.
            </p>
        </section>
        
        {/* Add more sections as needed: Cookies, Children's Privacy, Changes to This Policy, Contact Us */}

        <div className="pt-6 text-center">
          <Button asChild>
            <Link href="/register">Back to Registration</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

    