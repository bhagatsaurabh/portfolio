import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import classNames from "classnames";

import classes from "./about.module.css";
import Icon from "../common/Icon/icon.jsx";
import FeedButton from "../common/FeedButton/feed-button.jsx";
import { router } from "@/router";
import DSLRenderer from "../common/DSLRenderer/DSLRenderer";
import { formatAge } from "@/utils/age-formatter";

const About = () => {
  const summary = useSelector((state) => state.summary);
  const contact = useSelector((state) => state.contact);
  const [emailCopied, setEmailCopied] = useState(false);
  const location = useLocation();
  const isActive = location.pathname === "/about";

  useEffect(() => {
    let handle;
    if (emailCopied) {
      handle = setTimeout(() => setEmailCopied(false), 3000);
    }
    return () => clearTimeout(handle);
  }, [emailCopied]);

  const handleEmailCopy = () => {
    navigator.clipboard.writeText(contact.email);
    setEmailCopied(true);
  };

  return (
    <div
      className={classNames([
        classes.About,
        { [classes.animate]: isActive, [classes["c-animate"]]: !isActive },
      ])}
    >
      <div className={classes.Container}>
        <DSLRenderer entries={summary} />
        <div className={classNames([classes.Email, { [classes.copied]: emailCopied }])}>
          <a href={"mailto:" + contact.email}>
            <Icon name="email" size={1} />
            <span>{contact.email}</span>
          </a>
          <button onClick={() => !emailCopied && handleEmailCopy()}>
            <Icon name="copy" />
            <Icon name="check" />
          </button>
        </div>
        <div className={classes.Platforms}>
          {contact.platforms &&
            contact.platforms.map((platform) => (
              <a
                className={classes.PlatformLink}
                target="_blank"
                rel="noreferrer"
                key={platform.name}
                href={platform.link}
              >
                <Icon name={platform.name.toLowerCase()} size={1.5} />
              </a>
            ))}
        </div>
        <FeedButton
          customStyle={{ alignSelf: "unset", marginTop: "1rem" }}
          icon="resume"
          onClick={() => router.navigate("/résumé")}
        >
          {"Résumé"}
        </FeedButton>
        <span className={classes.Build}>
          Updated {formatAge(import.meta.env.VITE_BUILD_TIMESTAMP)}
        </span>
      </div>
    </div>
  );
};

export default About;
