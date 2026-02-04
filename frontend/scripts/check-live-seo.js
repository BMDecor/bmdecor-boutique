#!/usr/bin/env node

/**
 * SEO Verification Script
 *
 * Fetches a URL and validates:
 * - Title tag
 * - Meta description
 * - JSON-LD schema
 * - Canonical URL
 * - Open Graph tags
 *
 * Usage: node scripts/check-live-seo.js <url>
 * Example: node scripts/check-live-seo.js https://frontend-five-beige-41.vercel.app/color/bm-chantilly-lace-oc-65
 */

const https = require('https');
const http = require('http');

const url = process.argv[2];

if (!url) {
  console.error('Usage: node scripts/check-live-seo.js <url>');
  console.error('Example: node scripts/check-live-seo.js https://example.com/color/bm-chantilly-lace-oc-65');
  process.exit(1);
}

function fetch(urlString) {
  return new Promise((resolve, reject) => {
    const protocol = urlString.startsWith('https') ? https : http;
    protocol.get(urlString, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        return resolve(fetch(res.headers.location));
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

function extractTag(html, regex) {
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

function extractJsonLd(html) {
  const regex = /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  const schemas = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      schemas.push(JSON.parse(match[1]));
    } catch (e) {
      schemas.push({ error: 'Invalid JSON', raw: match[1].slice(0, 100) });
    }
  }
  return schemas;
}

async function checkSEO() {
  console.log('\n🔍 SEO Verification Report');
  console.log('=' .repeat(60));
  console.log(`📍 URL: ${url}\n`);

  try {
    const { status, body } = await fetch(url);
    console.log(`📡 HTTP Status: ${status}\n`);

    if (status !== 200) {
      console.error(`❌ Error: Expected status 200, got ${status}`);
      process.exit(1);
    }

    // Title
    const title = extractTag(body, /<title[^>]*>([^<]+)<\/title>/i);
    console.log('📌 Title Tag:');
    if (title) {
      console.log(`   ✅ "${title}"`);
      console.log(`   Length: ${title.length} chars (recommended: 50-60)\n`);
    } else {
      console.log('   ❌ Missing title tag\n');
    }

    // Meta Description
    const description = extractTag(body, /<meta\s+name="description"\s+content="([^"]+)"/i)
      || extractTag(body, /<meta\s+content="([^"]+)"\s+name="description"/i);
    console.log('📝 Meta Description:');
    if (description) {
      console.log(`   ✅ "${description.slice(0, 100)}${description.length > 100 ? '...' : ''}"`);
      console.log(`   Length: ${description.length} chars (recommended: 150-160)\n`);
    } else {
      console.log('   ❌ Missing meta description\n');
    }

    // Canonical
    const canonical = extractTag(body, /<link\s+rel="canonical"\s+href="([^"]+)"/i)
      || extractTag(body, /<link\s+href="([^"]+)"\s+rel="canonical"/i);
    console.log('🔗 Canonical URL:');
    if (canonical) {
      console.log(`   ✅ ${canonical}\n`);
    } else {
      console.log('   ⚠️  No canonical tag found\n');
    }

    // Open Graph
    console.log('📱 Open Graph Tags:');
    const ogTitle = extractTag(body, /<meta\s+property="og:title"\s+content="([^"]+)"/i);
    const ogDesc = extractTag(body, /<meta\s+property="og:description"\s+content="([^"]+)"/i);
    const ogUrl = extractTag(body, /<meta\s+property="og:url"\s+content="([^"]+)"/i);
    const ogImage = extractTag(body, /<meta\s+property="og:image"\s+content="([^"]+)"/i);

    if (ogTitle) console.log(`   og:title: ✅ "${ogTitle.slice(0, 50)}..."`);
    else console.log('   og:title: ❌ Missing');
    if (ogDesc) console.log(`   og:description: ✅ Found`);
    else console.log('   og:description: ⚠️  Missing');
    if (ogUrl) console.log(`   og:url: ✅ ${ogUrl}`);
    else console.log('   og:url: ⚠️  Missing');
    if (ogImage) console.log(`   og:image: ✅ ${ogImage.slice(0, 60)}...`);
    else console.log('   og:image: ⚠️  Missing');
    console.log();

    // JSON-LD Schema
    console.log('📊 JSON-LD Schema:');
    const schemas = extractJsonLd(body);
    if (schemas.length > 0) {
      schemas.forEach((schema, i) => {
        if (schema.error) {
          console.log(`   Schema ${i + 1}: ❌ ${schema.error}`);
        } else {
          console.log(`   Schema ${i + 1}: ✅ @type: ${schema['@type']}`);
          if (schema['@type'] === 'Product') {
            console.log(`      - name: ${schema.name || 'N/A'}`);
            console.log(`      - sku: ${schema.sku || 'N/A'}`);
            console.log(`      - brand: ${schema.brand?.name || 'N/A'}`);
            if (schema.offers) {
              console.log(`      - price: €${schema.offers.price} ${schema.offers.priceCurrency}`);
              console.log(`      - availability: ${schema.offers.availability?.split('/').pop() || 'N/A'}`);
            }
          }
        }
      });
    } else {
      console.log('   ⚠️  No JSON-LD schemas found');
    }
    console.log();

    // Summary
    console.log('=' .repeat(60));
    const checks = [
      { name: 'Title', pass: !!title },
      { name: 'Description', pass: !!description },
      { name: 'Canonical', pass: !!canonical },
      { name: 'OG Tags', pass: !!(ogTitle && ogUrl) },
      { name: 'JSON-LD', pass: schemas.length > 0 && !schemas[0]?.error },
    ];
    const passed = checks.filter(c => c.pass).length;
    console.log(`\n🎯 Score: ${passed}/${checks.length} checks passed`);
    checks.forEach(c => console.log(`   ${c.pass ? '✅' : '❌'} ${c.name}`));

    if (passed === checks.length) {
      console.log('\n🎉 All SEO checks passed!');
    } else {
      console.log('\n⚠️  Some SEO elements are missing or incomplete.');
    }
    console.log();

  } catch (error) {
    console.error(`\n❌ Error fetching URL: ${error.message}`);
    process.exit(1);
  }
}

checkSEO();
