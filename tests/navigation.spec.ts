import { expect, test, type Page } from '@playwright/test';

async function expectTargetBelowHeader(page: Page, targetId: string) {
  await expect.poll(async () => page.evaluate((id) => {
    const target = document.getElementById(id);
    const header = document.querySelector('header');
    if (!target || !header) return null;

    const targetTop = target.getBoundingClientRect().top;
    const headerBottom = header.getBoundingClientRect().bottom;
    return { targetTop, headerBottom, viewportHeight: window.innerHeight };
  }, targetId)).not.toBeNull();

  const position = await page.evaluate((id) => {
    const target = document.getElementById(id)!;
    const header = document.querySelector('header')!;
    return {
      targetTop: target.getBoundingClientRect().top,
      headerBottom: header.getBoundingClientRect().bottom,
      viewportHeight: window.innerHeight,
    };
  }, targetId);

  expect(position.targetTop).toBeGreaterThanOrEqual(position.headerBottom - 1);
  expect(position.targetTop).toBeLessThan(position.viewportHeight * 0.75);
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('constrained showcase keeps long-project CTAs inside the sticky stage', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) <= 1000, 'Sticky showcase is desktop-only.');
  await page.setViewportSize({ width: 1600, height: 990 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('[data-filter="games"]').click();
  await page.evaluate(() => {
    const show = document.querySelector<HTMLElement>('[data-show]')!;
    const sticky = show.querySelector<HTMLElement>('.show-sticky')!;
    const start = show.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo(0, start + (show.offsetHeight - sticky.offsetHeight) / 2);
  });

  const cta = page.locator('[data-cat="games"]').nth(1).locator('a.btn');
  await expect(cta).toBeVisible();
  const bounds = await page.evaluate(() => {
    const cta = document.querySelectorAll<HTMLElement>('[data-cat="games"] a.btn')[1];
    const sticky = document.querySelector<HTMLElement>('.show-sticky')!;
    return { ctaBottom: cta.getBoundingClientRect().bottom, stickyBottom: sticky.getBoundingClientRect().bottom };
  });
  expect(bounds.ctaBottom).toBeLessThanOrEqual(bounds.stickyBottom - 24);
});

test('every home-page hash link reaches its target below the sticky header', async ({ page }) => {
  await page.goto('/');

  const links = await page.locator('a[href^="#"]').evaluateAll((anchors) =>
    anchors.map((anchor) => ({
      href: anchor.getAttribute('href')!,
      targetId: anchor.getAttribute('href')!.slice(1),
    })),
  );

  for (const { href, targetId } of links) {
    await page.goto('/');
    const link = page.locator(`a[href="${href}"]`).first();
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await expect(page).toHaveURL(new RegExp(`${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));

    if (targetId === 'top') {
      await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThanOrEqual(1);
    } else {
      await expectTargetBelowHeader(page, targetId);
    }
  }
});

test('archive navigation links load home anchors with the same header offset', async ({ page }) => {
  await page.goto('/archive/');

  const links = await page.locator('a[href^="/#"]').evaluateAll((anchors) =>
    [...new Set(anchors.map((anchor) => anchor.getAttribute('href')!))],
  );

  for (const href of links) {
    const targetId = href.slice(2);
    await page.goto('/archive/');
    await page.locator(`a[href="${href}"]`).first().click();
    await expect(page).toHaveURL(new RegExp(`${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
    await expectTargetBelowHeader(page, targetId);
  }
});

test('article table-of-contents links keep headings clear of the sticky header', async ({ page }) => {
  await page.goto('/archive/spatial-partitioning-part-1/');

  const links = await page.locator('[data-toc]').evaluateAll((anchors) =>
    anchors.map((anchor) => anchor.getAttribute('href')!),
  );

  for (const href of links) {
    const targetId = href.slice(1);
    await page.goto('/archive/spatial-partitioning-part-1/');
    await page.locator(`[data-toc="${targetId}"]`).click();
    await expect(page).toHaveURL(new RegExp(`${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
    await expectTargetBelowHeader(page, targetId);
  }
});

test('every generated internal route resolves successfully', async ({ page }) => {
  const pages = ['/', '/archive/', '/archive/spatial-partitioning-part-1/', '/archive/spatial-partitioning-part-2/'];
  const internalRoutes = new Set(pages);

  for (const path of pages) {
    await page.goto(path);
    const hrefs = await page.locator('a[href]').evaluateAll((anchors) =>
      anchors.map((anchor) => anchor.getAttribute('href')!),
    );

    for (const href of hrefs) {
      const url = new URL(href, page.url());
      if (url.origin === new URL(page.url()).origin && !url.hash) internalRoutes.add(url.pathname);
    }
  }

  for (const path of internalRoutes) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
  }
});

test('every series continuation links back to its previous part', async ({ page }) => {
  const continuations = [
    ['spatial-partitioning-part-2', 'spatial-partitioning-part-1'],
    ['pixel-shaders-part-2', 'pixel-shaders-part-1'],
    ['pixel-shaders-part-3', 'pixel-shaders-part-2'],
    ['pixel-shaders-part-4', 'pixel-shaders-part-3'],
    ['pixel-shaders-part-5', 'pixel-shaders-part-4'],
  ];

  for (const [current, previous] of continuations) {
    await page.goto(`/archive/${current}/`);
    await expect(page.locator('.series-back')).toHaveAttribute('href', `/archive/${previous}/`);
  }
});

test('every pixel shader article has an interactive, rendered demo', async ({ page }) => {
  const demosByPart = [
    [['flash', 'where-the-mix-amount-comes-from']],
    [['pulse', 'timing-belongs-outside-the-shader']],
    [['outline', 'costs-and-limits']],
    [['dissolve', 'choosing-noise-that-fits-the-effect']],
    [['light', 'distortion-changes-where-we-sample'], ['water', 'a-reusable-mental-model']],
  ];

  for (let part = 1; part <= 5; part++) {
    await page.goto(`/archive/pixel-shaders-part-${part}/`);
    for (const [effect, nextSectionId] of demosByPart[part - 1]) {
      const demo = page.locator(`[data-shader-demo="${effect}"]`);
      const canvas = demo.locator('canvas');
      const slider = demo.locator('input[type="range"]');
      const output = demo.locator('output');

      await expect(demo).toBeVisible();
      expect(await demo.evaluate((element, nextSection) => {
        const nextHeading = document.getElementById(nextSection);
        return element.parentElement?.classList.contains('prose')
          && Boolean(nextHeading && element.compareDocumentPosition(nextHeading) & Node.DOCUMENT_POSITION_FOLLOWING);
      }, nextSectionId)).toBe(true);
      await expect.poll(() => canvas.evaluate((element) => {
        const context = (element as HTMLCanvasElement).getContext('2d')!;
        const { data } = context.getImageData(0, 0, 480, 300);
        return data.some((value, index) => index % 4 === 3 && value > 0);
      })).toBe(true);

      const before = await output.textContent();
      await slider.evaluate((element) => {
        const input = element as HTMLInputElement;
        input.value = input.value === input.max ? input.min : input.max;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
      await expect(output).not.toHaveText(before ?? '');
    }
  }
});
