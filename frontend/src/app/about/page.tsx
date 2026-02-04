import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata = {
  title: 'The Atelier — BM Decoración',
  description: 'The Art of Color in Andalucía. Discover how BM Decoración brings world-class pigments to the unique light of Marbella.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Navbar />

      {/* Hero — Split Screen */}
      <section className="grid lg:grid-cols-2 min-h-[70vh]">
        {/* Left — Editorial Image */}
        <div className="relative h-[50vh] lg:h-auto">
          <Image
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80"
            alt="Sunlit Mediterranean villa interior with warm paint tones"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2C2C2C]/30 to-transparent lg:bg-gradient-to-l" />
        </div>

        {/* Right — Rich Text */}
        <div className="flex items-center px-8 lg:px-16 py-16 lg:py-24">
          <div className="max-w-lg">
            <p className="text-[#C9A86C] text-sm tracking-[0.2em] uppercase mb-4">Our Story</p>
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl lg:text-5xl xl:text-6xl text-[#2C2C2C] tracking-tight leading-tight mb-8">
              The Art of Color in Andalucía
            </h1>
            <div className="space-y-5 text-[#2C2C2C]/70 text-[15px] leading-relaxed">
              <p>
                In the brilliant light of southern Spain, color behaves differently. The same
                pigment that feels restrained in London becomes luminous against Marbella&apos;s
                whitewashed walls. At BM Decoración, we understand this transformation — because
                we&apos;ve spent years studying how the world&apos;s finest paints respond to
                the Andalucian sun.
              </p>
              <p>
                We bring together three houses of extraordinary heritage — <strong>Benjamin Moore</strong>,
                with its unrivaled color science and professional-grade technology;{' '}
                <strong>Farrow &amp; Ball</strong>, whose artisan pigments carry the depth of
                British tradition; and <strong>Little Greene</strong>, pioneers of eco-conscious
                formulation rooted in Georgian and Victorian craft.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-8 lg:px-16 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#C9A86C] text-sm tracking-[0.2em] uppercase mb-4">Our Mission</p>
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-[#2C2C2C] tracking-tight leading-tight mb-8">
                Beyond Paint. Architectural Finishes for Exceptional Spaces.
              </h2>
              <div className="space-y-5 text-[#2C2C2C]/70 text-[15px] leading-relaxed">
                <p>
                  We don&apos;t sell paint. We curate architectural finishes — the definitive surface
                  layer that shapes how a villa breathes, how a salon catches the evening light,
                  how a courtyard ages with the grace of the Mediterranean.
                </p>
                <p>
                  From the terraced estates of La Zagaleta to the beachfront residences of the
                  Golden Mile, our clients demand more than color. They demand a finish that
                  respects the architecture, complements the landscape, and endures the coastal
                  climate with elegance.
                </p>
                <p>
                  Our team provides personalized color consultancy, technical specification for
                  architects and interior designers, and a seamless procurement experience — from
                  our digital boutique to your door along the Costa del Sol.
                </p>
              </div>
            </div>
            <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80"
                alt="Premium paint samples arranged on marble surface"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Three Houses Strip */}
      <section className="bg-[#2C2C2C] py-20">
        <div className="max-w-7xl mx-auto px-8 lg:px-16">
          <p className="text-[#C9A86C] text-sm tracking-[0.2em] uppercase mb-4 text-center">Three Houses, One Vision</p>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl lg:text-4xl text-white tracking-tight text-center mb-16">
            The Finest Pigments Under One Roof
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                name: 'Benjamin Moore',
                desc: 'Professional-grade color technology. Gennex® colorant system delivers unmatched depth and fade resistance — engineered for the intense UV of coastal Andalucía.',
                href: '/benjamin-moore',
              },
              {
                name: 'Farrow & Ball',
                desc: 'Artisan pigments with extraordinary depth of color. Each shade is mixed in Dorset using rich, natural pigments that react beautifully to Mediterranean daylight.',
                href: '/farrow-and-ball',
              },
              {
                name: 'Little Greene',
                desc: 'British eco-heritage meets modern conscience. Water-based formulations with minimal VOCs, sourced from historical palettes spanning 300 years of British design.',
                href: '/little-greene',
              },
            ].map((house) => (
              <Link
                key={house.name}
                href={house.href}
                className="group p-8 rounded-xl border border-white/10 hover:border-[#C9A86C]/30 transition-colors"
              >
                <h3 className="font-[family-name:var(--font-playfair)] text-xl text-white mb-3 group-hover:text-[#C9A86C] transition-colors">
                  {house.name}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">{house.desc}</p>
                <span className="inline-block mt-4 text-[#C9A86C] text-sm group-hover:translate-x-1 transition-transform">
                  Explore Collection &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2C2C2C] mb-4">
            Visit Our Showroom
          </h2>
          <p className="text-[#2C2C2C]/60 mb-8">
            Experience our curated palette in person. Touch the finishes, see the colors in
            natural light, and speak with our team about your project.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-3 bg-[#2C2C2C] text-white text-sm font-medium rounded-lg hover:bg-[#1a1a1a] transition-colors"
          >
            Plan Your Visit
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
