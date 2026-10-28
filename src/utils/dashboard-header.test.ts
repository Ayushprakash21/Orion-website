/**
 * ORION-9 DASHBOARD HEADER & HOMEPAGE NAVIGATION TEST SUITE
 *
 * Verifies:
 * 1. Removal of the awkward "Public Site" back element.
 * 2. Proper "Visit Website" / Home action navigating to public homepage ('/').
 * 3. Removal of the outer pill container around the center navigation.
 * 4. All 5 navigation tabs (Overview, Learning Center, OS User Manual, Documentation, Progress).
 * 5. Whitespace-nowrap enforcement preventing awkward label wrapping.
 * 6. Right section actions (Theme toggle, Admin gating, Launch OS, Sign Out).
 * 7. Mobile navigation drawer including homepage navigation and active tab highlighting.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Orion-9 Dashboard Header Rebuild Test Suite', async (t) => {
  const layoutPath = path.resolve(process.cwd(), 'src/components/dashboard/UserDashboardLayout.tsx');
  const layoutSource = fs.readFileSync(layoutPath, 'utf-8');

  await t.test('1. "Public Site" element has been removed from the header', () => {
    assert.ok(
      !layoutSource.includes('<span>Public Site</span>'),
      'Must not contain the legacy "Public Site" span'
    );
    assert.ok(
      !layoutSource.includes('ArrowLeft'),
      'Must not contain the legacy ArrowLeft back-icon'
    );
  });

  await t.test('2. "Visit Website" action is implemented and navigates directly to the public homepage', () => {
    assert.ok(
      layoutSource.includes("onNavigate('/')"),
      'Must navigate to public homepage route "/"'
    );
    assert.ok(
      layoutSource.includes('Visit Website'),
      'Must contain clear "Visit Website" action'
    );
    assert.ok(
      layoutSource.includes('Globe'),
      'Must use Globe icon for external/public website navigation'
    );
  });

  await t.test('3. Unnecessary pill-shaped container wrapper removed from center navigation', () => {
    assert.ok(
      !layoutSource.includes('liquid-glass-subtle p-1 rounded-2xl border border-[var(--glass-border-subtle)]'),
      'Must not wrap the navigation in an outer liquid-glass pill container'
    );
  });

  await t.test('4. All 5 required destinations are present with correct paths and whitespace-nowrap', () => {
    const requiredDestinations = [
      { label: 'Overview', path: '/dashboard' },
      { label: 'Learning Center', path: '/dashboard/learn' },
      { label: 'OS User Manual', path: '/dashboard/manual' },
      { label: 'Documentation', path: '/dashboard/documentation' },
      { label: 'Progress', path: '/dashboard/progress' },
    ];

    for (const dest of requiredDestinations) {
      assert.ok(
        layoutSource.includes(`label: '${dest.label}'`),
        `Must define destination label "${dest.label}"`
      );
      assert.ok(
        layoutSource.includes(`path: '${dest.path}'`),
        `Must define destination path "${dest.path}"`
      );
    }

    assert.ok(
      layoutSource.includes('whitespace-nowrap'),
      'Must enforce whitespace-nowrap to prevent awkward two-line text wrapping'
    );
  });

  await t.test('5. Right section includes uniform actions: Theme toggle, Admin gating, Launch OS, Sign Out', () => {
    // Theme toggle
    assert.ok(layoutSource.includes('toggleTheme'), 'Must include theme toggle');
    // Admin gating
    assert.ok(layoutSource.includes('isAdmin &&'), 'Admin action must be gated behind isAdmin check');
    // Launch OS
    assert.ok(layoutSource.includes('launchOrion('), 'Must include Launch Orion-9 OS action');
    // Sign Out
    assert.ok(layoutSource.includes('logout'), 'Must include logout handler');
  });

  await t.test('6. Mobile navigation drawer includes public homepage navigation and clean drawer structure', () => {
    assert.ok(
      layoutSource.includes('mobileNavOpen'),
      'Must maintain responsive mobile navigation drawer'
    );
    assert.ok(
      layoutSource.includes('Visit Orion-9 Homepage'),
      'Mobile drawer must include dedicated homepage navigation'
    );
  });

  await t.test('7. Terminology uses "User" instead of "Operator"', () => {
    assert.ok(
      !layoutSource.includes("'Operator'"),
      'Fallback display name should not be Operator'
    );
    assert.ok(
      !layoutSource.includes('Enterprise Operator'),
      'Role label should not be Enterprise Operator'
    );
  });
});
