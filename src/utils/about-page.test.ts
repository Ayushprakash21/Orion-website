import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Orion-9 About Page & Footer Column Replacement Test Suite', async (t) => {
  const footerSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/Footer.tsx'),
    'utf-8'
  );
  const aboutSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/about/AboutPage.tsx'),
    'utf-8'
  );
  const appSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/App.tsx'),
    'utf-8'
  );

  await t.test('1. Footer has removed the ACCOUNT column header and links from column 4', () => {
    // Column 4 should not be Account
    assert.ok(
      !footerSource.includes('{/* Column 4: ACCOUNT */}'),
      'Column 4 comment should no longer be ACCOUNT'
    );
    assert.ok(
      !footerSource.includes('<h3 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--orion-text-muted)] mb-4">\n                Account\n              </h3>'),
      'Footer should not have Account heading'
    );
  });

  await t.test('2. Footer has About Orion-9 in column 4 with all 6 required links', () => {
    assert.ok(
      footerSource.includes('About Orion-9'),
      'Footer must contain About Orion-9 column title'
    );
    assert.ok(
      footerSource.includes('/about'),
      'Footer must contain /about link'
    );
    assert.ok(
      footerSource.includes('/about#why-orion-9'),
      'Footer must contain /about#why-orion-9 link'
    );
    assert.ok(
      footerSource.includes('/about#system-architecture'),
      'Footer must contain /about#system-architecture link'
    );
    assert.ok(
      footerSource.includes('/about#core-principles'),
      'Footer must contain /about#core-principles link'
    );
    assert.ok(
      footerSource.includes('/about#whats-new'),
      'Footer must contain /about#whats-new link'
    );
    assert.ok(
      footerSource.includes('/docs'),
      'Footer must contain /docs Help & Documentation link'
    );
  });

  await t.test('3. App.tsx routes /about to AboutPage and handles anchor scrolling', () => {
    assert.ok(
      appSource.includes("currentPath === '/about' || currentPath.startsWith('/about')"),
      'App.tsx must route /about to AboutPage'
    );
    assert.ok(
      appSource.includes('<AboutPage'),
      'App.tsx must render AboutPage component'
    );
  });

  await t.test('4. AboutPage contains all required sections from repository source of truth', () => {
    const requiredSections = [
      'id="overview"',
      'id="why-orion-9"',
      'id="the-idea"',
      'id="created-by"',
      'id="core-principles"',
      'id="system-architecture"',
      'id="whats-new"',
      'id="documentation"',
    ];
    for (const sectionId of requiredSections) {
      assert.ok(
        aboutSource.includes(sectionId),
        `AboutPage must contain section with ${sectionId}`
      );
    }
  });

  await t.test('5. Creator attribution strictly identifies Ayush Prakash as Creator & Architect', () => {
    assert.ok(
      aboutSource.includes('Ayush Prakash'),
      'AboutPage must identify creator as Ayush Prakash'
    );
    assert.ok(
      aboutSource.includes('What if the supply chain had an operating system?'),
      'AboutPage must include the foundational question'
    );
    assert.ok(
      /creators*(&|&amp;)s*supplys*chains*oss*architect/i.test(aboutSource),
      'AboutPage must include the creator & architect title'
    );
    // Explicitly verify internal technical comments and maintainer labels are REMOVED from public UI
    assert.ok(
      !aboutSource.includes('Primary System Maintainer'),
      'AboutPage must not contain Primary System Maintainer'
    );
    assert.ok(
      !aboutSource.includes('Repository Authority:'),
      'AboutPage must not expose Repository Authority in public UI'
    );
    assert.ok(
      !aboutSource.includes('Verified Source'),
      'AboutPage must not expose Verified Source badge in public UI'
    );
  });

  await t.test('6. 14 Core Engines accurately distinguish implemented vs partially implemented status', () => {
    assert.ok(
      aboutSource.includes("name: 'CAUSAL ENGINE', status: 'PARTIALLY IMPLEMENTED'"),
      'Causal Engine must be marked as PARTIALLY IMPLEMENTED'
    );
    assert.ok(
      aboutSource.includes("name: 'DATA ENGINE', status: 'IMPLEMENTED'"),
      'Data Engine must be marked as IMPLEMENTED'
    );
    assert.ok(
      aboutSource.includes("name: 'WORLD MODEL', status: 'IMPLEMENTED'"),
      'World Model must be marked as IMPLEMENTED'
    );
    assert.ok(
      aboutSource.includes("name: 'AUDIT ENGINE', status: 'IMPLEMENTED'"),
      'Audit Engine must be marked as IMPLEMENTED'
    );
  });

  await t.test('7. The 10-step closed operating loop is fully represented', () => {
    const steps = [
      'SENSE',
      'UNDERSTAND',
      'PREDICT',
      'SIMULATE',
      'DECIDE',
      'APPROVE',
      'ACT',
      'VERIFY',
      'REMEMBER',
      'LEARN',
    ];
    for (const step of steps) {
      assert.ok(
        aboutSource.includes(step),
        `Operating loop must contain ${step}`
      );
    }
  });

  await t.test('8. The 7 core principles are accurately documented', () => {
    const principles = [
      'One Operating Environment',
      'Data Connected',
      'Events Drive Awareness',
      'AI Governed',
      'Humans in Control',
      'Decisions Create Outcomes',
      'System Learns',
    ];
    for (const principle of principles) {
      assert.ok(
        aboutSource.includes(principle),
        `Core principles must contain ${principle}`
      );
    }
  });
});
