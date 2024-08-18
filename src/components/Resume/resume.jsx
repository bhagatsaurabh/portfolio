import { useEffect } from "react";
import FeedButton from "../common/FeedButton/feed-button";
import styles from "./resume.module.css";

const Resume = () => {
  useEffect(() => {
    const adobeDCView = new window.AdobeDC.View({
      clientId: import.meta.env.VITE_ADOBE_PDF_EMBED_APIKEY,
      divId: "adobe-dc-view",
    });
    adobeDCView.previewFile(
      {
        content: {
          location: {
            url: "/data/Resume_SaurabhBhagat.pdf",
          },
        },
        metaData: { fileName: "Resume_SaurabhBhagat.pdf" },
      },
      { embedMode: "IN_LINE" }
    );
  }, []);

  return (
    <div className={styles.Resume}>
      <a
        className={styles.Download}
        href="/data/Resume_SaurabhBhagat.pdf"
        download
      >
        <FeedButton icon="download">Download PDF</FeedButton>
      </a>
      <div className={styles.Container}>
        <div id="adobe-dc-view"></div>
      </div>
    </div>
  );
};

export default Resume;
