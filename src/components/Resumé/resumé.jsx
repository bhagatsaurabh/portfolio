import { useMemo } from "react";
import FeedButton from "../common/FeedButton/feed-button";
import classes from "./resumé.module.css";
import usePdfPreview from "@/hooks/usePdfPreview";

const Resumé = () => {
  const file = useMemo(
    () => ({
      name: "Resume_SaurabhBhagat.pdf",
      url: `${import.meta.env.VITE_SB_CDN_URL}/data/Resume_SaurabhBhagat.pdf`,
    }),
    [],
  );
  usePdfPreview("adobe-dc-view", file);

  return (
    <div className={classes.Resumé}>
      <a className={classes.Download} href={file.url} download>
        <FeedButton icon="download">Download PDF</FeedButton>
      </a>
      <div className={classes.Container}>
        <div id="adobe-dc-view"></div>
      </div>
    </div>
  );
};

export default Resumé;
