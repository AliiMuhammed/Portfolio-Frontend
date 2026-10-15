import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import CvDownload, { cvDownloadUrl } from './CvDownload';
import { client } from '../../Client';
jest.mock('../../Client', () => ({client: {fetch: jest.fn()}}));
const local = '/Ali Muhammed Ahmed.pdf';
const asset = {url: `https://cdn.sanity.io/files/yv2hgb0y/production/${'a'.repeat(40)}.pdf`, mimeType: 'application/pdf', extension: 'pdf'};
let root, container;
beforeEach(() => { global.IS_REACT_ACT_ENVIRONMENT = true; client.fetch.mockReset().mockResolvedValue(null); container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container); });
afterEach(async () => { await act(async () => root.unmount()); container.remove(); delete global.IS_REACT_ACT_ENVIRONMENT; });
const render = async () => act(async () => root.render(<CvDownload />));
test('published PDF uses the fixed singleton, public CDN and native download filename', async () => {
  client.fetch.mockResolvedValue({cvAsset: asset}); await render();
  const link = container.querySelector('a');
  expect(link.getAttribute('href')).toBe(`${asset.url}?dl=Ali-Muhammed-Resume.pdf`);
  expect(link.hasAttribute('download')).toBe(true); expect(link.className).toBe('home-cv'); expect(link.textContent).toBe('Download my résumé');
  expect(client.fetch.mock.calls[0][0]).toContain('_id == "resumeSettings"');
  expect(client.fetch).toHaveBeenCalledTimes(1);
});
test.each([undefined, null, {}, {url: asset.url}, {...asset, mimeType: 'text/html'}, {...asset, extension: 'html'}, {...asset, url: 'javascript:alert(1)'}, {...asset, url: asset.url.replace('yv2hgb0y', 'other')}, {...asset, url: asset.url.replace('production', 'staging')}, {...asset, url: asset.url.replace('cdn.sanity.io', 'cdn.sanity.io.evil.example')}, {...asset, url: asset.url.replace('https:', 'http:')}, {...asset, url: `${asset.url}?redirect=https://evil.example`}, {...asset, url: asset.url.replace('.pdf', '.svg')}, {...asset, url: 7}])('unexpected or missing PDF asset safely falls back: %p', value => {
  expect(cvDownloadUrl(value)).toBe(local);
});
test.each([null, {}, {cvAsset: null}])('missing document or reference retains the bundled résumé: %p', async result => {
  client.fetch.mockResolvedValue(result); await render(); expect(container.querySelector('a').getAttribute('href')).toBe(local);
});
test('network failure leaves the real local PDF available', async () => {
  client.fetch.mockRejectedValue(new Error('offline')); await render(); expect(container.querySelector('a').getAttribute('href')).toBe(local);
});
test('unmount cancels the request and ignores a late valid asset', async () => {
  let resolve; client.fetch.mockReturnValue(new Promise(r => {resolve = r;})); await render();
  const signal = client.fetch.mock.calls[0][2].signal;
  await act(async () => root.render(null)); expect(signal.aborted).toBe(true);
  await act(async () => resolve({cvAsset: asset})); expect(container.textContent).toBe('');
});

test('reusing the component with another label and class preserves the same validated query and download', async () => {
  client.fetch.mockResolvedValue({cvAsset: asset});
  await act(async () => root.render(<CvDownload className="resume-cv" label="Download My Résumé" />));
  const link = container.querySelector('a'); expect(link.className).toBe('resume-cv'); expect(link.textContent).toBe('Download My Résumé');
  expect(link.href).toBe(`${asset.url}?dl=Ali-Muhammed-Resume.pdf`); expect(link.hasAttribute('download')).toBe(true);
  expect(client.fetch).toHaveBeenCalledTimes(1);
});
