import { useEffect } from "react";

const usePdfPreview = (id, file) => {
  useEffect(() => {
    if (!id || !file || !file.url) return;

    const adobeDCView = new window.AdobeDC.View({
      clientId: import.meta.env.VITE_ADOBE_PDF_EMBED_PUBLIC_KEY,
      divId: "adobe-dc-view",
    });
    adobeDCView.previewFile(
      {
        content: { location: { url: file.url } },
        metaData: { fileName: file.name },
      },
      { embedMode: "IN_LINE" },
    );
  }, [id, file]);
};

export default usePdfPreview;
