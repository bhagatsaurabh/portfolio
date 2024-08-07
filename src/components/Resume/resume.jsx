import { useEffect } from "react";
import FeedButton from "../common/FeedButton/feed-button";
import styles from "./resume.module.css";

const Resume = () => {
  useEffect(() => {
    const adobeDCView = new window.AdobeDC.View({
      clientId: "9ac9ff3507f9407fa6dc3f4d2bee9a4a",
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
