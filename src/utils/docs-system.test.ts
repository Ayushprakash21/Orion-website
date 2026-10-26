import { describe, it } from 'node:test';
import assert from 'node:assert';
import featureCatalogData from '../data/docs/feature-catalog.json';
import navigationData from '../data/docs/navigation.json';
import coverageData from '../data/docs/coverage.json';
import articlesBundleData from '../data/docs/articles-bundle.json';

describe('Orion-9 Interactive Documentation System Validation', () => {
  it('1. verifies all navigation paths resolve to existing articles in the bundle', () => {
    const bundleKeys = Object.keys(articlesBundleData);
    assert.ok(bundleKeys.length >= 40, `Expected at least 40 articles, got ${bundleKeys.length}`);

    let resolvedCount = 0;
    navigationData.forEach((section) => {
      section.items.forEach((item) => {
        const key = item.path.replace(/^\/docs\//, '');
        assert.ok(
          (articlesBundleData as Record<string, string>)[key] !== undefined,
          `Navigation item ${item.title} (${item.path}) missing from articles-bundle.json`
        );
        resolvedCount++;
      });
    });

    assert.ok(resolvedCount >= 35, `Verified ${resolvedCount} navigation routes resolve successfully.`);
  });

  it('2. verifies feature catalog schema, unique IDs, and valid docPath references', () => {
    const seenIds = new Set<string>();
    const validCategories = [
      'Operating System',
      'Supply Chain',
      'AI Copilot',
      'Integration Fabric',
      'Data and Analytics',
      'Security and Administration',
      'Platform Architecture',
      'Desktop Applications',
    ];

    featureCatalogData.forEach((feat) => {
      // Unique ID check
      assert.ok(!seenIds.has(feat.id), `Duplicate feature ID detected: ${feat.id}`);
      seenIds.add(feat.id);

      // Category check
      assert.ok(
        validCategories.includes(feat.category),
        `Feature ${feat.id} has invalid category: ${feat.category}`
      );

      // Non-empty fields
      assert.ok(feat.name.length > 0, `Feature ${feat.id} missing name`);
      assert.ok(feat.description.length > 10, `Feature ${feat.id} missing description`);
      assert.ok(feat.sourceFiles.length > 0, `Feature ${feat.id} missing sourceFiles references`);

      // Doc path check
      const docKey = feat.docPath.replace(/^\/docs\//, '');
      assert.ok(
        (articlesBundleData as Record<string, string>)[docKey] !== undefined,
        `Feature ${feat.id} docPath ${feat.docPath} does not resolve to an article`
      );
    });
  });

  it('3. verifies client-side search index across articles and features', () => {
    const query = 'Available-to-Promise';
    const matches: string[] = [];

    // Search features
    featureCatalogData.forEach((f) => {
      if (f.name.includes(query) || f.description.includes(query)) {
        matches.push(f.name);
      }
    });

    // Search articles
    Object.entries(articlesBundleData).forEach(([key, content]) => {
      if (content.includes(query)) {
        matches.push(key);
      }
    });

    assert.ok(matches.length > 0, `Search for "${query}" should return results`);
  });

  it('4. verifies search handles special characters and empty results safely', () => {
    const specialChars = ['<script>', '@#$%^&*()', '][}{', "'; DROP TABLE;"];
    specialChars.forEach((q) => {
      const lower = q.toLowerCase();
      const filtered = featureCatalogData.filter(
        (f) => f.name.toLowerCase().includes(lower) || f.description.toLowerCase().includes(lower)
      );
      assert.strictEqual(filtered.length, 0, `Special query "${q}" should safely return 0 results`);
    });
  });

  it('5. verifies zero secret exposure across documentation bundles', () => {
    const bundleString = JSON.stringify(articlesBundleData);
    const catalogString = JSON.stringify(featureCatalogData);

    const secretPatterns = [
      /ghp_[a-zA-Z0-9]{36}/,
      /AIza[0-9A-Za-z-_]{35}/,
      /-----BEGIN PRIVATE KEY-----/,
      /sk_live_[0-9a-zA-Z]{24}/,
      /aws_secret_access_key/i,
    ];

    secretPatterns.forEach((pat) => {
      assert.ok(!pat.test(bundleString), `Potential secret detected in articles bundle matching ${pat}`);
      assert.ok(!pat.test(catalogString), `Potential secret detected in feature catalog matching ${pat}`);
    });
  });

  it('6. verifies coverage metrics match authoritative platform records', () => {
    assert.strictEqual(coverageData.totalModulesInventoried, 118);
    assert.strictEqual(coverageData.verifiedCoreEngines, 19);
    assert.strictEqual(coverageData.zeroOriginClientStorageFallbacks, 0);
    assert.ok(coverageData.documentedArticles >= 40);
  });
});
