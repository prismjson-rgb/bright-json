import type { Metadata } from "next";
import Link from "next/link";
import { Braces } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — JSON Prism",
  description: "Privacy policy for JSON Prism — how we handle your data.",
};

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: March 9, 2026
        </p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-xl font-semibold mb-3">Overview</h2>
            <p className="text-muted-foreground leading-relaxed">
              JSON Prism ("we", "our", or "the app") is a fully client-side,
              browser-based JSON utility tool. We are committed to your privacy.
              This policy explains what data is — and is not — collected when
              you use JSON Prism.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              Data We Do Not Collect
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              JSON Prism processes all JSON data entirely in your browser. We do
              not:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                Transmit, upload, or store any JSON content you paste or type
              </li>
              <li>Collect personal information or create user accounts</li>
              <li>Use cookies for tracking or analytics</li>
              <li>Share any data with third parties</li>
              <li>Run any server-side processing of your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Local Storage</h2>
            <p className="text-muted-foreground leading-relaxed">
              JSON Prism stores the following data locally in your browser using{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                localStorage
              </code>
              :
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
              <li>
                <strong className="text-foreground">Theme preference</strong>{" "}
                (light or dark) — stored under the key{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  json-viewer-theme
                </code>
              </li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              This data never leaves your device and can be cleared at any time
              through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Hosting & Analytics</h2>
            <p className="text-muted-foreground leading-relaxed">
              JSON Prism is a static site hosted on a third-party platform
              (e.g., Vercel or Netlify). These providers may collect standard
              server access logs (IP address, browser user-agent, page
              requested) as part of normal infrastructure operation. This data
              is governed by the hosting provider's own privacy policy and is
              not accessible to or controlled by JSON Prism.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              Third-Party Services
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              JSON Prism does not integrate any third-party analytics, tracking
              pixels, advertising networks, or user-profiling services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              JSON Prism does not knowingly collect any personal information
              from anyone, including children under the age of 13. Because no
              data is collected, the app is safe for general use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              Changes to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Privacy Policy occasionally. Any changes will
              be reflected by an updated "Last updated" date at the top of this
              page. Continued use of the app after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please open
              an issue on the project's GitHub repository.
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
            href="/terms"
            className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors"
          >
            Terms & Conditions
          </Link>
        </div>
      </main>
    </div>
  );
}
