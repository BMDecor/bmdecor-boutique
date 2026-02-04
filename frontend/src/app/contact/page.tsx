'use client';

import { useState } from 'react';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success('Message sent! We\u2019ll be in touch shortly.');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-8 lg:px-16 pt-16 pb-8">
        <p className="text-[#C9A86C] text-sm tracking-[0.2em] uppercase mb-4">Get In Touch</p>
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl lg:text-5xl text-[#2C2C2C] tracking-tight mb-4">
          Visit Us
        </h1>
        <p className="text-[#2C2C2C]/60 text-lg max-w-2xl">
          We&apos;d love to hear from you. Whether you&apos;re planning a project or simply
          exploring our palette, our team is here to help.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-8 lg:px-16 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left — Contact Info + Map */}
          <div className="space-y-8">
            {/* Contact Details */}
            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-8 space-y-5">
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-[#2C2C2C]">
                BM Decoración
              </h2>
              <div className="space-y-3 text-sm text-[#2C2C2C]/70">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#C9A86C] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-[#2C2C2C]">Address</p>
                    <p>Calle Dublín, 21</p>
                    <p>PG. IND. San Pedro de Alcántara</p>
                    <p>29670 Marbella, Málaga, Spain</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#C9A86C] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="font-medium text-[#2C2C2C]">Phone</p>
                    <a href="tel:+34951127003" className="hover:text-[#C9A86C] transition-colors">
                      +34 951 127 003
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#C9A86C] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-[#2C2C2C]">Email</p>
                    <a href="mailto:info@bmdecor.es" className="hover:text-[#C9A86C] transition-colors">
                      info@bmdecor.es
                    </a>
                  </div>
                </div>
              </div>

              {/* WhatsApp Button */}
              <a
                href="https://wa.me/34951127003"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white text-sm font-medium rounded-lg hover:bg-[#20bd5a] transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>

            {/* Google Map */}
            <div className="rounded-2xl overflow-hidden border border-[#E8E2D9] h-[300px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3224.5!2d-4.98!3d36.49!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd72d7fdb909e359%3A0x2a446965d0f7ee0!2sCalle%20Dubl%C3%ADn%2C%2021%2C%2029670%20Marbella%2C%20M%C3%A1laga!5e0!3m2!1sen!2ses!4v1700000000000!5m2!1sen!2ses"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="BM Decoración location"
              />
            </div>
          </div>

          {/* Right — Contact Form */}
          <div className="bg-white rounded-2xl border border-[#E8E2D9] p-8">
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-[#2C2C2C] mb-2">
              Send Us a Message
            </h2>
            <p className="text-sm text-[#2C2C2C]/50 mb-8">
              We typically respond within one business day.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2C2C2C]">Name</label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  className="bg-[#FAF8F5] border-[#E8E2D9]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2C2C2C]">Email</label>
                <Input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="bg-[#FAF8F5] border-[#E8E2D9]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2C2C2C]">Phone</label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+34 ..."
                  className="bg-[#FAF8F5] border-[#E8E2D9]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#2C2C2C]">Message</label>
                <textarea
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us about your project..."
                  rows={5}
                  className="w-full rounded-md border border-[#E8E2D9] bg-[#FAF8F5] px-3 py-2 text-sm text-[#2C2C2C] placeholder:text-[#2C2C2C]/30 focus:outline-none focus:ring-2 focus:ring-[#C9A86C]/30 focus:border-[#C9A86C]"
                />
              </div>
              <Button
                type="submit"
                disabled={sending}
                className="w-full bg-[#2C2C2C] text-white hover:bg-[#1a1a1a] disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
              <p className="text-xs text-[#2C2C2C]/40 text-center">
                By submitting, you agree to our{' '}
                <a href="/privacy-policy" className="text-[#C9A86C] hover:underline">Privacy Policy</a>.
              </p>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
