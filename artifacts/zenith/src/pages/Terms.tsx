import { Layout } from '@/components/Layout'

export default function Terms() {
  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <header className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Legal</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mt-3">Last updated: April 29, 2026</p>
        </header>

        <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using the Zenith Genesis Campaign platform (the
              "Service"), you agree to be bound by these Terms of Service. If you
              do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Testnet Nature</h2>
            <p className="text-muted-foreground leading-relaxed">
              Zenith is a public testnet. ZTH tokens, Zenith Points (ZP),
              Activity Score (AS), Reputation Score (RS), and Mystery Box rewards
              have <strong>no real-world monetary value</strong>, are not
              securities, and may be reset, modified, or revoked at any time.
              Participation does not guarantee any future reward, mainnet token,
              or allocation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed">
              You must be at least 18 years old and legally capable of entering
              into a binding agreement. You may not use the Service if you are
              located in, or a citizen or resident of, a jurisdiction subject to
              comprehensive sanctions or where blockchain participation is
              prohibited by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Wallet & Account</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are solely responsible for safeguarding your wallet, private
              keys, and seed phrases. We will never ask for your private keys.
              Lost access to your wallet means lost access to any associated
              testnet rewards.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Anti-Sybil & Fair Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              Operating multiple wallets to inflate rewards, automating
              interactions, exploiting bugs, or manipulating mission verification
              is prohibited. Suspect activity may result in score reduction,
              tier downgrade, or permanent disqualification at our sole
              discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Mission Verification</h2>
            <p className="text-muted-foreground leading-relaxed">
              Onchain missions are verified by reading public blockchain data.
              Social missions require connecting an account (X, Discord) and may
              be verified manually or automatically. Verification results are
              final unless we determine an error has occurred.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is provided "as is" and "as available". We may modify,
              suspend, or terminate the Service or any feature at any time
              without notice or liability.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Disclaimers</h2>
            <p className="text-muted-foreground leading-relaxed">
              We disclaim all warranties, express or implied, including
              merchantability, fitness for purpose, and non-infringement. We are
              not responsible for losses resulting from network outages, smart
              contract bugs, wallet errors, or third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, our liability for any
              claim arising from the Service is limited to USD $100 in the
              aggregate. We are not liable for indirect, incidental,
              consequential, or punitive damages.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Changes</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms at any time. Continued use of the
              Service after changes means you accept the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">11. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms, reach us via the official Zenith
              Discord or X account linked from the platform.
            </p>
          </section>
        </article>
      </div>
    </Layout>
  )
}
