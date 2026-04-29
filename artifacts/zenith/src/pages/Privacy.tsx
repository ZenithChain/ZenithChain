import { Layout } from '@/components/Layout'

export default function Privacy() {
  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <header className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Legal</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mt-3">Last updated: April 29, 2026</p>
        </header>

        <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We collect the minimum data necessary to operate the Genesis
              Campaign:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li><strong>Wallet address</strong> — public on the blockchain by nature.</li>
              <li><strong>IP address</strong> — used for rate limiting and anti-sybil checks; not displayed publicly.</li>
              <li><strong>Mission progress, ZP balances, streaks</strong> — stored against your wallet address.</li>
              <li><strong>Social handles</strong> — only if you voluntarily connect X or Discord for social missions.</li>
              <li><strong>Referral codes</strong> — to attribute referrals between wallets.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. What We Do NOT Collect</h2>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>Private keys, seed phrases, or wallet passwords (impossible — we never see them).</li>
              <li>Real-name KYC, government ID, or biometric data.</li>
              <li>Email addresses (unless you opt in to a future newsletter).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. How We Use Information</h2>
            <ul className="list-disc pl-6 space-y-1.5 text-muted-foreground">
              <li>Operate missions, faucet, check-ins, leaderboard, and mystery boxes.</li>
              <li>Detect and prevent sybil farming, abuse, and exploitation.</li>
              <li>Compute Reputation Score (RS) from public on-chain heuristics.</li>
              <li>Communicate service announcements via official channels.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell personal data. Wallet addresses, ZP balances, tier,
              and final score are public on the leaderboard. We may share
              aggregated, non-identifying analytics. We may disclose data if
              required by law or to enforce our Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Cookies & Local Storage</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use a session cookie and browser local storage to remember your
              wallet connection, referral code, and UI preferences. We do not
              use third-party advertising trackers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use industry-standard practices including HTTPS encryption and
              session signing. No system is 100% secure. You are responsible for
              securing your own wallet.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may disconnect your wallet at any time. You may request
              deletion of off-chain records (mission completions, IP logs)
              tied to your wallet by contacting us — note that public
              blockchain transactions cannot be deleted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Children</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is not directed at users under 18. We do not knowingly
              collect data from minors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. International Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Data may be processed in jurisdictions different from yours. By
              using the Service, you consent to such transfers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Changes</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Policy. Material changes will be highlighted
              on the platform. Continued use means you accept the revised Policy.
            </p>
          </section>
        </article>
      </div>
    </Layout>
  )
}
