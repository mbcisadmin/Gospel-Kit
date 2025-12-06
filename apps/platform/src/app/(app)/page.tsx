"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
import { useEffect } from "react";

/**
 * Dashboard / Home Page
 *
 * This is the main landing page for authenticated users.
 * It welcomes users and provides links to available micro-apps.
 *
 * In the future, you can:
 * - Load available apps from a database table
 * - Show app cards with icons and descriptions
 * - Filter apps based on user permissions
 */
export default function Dashboard() {
  useEffect(() => {
    document.title = "Ministry Apps | Your Church";
  }, []);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Ministry Applications
          </h1>
          <p className="text-muted-foreground">
            Welcome to your church&apos;s apps platform
          </p>
        </div>

        {/* Example Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Link href="/example">
            <div className="group border border-border bg-card hover:border-primary hover:shadow-lg transition-all p-6 cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Example App</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                A simple example showing Gospel Kit patterns
              </p>
            </div>
          </Link>

          <div className="border border-dashed border-border bg-card/50 p-6 flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground mb-2">Add more apps here</p>
            <p className="text-xs text-muted-foreground">
              Use Claude skills like <code>/new-micro-app</code> to scaffold new applications
            </p>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Check out the <Link href="/example" className="text-primary hover:underline">Example App</Link> to see Gospel Kit patterns</li>
            <li>• Review the documentation in <code>README.md</code> and <code>SETUP.md</code></li>
            <li>• Use Claude skills to scaffold new features: <code>/new-micro-app</code>, <code>/new-api-route</code>, etc.</li>
            <li>• Customize the branding colors in <code>globals.css</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
