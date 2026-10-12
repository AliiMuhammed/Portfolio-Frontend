import React, { useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { client } from "../../Client";

const localCv = "/Ali Muhammed Ahmed.pdf";
export const cvDownloadUrl = (asset) => {
  if (asset?.mimeType !== "application/pdf" || asset?.extension !== "pdf" || typeof asset.url !== "string") return localCv;
  // Only this portfolio's public file assets may replace the bundled PDF.
  if (!/^https:\/\/cdn\.sanity\.io\/files\/yv2hgb0y\/production\/[a-f0-9]{40}\.pdf$/.test(asset.url)) return localCv;
  return `${asset.url}?dl=Ali-Muhammed-Resume.pdf`;
};

const CvDownload = () => {
  const [href, setHref] = useState(localCv);
  useEffect(() => {
    const controller = new AbortController();
    client.fetch('*[_id == "resumeSettings" && _type == "resumeSettings"][0]{"cvAsset": cvFile.asset->{url, mimeType, extension}}', {}, { signal: controller.signal })
      .then(result => { if (!controller.signal.aborted) setHref(cvDownloadUrl(result?.cvAsset)); })
      .catch(() => { /* The bundled PDF remains usable when CMS is unavailable. */ });
    return () => controller.abort();
  }, []);
  return <a className="home-cv" href={href} download><FiDownload aria-hidden="true" /><span>Download my résumé</span></a>;
};
export default CvDownload;
