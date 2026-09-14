import { useMemo } from "react";
import { useSelector } from "react-redux";
import FeedButton from "../common/FeedButton/feed-button";
import classes from "./résumé.module.css";
import usePdfPreview from "@/hooks/usePdfPreview";
import { selectCountryCode } from "@/store/app";

const fileName = "Saurabh_Bhagat_Resume_Senior_Full_Stack_Engineer";

const Résumé = () => {
  const countryCode = useSelector(selectCountryCode);
  const resumeVersion = useMemo(() => (countryCode === "IN" ? "vN" : "vI"), [countryCode]);
  const file = useMemo(
    () => ({
      name: fileName,
      url: `${import.meta.env.VITE_SB_CDN_URL}/data/${fileName}_${resumeVersion}.pdf`,
    }),
    [resumeVersion],
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
