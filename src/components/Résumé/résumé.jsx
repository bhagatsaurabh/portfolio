import { useMemo } from "react";
import FeedButton from "../common/FeedButton/feed-button";
import classes from "./résumé.module.css";
import usePdfPreview from "@/hooks/usePdfPreview";

const fileName = "Saurabh_Bhagat_Resume_Senior_Full_Stack_Engineer.pdf";

const Résumé = () => {
  const file = useMemo(
    () => ({
      name: fileName,
      url: `${import.meta.env.VITE_SB_CDN_URL}/data/${fileName}`,
    }),
    [],
  );
  usePdfPreview("adobe-dc-view", file);

  return (
    <div className={classes.Résumé}>
      <div className={classes.Controls}>
        <a className={classes.Download} href={file.url} download>
          <FeedButton icon="download">Download PDF</FeedButton>
        </a>
      </div>
      <div className={classes.Container}>
        <div id="adobe-dc-view"></div>
      </div>
    </div>
  );
};

export default Résumé;
