'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface FaqGroup {
  category: { id: string; name: string; slug: string } | null;
  faqs: { id: string; question: string; answer: string }[];
}

export default function PublicFaqsPage() {
  const [groups, setGroups] = useState<FaqGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/faqs');
        if (res.ok) setGroups(await res.json());
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  const totalFaqs = groups.reduce((sum, g) => sum + g.faqs.length, 0);

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="border-b border-[#2C2C2C]/8 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link href="/" className="text-xs text-[#C9A86C] tracking-[0.2em] uppercase hover:text-[#B8975B]">
            BM Decoracion
          </Link>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl text-[#2C2C2C] mt-4">
            Frequently Asked Questions
          </h1>
          <p className="text-[#2C2C2C]/50 mt-2 max-w-xl">
            Everything you need to know about our paints, services, and ordering process.
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        {loading ? (
          <p className="text-center text-[#2C2C2C]/40 text-sm py-12">Loading...</p>
        ) : totalFaqs === 0 ? (
          <div className="text-center py-20">
            <p className="font-[family-name:var(--font-playfair)] text-2xl text-[#2C2C2C]/20">
              No FAQs yet
            </p>
            <p className="text-sm text-[#2C2C2C]/40 mt-2">Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {groups.map((group, gi) => (
              <section key={group.category?.id || `uncategorized-${gi}`}>
                {group.category && (
                  <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-[#2C2C2C] mb-4">
                    {group.category.name}
                  </h2>
                )}
                <div className="space-y-0 border border-[#2C2C2C]/8 rounded-xl overflow-hidden bg-white">
                  {group.faqs.map((faq, fi) => {
                    const isOpen = openId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className={fi > 0 ? 'border-t border-[#2C2C2C]/8' : ''}
                      >
                        <button
                          onClick={() => toggle(faq.id)}
                          className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#FAF8F5]/50 transition-colors"
                        >
                          <span className="text-[#2C2C2C] font-medium text-sm">
                            {faq.question}
                          </span>
                          <svg
                            className={`w-5 h-5 text-[#C9A86C] shrink-0 transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-5">
                            <div
                              className="prose prose-sm max-w-none text-[#2C2C2C]/70
                                [&_a]:text-[#C9A86C] [&_a]:underline [&_a]:underline-offset-2
                                [&_h2]:font-[family-name:var(--font-playfair)] [&_h2]:text-lg [&_h2]:mt-4 [&_h2]:mb-2
                                [&_h3]:font-[family-name:var(--font-playfair)] [&_h3]:text-base [&_h3]:mt-3 [&_h3]:mb-1
                                [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2
                                [&_blockquote]:border-l-2 [&_blockquote]:border-[#C9A86C] [&_blockquote]:pl-4 [&_blockquote]:italic"
                              dangerouslySetInnerHTML={{ __html: faq.answer }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2C2C2C]/8 py-8 text-center">
        <Link href="/" className="text-sm text-[#C9A86C] hover:text-[#B8975B] transition-colors">
          &larr; Back to BM Decoracion
        </Link>
      </footer>
    </div>
  );
}
