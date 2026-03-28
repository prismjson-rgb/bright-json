import type { Metadata } from "next";
import Link from "next/link";
import { Braces } from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://jsonprism.com";

export const metadata: Metadata = {
  title: "Terms & Conditions — JSON Prism",
  description:
    "Terms and conditions for using JSON Prism — a free, browser-based JSON formatting and validation tool.",
  alternates: { canonical: `${BASE}/terms/` },
  openGraph: {
    title: "Terms & Conditions — JSON Prism",
    description:
      "Terms and conditions for using JSON Prism — a free, browser-based JSON formatting and validation tool.",
    type: "website",
    siteName: "JSON Prism",
    url: `${BASE}/terms/`,
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Braces className="w-4 h-4 text-primary" />
          </div>
          <Link
            href="/"
            className="font-semibold text-sm text-primary hover:text-primary/80 transition-colors"
          >
            JSON Prism
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Terms & Conditions</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: March 9, 2026
        </p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using JSON Prism ("the app", "we", "our"), you
              agree to be bound by these Terms & Conditions. If you do not agree
              with any part of these terms, please discontinue use of the app
              immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              Description of Service
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              JSON Prism is a free, browser-based tool that provides the
              following functionality:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
              <li>JSON formatting, minification, and validation</li>
              <li>Collapsible tree view for exploring JSON structures</li>
              <li>JSON diff (comparison) viewer</li>
              <li>JSON conversion to YAML, XML, and CSV</li>
              <li>In-browser search across JSON content</li>
              <li>Rich-text annotation notes (session-only, not persisted)</li>
              <li>Import and export of JSON files</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              All processing occurs locally in your browser. No data is sent to
              any server.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Use License</h2>
            <p className="text-muted-foreground leading-relaxed">
              Permission is granted to use JSON Prism for personal and
              commercial purposes, free of charge, subject to the following
              restrictions:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
              <li>
                You may not modify, reverse-engineer, or redistribute the app's
                source code without explicit permission
              </li>
              <li>
                You may not use the app for any unlawful purpose or in
                violation of any applicable regulations
              </li>
              <li>
                You may not attempt to interfere with, disrupt, or gain
                unauthorized access to the app or its hosting infrastructure
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              User Responsibilities
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You are solely responsible for the JSON content you process using
              this tool. You agree not to use JSON Prism to process data that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
              <li>Infringes on any third-party intellectual property rights</li>
              <li>
                Violates applicable privacy laws or data protection regulations
              </li>
              <li>Contains malicious code or payloads</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Because all data remains in your browser, you are responsible for
              ensuring you have the right to process any data you input into the
              app.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              Disclaimer of Warranties
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              JSON Prism is provided "as is" and "as available" without
              warranties of any kind, either express or implied, including but
              not limited to implied warranties of merchantability, fitness for
              a particular purpose, and non-infringement.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              We do not warrant that the app will be error-free, uninterrupted,
              secure, or that any defects will be corrected. The app may be
              updated, modified, or discontinued at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              To the fullest extent permitted by applicable law, JSON Prism and
              its contributors shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages arising from your use
              of or inability to use the app, including but not limited to loss
              of data, loss of profits, or business interruption — even if
              advised of the possibility of such damages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Third-Party Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              JSON Prism uses open-source libraries (including Monaco Editor,
              Tailwind CSS, shadcn/ui, and others). These are subject to their
              own respective licenses. JSON Prism does not endorse or take
              responsibility for any third-party content or services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              Intellectual Property
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The JSON Prism name, logo, and all original source code are the
              intellectual property of their respective authors. All rights not
              expressly granted herein are reserved.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms & Conditions at any
              time. Changes are effective immediately upon posting with an
              updated "Last updated" date. Your continued use of the app
              following any changes constitutes your acceptance of the revised
              terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms shall be governed by and construed in accordance with
              applicable law. Any disputes shall be resolved through good-faith
              negotiation before resorting to formal legal proceedings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions or concerns regarding these Terms & Conditions,
              please open an issue on the project's GitHub repository.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex items-center gap-4 text-sm text-muted-foreground">
          <Link
            href="/"
            className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            Back to JSON Prism
          </Link>
          <span>·</span>
          <Link
            href="/privacy"
            className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </main>
    </div>
  );
}
