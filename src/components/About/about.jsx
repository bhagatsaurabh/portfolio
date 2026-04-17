import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import classNames from "classnames";

import classes from "./about.module.css";
import Icon from "../common/Icon/icon.jsx";
import FeedButton from "../common/FeedButton/feed-button.jsx";
import { router } from "@/router";

const About = () => {
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
    <div className={classNames([classes.About, { [classes.animate]: isActive }])}>
      <div className={classes.Container}>
        <h4>
          I’m a frontend-leaning full-stack engineer with 6+ years of experience building scalable
          web apps and backend systems. I enjoy working across the stack—whether it’s shaping
          frontend architecture, designing APIs, setting up cloud infrastructure, or improving
          workflows with CI/CD.
        </h4>
        <h4>
          Over the years, I’ve worked in multiple domains, building end-to-end systems and finding
          ways to make development faster and more efficient through better tooling and DevOps
          practices.
        </h4>
        <div className={classes.MeContainer}>
          {
            <img
              className={classes.Me}
              alt="Me"
              src={`${import.meta.env.VITE_SB_CDN_URL}/images/me.webp`}
            />
          }
        </div>
        <h4>
          Outside of work, I’m drawn to creative and exploratory projects—I enjoy diving deep into
          ideas, especially around research and development of games and interactive systems.
          <br />
          <br />I also spend time composing instrumental music, which is a completely different kind
          of creative outlet but just as rewarding <span className={classes.Silly}>🎶</span>.
        </h4>
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
          onClick={() => router.navigate("/resumé")}
        >
          {"Résumé"}
        </FeedButton>
        <span className={classes.Copyright}>
          &copy;&nbsp;{new Date().getFullYear()}&nbsp;Saurabh Bhagat
        </span>
      </div>
    </div>
  );
};

export default About;
